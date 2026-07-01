import crypto from 'node:crypto';
import { Router, type Request, type Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { env } from '../config/env.js';
import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js'
import { rateLimit } from '../middleware/rate-limit.js';

export const authRouter = Router();

// Log every incoming request to the terminal so we can easily debug traffic and status codes
authRouter.use((request, response, next) => {
  const start = Date.now();
  response.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${request.method}] ${request.originalUrl || request.url} - Status: ${response.statusCode} (${duration}ms)`);
  });
  next();
});

authRouter.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
  })
);

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as const,
  path: '/',
});

const setAuthCookies = (response: Response, session: { access_token: string; refresh_token: string; expires_in?: number }) => {
  response.cookie('access_token', session.access_token, {
    ...getCookieOptions(),
    maxAge: (session.expires_in ?? 3600) * 1000,
  });
  response.cookie('refresh_token', session.refresh_token, {
    ...getCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days fallback
  });
};

const clearAuthCookies = (response: Response) => {
  response.clearCookie('access_token', getCookieOptions());
  response.clearCookie('refresh_token', getCookieOptions());
  response.clearCookie('device_id', getCookieOptions());
};

const registerDevice = async (userId: string, response: Response) => {
  const deviceId = crypto.randomUUID();
  await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: { device_id: deviceId } });
  response.cookie('device_id', deviceId, {
    ...getCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const extractToken = (request: Request) => {
  // 1. Try reading the token from the HttpOnly cookie first
  const cookieToken = request.cookies?.access_token;
  if (cookieToken) {
    return cookieToken;
  }

  // 2. Fallback to Authorization header (useful for testing with Postman)
  const header = request.headers.authorization;
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token.trim();
};

export type AuthContext = {
  authUser: NonNullable<Awaited<ReturnType<typeof supabaseAuth.auth.getUser>>['data']>['user'];
  profile: Record<string, unknown> & {
    id: string;
    role: string;
    full_name?: string | null;
    gender?: string | null;
    account_status?: string | null;
    wallet_balance?: number;
  };
  accessToken: string;
};

export const getAuthContext = async (request: Request, required = true): Promise<AuthContext | null> => {
  const token = extractToken(request);

  if (!token) {
    if (required) {
      throw new HttpError(401, 'Authorization token missing');
    }
    return null;
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) {
    throw new HttpError(401, error?.message ?? 'Invalid or expired token');
  }

  const reqDeviceId = request.cookies?.device_id;
  const userDeviceId = data.user.user_metadata?.device_id;
  if (userDeviceId && userDeviceId !== reqDeviceId) {
    throw new HttpError(401, 'Session terminated. Your account was logged in from another device.');
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) throw new HttpError(500, 'Failed to load user profile', profileError);
  if (!profile) throw new HttpError(404, 'User profile not found');
  if (profile.account_status === 'suspended') throw new HttpError(403, 'Account suspended');

  return {
    authUser: data.user,
    profile: profile as AuthContext['profile'],
    accessToken: token,
  };
};

export const requireAuth = async (request: Request) => {
  const context = await getAuthContext(request, true);
  if (!context) throw new HttpError(401, 'Authorization token missing');
  return context;
};

const roleSchema = z.enum(['customer', 'runner', 'supermarket', 'admin']);

const registerSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required'),
  email: z.string().email().toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*?&#]/, 'Password must contain at least one special character'),
  role: z.enum(['customer', 'runner', 'supermarket']),
  phone_number: z.string().max(12, 'Phone number must not exceed 12 digits').optional().or(z.literal('')),
  gender: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(6),
  role: z.enum(['customer', 'runner', 'supermarket', 'admin']).optional(),
});

const resendSchema = z.object({
  email: z.string().email().toLowerCase(),
  type: z.string().optional().default('signup'),
});

const verifyOtpSchema = z.object({
  email: z.string().email().toLowerCase().optional(),
  phone: z.string().optional(),
  code: z.string().trim().min(6),
  type: z.string().optional().default('signup'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

const resetPasswordSchema = z.object({
  token_hash: z.string().min(1, 'Token hash is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*?&#]/, 'Password must contain at least one special character'),
});

const toNextPath = (role: string) => {
  switch (role) {
    case 'runner':
      return '/runner/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'supermarket':
      return '/supermarket/register';
    case 'customer':
    default:
      return '/customer/dashboard';
  }
};

const getApiBaseUrl = () => {
  return env.API_BASE_URL ?? `http://localhost:${env.PORT}`;
};

const getAppOrigin = () => {
  return env.APP_ORIGIN ?? 'http://localhost:5173';
};

const getEmailRedirectTo = () => `${getAppOrigin()}/login?verified=1`;

const resolveProfileRole = (role?: string | null) => {
  if (!role) {
    return 'customer';
  }
  const parsed = roleSchema.safeParse(role);
  return parsed.success ? parsed.data : 'customer';
};

const ensureUserProfile = async (params: {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone_number?: string | null;
  gender?: string | null;
  role?: string | null;
}) => {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (existingError) {
    throw new HttpError(500, 'Failed to load user profile', existingError);
  }

  if (existing) {
    if (existing.account_status === 'suspended') {
      throw new HttpError(403, 'Account suspended');
    }
    return existing;
  }

  // Prevent 500 errors when an email is orphaned in public.users but deleted from auth.users
  if (params.email) {
    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', params.email)
      .maybeSingle();

    if (existingEmail && existingEmail.id !== params.id) {
      throw new HttpError(409, 'An incomplete profile exists for this email. Please contact support or use a different email.');
    }
  }

  const role = resolveProfileRole(params.role);
  const insertPayload = {
    id: params.id,
    email: params.email ?? undefined,
    full_name: params.full_name ?? undefined,
    phone_number: params.phone_number ?? undefined,
    role,
    gender: params.gender ?? undefined,
  };

  const { data: created, error: insertError } = await supabaseAdmin
    .from('users')
    .insert(insertPayload)
    .select('*')
    .single();

  if (insertError) {
    throw new HttpError(500, 'Failed to create user profile', insertError);
  }

  if (created.role === 'runner') {
    const { error: runnerError } = await supabaseAdmin
      .from('runner_profiles')
      .insert({ user_id: created.id });

    if (runnerError) {
      throw new HttpError(500, 'Failed to initialize runner profile', runnerError);
    }
  }

  return created;
};

authRouter.post(
  '/register',
  asyncHandler(async (request, response) => {
    const payload = registerSchema.parse(request.body);

    const { data: createdUser, error: createError } = await supabaseAuth.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.full_name,
          role: payload.role,
          gender: payload.gender,
        },
        emailRedirectTo: getEmailRedirectTo(),
      },
    });

    if (createError || !createdUser.user) {
      console.error('[Auth Error - Register]:', createError);
      throw new HttpError(400, 'Unable to create user account. Please try again.');
    }

    let targetUser = createdUser.user;

    // Handle existing users trying to register again
    if (targetUser.identities && targetUser.identities.length === 0) {
      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', payload.email)
        .maybeSingle();

      if (dbUser) {
        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(dbUser.id);
        if (authData?.user) {
          if (authData.user.email_confirmed_at) {
            throw new HttpError(409, 'Account already exists and is verified. Please log in.');
          } else {
            // User exists but is unconfirmed! Resend the OTP and let them verify using the new code.
            await supabaseAuth.auth.resend({
              type: 'signup',
              email: payload.email,
              options: { emailRedirectTo: getEmailRedirectTo() }
            });
            targetUser = authData.user;
          }
        } else {
          throw new HttpError(409, 'Account already exists. Please log in.');
        }
      } else {
        throw new HttpError(409, 'Account already exists. Please log in.');
      }
    }

    let profile;
    try {
      profile = await ensureUserProfile({
        id: targetUser.id,
        email: payload.email,
        full_name: payload.full_name,
        phone_number: payload.phone_number ?? null,
        gender: payload.gender,
        role: payload.role,
      });
    } catch (error) {
      // Only clean up the auth user if we were creating a brand new one
      if (createdUser.user.identities && createdUser.user.identities.length > 0) {
        await supabaseAdmin.auth.admin.deleteUser(targetUser.id).catch(cleanupError => {
          console.error('[AuthCleanup]', cleanupError);
        });
      }
      throw error;
    }

    if (createdUser.session) {
      setAuthCookies(response, createdUser.session);
      await registerDevice(targetUser.id, response);
      return response.json({
        user: profile,
        nextPath: toNextPath(profile.role),
      });
    }

    return response.status(202).json({
      user: profile,
      verificationRequired: true,
      email: payload.email,
    });
  })
);

const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per 15 minutes
});

authRouter.post(
  '/verify-otp',
  otpRateLimiter,
  asyncHandler(async (request, response) => {
    const payload = verifyOtpSchema.parse(request.body);

    const { data, error } = await supabaseAuth.auth.verifyOtp({
      ...(payload.email ? { email: payload.email } : {}),
      ...(payload.phone ? { phone: payload.phone } : {}),
      token: payload.code,
      type: payload.type as any,
    } as any);

    if (error || !data.user || !data.session) {
      // Check if an email scanner already clicked the link and verified the user!
      if (error?.message?.toLowerCase().includes('expired') || error?.message?.toLowerCase().includes('invalid')) {
        if (payload.email) {
          const { data: dbUser } = await supabaseAdmin.from('users').select('id').eq('email', payload.email).maybeSingle();
          if (dbUser) {
            const { data: authData } = await supabaseAdmin.auth.admin.getUserById(dbUser.id);
            if (authData?.user?.email_confirmed_at) {
              throw new HttpError(400, 'Your email is already verified! (Your email provider likely auto-verified it). Please click "Back to Login" and log in with your password.');
            }
          }
        }
      }

      console.error('[Auth Error - Verify OTP]:', error);
      throw new HttpError(400, 'Invalid or expired verification code. Please request a new one.');
    }

    const profile = await ensureUserProfile({
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata?.full_name,
      role: data.user.user_metadata?.role,
    });

    setAuthCookies(response, data.session);
    await registerDevice(data.user.id, response);

    response.json({
      user: profile,
      nextPath: toNextPath(profile.role),
    });
  })
);

authRouter.post(
  '/login',
  asyncHandler(async (request, response) => {
    const payload = loginSchema.parse(request.body);

    const { data: sessionData, error: signInError } = await supabaseAuth.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (signInError || !sessionData.session || !sessionData.user) {
      const message = signInError?.message ?? 'Invalid login credentials';
      if (message.toLowerCase().includes('confirm')) {
        await supabaseAuth.auth.resend({ 
          type: 'signup', 
          email: payload.email,
          options: { emailRedirectTo: getEmailRedirectTo() }
        });
        return response.status(403).json({
          message: 'Email not confirmed',
          verificationRequired: true,
          email: payload.email,
        });
      }
      console.error('[Auth Error - Login]:', signInError);
      throw new HttpError(401, 'Invalid login credentials');
    }

    if (!sessionData.user.email_confirmed_at) {
      await supabaseAuth.auth.resend({ 
        type: 'signup', 
        email: payload.email,
        options: { emailRedirectTo: getEmailRedirectTo() }
      });
      return response.status(403).json({
        message: 'Email not confirmed',
        verificationRequired: true,
        email: payload.email,
      });
    }

    const profile = await ensureUserProfile({
      id: sessionData.user.id,
      email: sessionData.user.email,
      full_name: sessionData.user.user_metadata?.full_name,
      role: sessionData.user.user_metadata?.role,
    });

    if (payload.role && profile.role !== payload.role && profile.role !== 'admin') {
      throw new HttpError(403, `Access denied. This account is registered as a ${profile.role.toUpperCase()}.`);
    }

    setAuthCookies(response, sessionData.session);
    await registerDevice(sessionData.user.id, response);

    response.json({
      user: profile,
      nextPath: toNextPath(profile.role),
    });
  })
);

authRouter.post(
  '/resend',
  asyncHandler(async (request, response) => {
    const payload = resendSchema.parse(request.body);

    const { error } = await supabaseAuth.auth.resend({ 
      type: payload.type as any, 
      email: payload.email,
      options: { emailRedirectTo: getEmailRedirectTo() }
    });

    if (error) {
      console.error('[Auth Error - Resend OTP]:', error);
      throw new HttpError(400, 'Failed to resend verification email. Please try again later.');
    }

    response.json({ status: 'sent' });
  })
);

authRouter.post(
  '/forgot-password',
  asyncHandler(async (request, response) => {
    const payload = forgotPasswordSchema.parse(request.body);

    const { error } = await supabaseAuth.auth.resetPasswordForEmail(payload.email);

    if (error) {
      console.error('[Auth Error - Forgot Password]:', error);
      // Return success regardless to prevent email enumeration attacks
      return response.json({ message: 'If an account exists, a password reset link has been sent to your email.' });
    }

    response.json({ message: 'If an account exists, a password reset link has been sent to your email.' });
  })
);

authRouter.post(
  '/reset-password',
  asyncHandler(async (request, response) => {
    const payload = resetPasswordSchema.parse(request.body);

    const sbClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error: verifyError } = await sbClient.auth.verifyOtp({
      token_hash: payload.token_hash,
      type: 'recovery',
    });
    if (verifyError || !data.session || !data.user) {
      console.error('[Auth Error - Reset Password Verify]:', verifyError);
      throw new HttpError(400, 'Invalid or expired password reset link. Please request a new one.');
    }

    const { error: updateError } = await sbClient.auth.updateUser({ password: payload.password });
    if (updateError) {
      console.error('[Auth Error - Reset Password Update]:', updateError);
      throw new HttpError(400, 'Failed to update password. Please try again.');
    }

    await sbClient.auth.signOut(); // Clean up temporary session
    response.json({ message: 'Password updated successfully' });
  })
);

authRouter.get(
  '/me',
  asyncHandler(async (request, response) => {
    const context = await getAuthContext(request, false);
    if (!context) {
      return response.json({ user: null });
    }
    response.json({ user: context.profile });
  })
);

authRouter.put(
  '/profile',
  asyncHandler(async (request, response) => {
    const context = await requireAuth(request);
    const authUser = context.authUser;
    if (!authUser) throw new HttpError(401, 'Unauthorized');
    const { full_name, gender, phone_number } = request.body;

    const payload: any = {};
    if (full_name !== undefined) payload.full_name = full_name;
    if (gender !== undefined) payload.gender = gender === '' ? null : gender;
    if (phone_number !== undefined) payload.phone_number = phone_number === '' ? null : phone_number;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(payload)
      .eq('id', authUser.id)
      .select('*')
      .single();

    if (error) {
      console.error('[Profile Update Database Error]:', error);
      throw new HttpError(500, 'Failed to update profile', error);
    }

    // Also keep Supabase Auth in sync
    await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
      user_metadata: {
        ...authUser.user_metadata,
        ...payload
      }
    });

    response.json({ user: data });
  })
);

authRouter.post(
  '/logout',
  asyncHandler(async (request, response) => {
    // ALWAYS clear the cookies first so the browser successfully logs out locally!
    clearAuthCookies(response);

    try {
      const context = await getAuthContext(request, false);
      if (context?.accessToken) {
        await supabaseAdmin.auth.admin.signOut(context.accessToken, 'global');
      }
    } catch (error) {
      console.error('[Auth Error - Logout Non-Fatal]:', error);
    }

    response.json({ status: 'signed_out' });
  })
);

authRouter.get(
  '/google/start',
  asyncHandler(async (request, response) => {
    const role = resolveProfileRole(String(request.query.role ?? 'customer'));
    const redirectTo = `${getApiBaseUrl()}/api/auth/google/callback`;

    let pkceVerifier = '';
    const storage: Record<string, string> = {};
    const sbClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        flowType: 'pkce',
        storage: {
          getItem: (key) => storage[key] ?? null,
          setItem: (key, value) => { 
            storage[key] = value; 
            if (key.endsWith('-code-verifier')) {
              pkceVerifier = value;
            }
          },
          removeItem: (key) => { delete storage[key]; },
        },
      },
    });

    const { data, error } = await sbClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          prompt: 'select_account', // Forces Google to show the account chooser every time
        },
      },
    });

    if (error || !data?.url) {
      console.error('[Auth Error - Google OAuth Start]:', error);
      throw new HttpError(400, 'Unable to start Google authentication. Please try again.');
    }

    if (pkceVerifier) {
      response.cookie('oauth_pkce_verifier', pkceVerifier, { ...getCookieOptions(), maxAge: 10 * 60 * 1000 });
    } else {
      console.error('[Auth Error - Google OAuth Start]: Failed to securely generate PKCE verifier');
    }

    // Securely save the selected role in a cookie so we can assign it when they come back
    response.cookie('oauth_role', role, { ...getCookieOptions(), maxAge: 10 * 60 * 1000 });

    response.redirect(data.url);
  })
);

authRouter.get(
  '/google/callback',
  asyncHandler(async (request, response) => {
    const error = request.query.error ? String(request.query.error) : null;
    const errorDescription = request.query.error_description ? String(request.query.error_description) : null;

    if (error) {
      const params = new URLSearchParams({
        oauth_error: error,
        oauth_error_description: errorDescription ?? 'Google authentication failed',
      });
      return response.redirect(`${getAppOrigin()}/login?${params.toString()}`);
    }

    const code = request.query.code ? String(request.query.code) : null;
    if (!code) {
      const params = new URLSearchParams({
        oauth_error: 'invalid_request',
        oauth_error_description: 'Missing OAuth code',
      });
      return response.redirect(`${getAppOrigin()}/login?${params.toString()}`);
    }

    const codeVerifier = request.cookies?.oauth_pkce_verifier;
    
    if (!codeVerifier) {
      // Log to the terminal for developers (Users won't see this)
      console.error('[Auth Error - Google OAuth Callback]: PKCE verifier cookie is missing. The browser likely blocked the cross-site cookie during the redirect.');
    }

    const sbClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        flowType: 'pkce',
        persistSession: true, // MUST be true so Supabase actually reads from the custom storage below
        autoRefreshToken: false,
        storage: {
          getItem: (key) => key.endsWith('-code-verifier') ? codeVerifier : null,
          setItem: () => {},
          removeItem: () => {},
        },
      },
    });

    const { data, error: exchangeError } = await sbClient.auth.exchangeCodeForSession(code);
    response.clearCookie('oauth_pkce_verifier', getCookieOptions());

    if (exchangeError || !data.session || !data.user) {
      // 1. Log the highly technical error securely in the backend terminal for developers
      console.error('[Auth Error - Google OAuth Exchange Failed]:', exchangeError?.message ?? 'Unknown error', exchangeError);

      // 2. Send a generic, user-friendly error to the frontend URL
      const params = new URLSearchParams({
        oauth_error: 'exchange_failed',
        oauth_error_description: 'Secure authentication failed. Please try again or use a different login method.',
      });
      return response.redirect(`${getAppOrigin()}/login?${params.toString()}`);
    }

    const roleFromCookie = request.cookies?.oauth_role ?? null;
    response.clearCookie('oauth_role', getCookieOptions());

    let profile;
    try {
      profile = await ensureUserProfile({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name,
        role: roleFromCookie ?? data.user.user_metadata?.role,
      });

      if (roleFromCookie && profile.role !== roleFromCookie && profile.role !== 'admin') {
        throw new HttpError(403, `Access denied. This account is registered as a ${profile.role.toUpperCase()}.`);
      }
    } catch (error) {
      console.error('[GoogleOAuthProfileError]', error);
      const isForbidden = error instanceof HttpError && error.statusCode === 403;
      const params = new URLSearchParams({
        oauth_error: isForbidden ? 'access_denied' : 'server_error',
        oauth_error_description: isForbidden ? error.message : 'Failed to set up your profile. Please try again later.',
      });
      return response.redirect(`${getAppOrigin()}/login?${params.toString()}`);
    }

    setAuthCookies(response, data.session);
    await registerDevice(data.user.id, response);

    const nextPath = toNextPath(profile.role);
    const params = new URLSearchParams({
      oauth_provider: 'google',
      role: profile.role,
      next_path: nextPath,
    });

    response.redirect(`${getAppOrigin()}/login?${params.toString()}`);
  })
);
