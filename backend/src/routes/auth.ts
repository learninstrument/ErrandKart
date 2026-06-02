import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';
import { requireAuth } from '../utils/auth.js';
import { rateLimit } from '../middleware/rate-limit.js';

export const authRouter = Router();

authRouter.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
  })
);

const roleSchema = z.enum(['customer', 'runner', 'supermarket', 'admin']);

const registerSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['customer', 'runner', 'supermarket']),
  phone_number: z.string().min(6).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const resendSchema = z.object({
  email: z.string().email(),
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

  const role = resolveProfileRole(params.role);
  const insertPayload = {
    id: params.id,
    email: params.email ?? undefined,
    full_name: params.full_name ?? undefined,
    phone_number: params.phone_number ?? undefined,
    role,
  };

  const { data: created, error: insertError } = await supabaseAdmin
    .from('users')
    .insert(insertPayload)
    .select('*')
    .single();

  if (insertError) {
    throw new HttpError(500, 'Failed to create user profile', insertError);
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
        },
        emailRedirectTo: getEmailRedirectTo(),
      },
    });

    if (createError || !createdUser.user) {
      throw new HttpError(400, createError?.message ?? 'Unable to create user');
    }

    let profile;
    try {
      profile = await ensureUserProfile({
        id: createdUser.user.id,
        email: payload.email,
        full_name: payload.full_name,
        phone_number: payload.phone_number ?? null,
        role: payload.role,
      });
    } catch (error) {
      await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id).catch(cleanupError => {
        console.error('[AuthCleanup]', cleanupError);
      });
      throw error;
    }

    if (createdUser.session) {
      return response.json({
        user: profile,
        session: {
          access_token: createdUser.session.access_token,
          refresh_token: createdUser.session.refresh_token,
          expires_at: createdUser.session.expires_at,
          expires_in: createdUser.session.expires_in,
          token_type: createdUser.session.token_type,
        },
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
        return response.status(403).json({
          message: 'Email not confirmed',
          verificationRequired: true,
          email: payload.email,
        });
      }
      throw new HttpError(401, message);
    }

    if (!sessionData.user.email_confirmed_at) {
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

    response.json({
      user: profile,
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at: sessionData.session.expires_at,
        expires_in: sessionData.session.expires_in,
        token_type: sessionData.session.token_type,
      },
      nextPath: toNextPath(profile.role),
    });
  })
);

authRouter.post(
  '/resend',
  asyncHandler(async (request, response) => {
    const payload = resendSchema.parse(request.body);

    const { error } = await supabaseAuth.auth.resend({
      type: 'signup',
      email: payload.email,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
      },
    });

    if (error) {
      throw new HttpError(400, error.message ?? 'Failed to resend verification email');
    }

    response.json({ status: 'sent' });
  })
);

authRouter.post(
  '/logout',
  asyncHandler(async (request, response) => {
    const { accessToken } = await requireAuth(request);

    const { error } = await supabaseAdmin.auth.admin.signOut(accessToken, 'global');
    if (error) {
      throw new HttpError(400, error.message ?? 'Failed to sign out');
    }

    response.json({ status: 'signed_out' });
  })
);

authRouter.get(
  '/google/start',
  asyncHandler(async (request, response) => {
    const role = resolveProfileRole(String(request.query.role ?? 'customer'));
    const statePayload = {
      role,
      nonce: crypto.randomUUID(),
    };
    const state = Buffer.from(JSON.stringify(statePayload), 'utf8').toString('base64url');
    const redirectTo = `${getApiBaseUrl()}/api/auth/google/callback`;

    const { data, error } = await supabaseAuth.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          state,
        },
      },
    });

    if (error || !data?.url) {
      throw new HttpError(400, error?.message ?? 'Unable to start Google authentication');
    }

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
      throw new HttpError(400, 'Missing OAuth code');
    }

    const { data, error: exchangeError } = await supabaseAuth.auth.exchangeCodeForSession(code);
    if (exchangeError || !data.session || !data.user) {
      throw new HttpError(400, exchangeError?.message ?? 'Unable to exchange OAuth code');
    }

    let roleFromState: string | null = null;
    if (request.query.state) {
      try {
        const decoded = JSON.parse(Buffer.from(String(request.query.state), 'base64url').toString('utf8'));
        roleFromState = typeof decoded?.role === 'string' ? decoded.role : null;
      } catch {
        roleFromState = null;
      }
    }

    let profile;
    try {
      profile = await ensureUserProfile({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name,
        role: roleFromState ?? data.user.user_metadata?.role,
      });
    } catch (error) {
      if (error instanceof HttpError && error.statusCode === 403) {
        const params = new URLSearchParams({
          oauth_error: 'account_suspended',
          oauth_error_description: error.message,
        });
        return response.redirect(`${getAppOrigin()}/login?${params.toString()}`);
      }
      throw error;
    }

    const nextPath = toNextPath(profile.role);
    const params = new URLSearchParams({
      oauth_provider: 'google',
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      role: profile.role,
      next_path: nextPath,
    });

    if (typeof data.session.expires_at === 'number') {
      params.set('expires_at', String(data.session.expires_at));
    }

    response.redirect(`${getAppOrigin()}/login?${params.toString()}`);
  })
);
