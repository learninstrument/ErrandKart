import type { Request } from 'express';
import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';
import { HttpError } from './http-error.js';

const extractBearerToken = (request: Request) => {
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

type AuthContext = {
  authUser: NonNullable<Awaited<ReturnType<typeof supabaseAuth.auth.getUser>>['data']>['user'];
  profile: Record<string, unknown> & {
    id: string;
    role: string;
    full_name?: string | null;
    account_status?: string | null;
    wallet_balance?: number;
  };
  accessToken: string;
};

export const getAuthContext = async (request: Request, required = true): Promise<AuthContext | null> => {
  const token = extractBearerToken(request);

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

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    throw new HttpError(500, 'Failed to load user profile', profileError);
  }

  if (!profile) {
    throw new HttpError(404, 'User profile not found');
  }

  if (profile.account_status === 'suspended') {
    throw new HttpError(403, 'Account suspended');
  }

  return {
    authUser: data.user,
    profile: profile as AuthContext['profile'],
    accessToken: token,
  };
};

export const requireAuth = async (request: Request) => {
  const context = await getAuthContext(request, true);
  if (!context) {
    throw new HttpError(401, 'Authorization token missing');
  }
  return context;
};
