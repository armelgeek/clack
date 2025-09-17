import { db } from '@/database/connection';
import * as schema from '@/database/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createAuthMiddleware, openAPI } from 'better-auth/plugins';
import { ErrorType } from 'types/common/error';
import { UserRole } from 'types/enums/user';

export const auth = betterAuth({
  plugins: [openAPI()],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  socialProviders: {
    google: {
      prompt: 'select_account consent',
      clientId:
        (process.env.GOOGLE_CLIENT_ID as string) ||
        '326800995087-vot6bqn575otd9k5ph5d99jq602he1vc.apps.googleusercontent.com',
      clientSecret:
        (process.env.GOOGLE_CLIENT_SECRET as string) ||
        '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',
      accessType: 'offline',
    },
    facebook: {
      clientId:
        (process.env.FACEBOOK_CLIENT_ID as string) || '1525766995338175',
      clientSecret:
        (process.env.FACEBOOK_CLIENT_SECRET as string) ||
        '1e588e7376dea912817869780c664081',
    },
    twitter: {
      clientId:
        (process.env.TWITTER_CLIENT_ID as string) ||
        'VUpGbXJNY2ZkeUtiQ1VqSlhaOUE6MTpjaQ',
      clientSecret:
        (process.env.TWITTER_CLIENT_SECRET as string) ||
        'D_PSAsUXaAgRy-nGhYAvkfSkf495jA_q8MPczWvuo3uP7Sp42Z',
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins:
    process.env.NODE_ENV === 'production'
      ? ['http://localhost:5173']
      : [
          process.env.BETTER_AUTH_URL || 'http://localhost:3000',
          process.env.REACT_APP_URL || 'http://localhost:5173',
        ],
  user: {
    modelName: 'users',
    additionalFields: {
      role: { type: 'string', defaultValue: 'user', returned: true },
    },
    deleteUser: {
      enabled: true,
    },
  },
  session: {
    modelName: 'sessions',
    additionalFields: {
      impersonatedBy: { type: 'string', defaultValue: null, returned: true },
    },
  },
  account: {
    modelName: 'accounts',
  },
  verification: {
    modelName: 'verifications',
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith('/sign-in/email')) {
        const app = ctx.getHeader('X-APP');
        const session = ctx.context.newSession;
        const user = session.user;

        const allowedRoles: Record<string, UserRole[]> = {
          CUSTOMER_APP: [UserRole.CUSTOMER],
          ADMIN_APP: [
            UserRole.PARTNER,
            UserRole.STORE_MANAGER,
            UserRole.SALES_ADVISOR,
          ],
          SUPER_ADMIN_APP: [UserRole.SUPER_ADMIN],
        };

        // Check if the user is allowed to connect
        if (!allowedRoles[app]?.includes(user.role)) {
          if (session) {
            await auth.api.revokeSession({
              body: { token: session.session.token || '' },
              headers: ctx.request.headers,
            });
          }
          return new Response(
            JSON.stringify({
              code: ErrorType.NOT_ALLOWED,
              message: 'Your role is not allowed to access this app',
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } },
          );
        }
      }
    }),
  },
});
