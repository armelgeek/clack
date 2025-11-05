import { db } from '@/database/connection';
import * as schema from '@/database/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createAuthMiddleware, openAPI, twoFactor } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import { ErrorType } from 'types/common/error';
import { UserRole } from 'types/enums/user';
import { MailService } from '../mail/mail.service';


export const APP_CONFIG = {
  CUSTOMER_APP: {
    url: process.env.REACT_APP_URL_CLIENT || 'https://staging.clicknvape.fr',
    roles: [UserRole.CUSTOMER],
  },
  ADMIN_APP: {
    url: process.env.REACT_APP_URL_ADMIN || 'https://staging.store.clicknvape.fr',
    roles: [UserRole.PARTNER, UserRole.STORE_MANAGER, UserRole.SALES_ADVISOR],
  },
  SUPER_ADMIN_APP: {
    url: process.env.REACT_APP_URL_SUPERADMIN || 'https://staging.admin.clicknvape.fr',
    roles: [UserRole.SUPER_ADMIN],
  },
} as const;

const mailServiceInstance = new MailService();

// ✅ Helper to determine cookie name and prefix
const getCookieName = (app?: string): string => {
  const prefix = process.env.AUTH_COOKIE_PREFIX || 'clicknvape_app';
  return `${prefix}_${app || 'default'}_session`;
};

export const auth = betterAuth({
  plugins: [openAPI(), twoFactor()],

  database: drizzleAdapter(db, { provider: 'pg', schema }),

  socialProviders: {
    google: {
      prompt: 'select_account consent',
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      accessType: 'offline',
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    },
  },

  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

  trustedOrigins:
    process.env.NODE_ENV === 'production'
      ? [
        process.env.REACT_APP_URL_SUPERADMIN!,
        process.env.REACT_APP_URL_ADMIN!,
        process.env.REACT_APP_URL_CLIENT!,
      ].filter(Boolean)
      : [
        process.env.BETTER_AUTH_URL || 'http://localhost:3000',
        process.env.REACT_APP_URL_SUPERADMIN || 'http://localhost:5174',
        process.env.REACT_APP_URL_ADMIN || 'http://localhost:5173',
        process.env.REACT_APP_URL_CLIENT || 'http://localhost:5173',
        'http://localhost:5173',
      ],

  user: {
    modelName: 'users',
    additionalFields: {
      role: { type: 'string', defaultValue: 'customer', returned: true, optional: true },
      phoneNumber: { type: 'string', defaultValue: null, returned: true, optional: true },
      birthday: { type: 'string', defaultValue: null, returned: true, optional: true },
    },
    deleteUser: { enabled: true },
  },

  session: {
    modelName: 'sessions',
    expiresIn: 15 * 60, // 15 min
    updateAge: 5 * 60, // 5 min
    additionalFields: {
      impersonatedBy: { type: 'string', defaultValue: null, returned: true },
    },
  },

  account: { modelName: 'accounts' },
  verification: { modelName: 'verifications' },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: process.env.AUTH_AUTO_SIGN_IN !== 'false',
    requireEmailVerification: false,
    sendResetPassword: async ({ user, token }) => {
      const resetUrl = `${process.env.REACT_APP_URL_SUPERADMIN}/reset-password?token=${token}`;

      const storeData = await db.query.storeUsers.findFirst({
        where: eq(schema.storeUsers.userId, user.id),
        with: { store: true },
      });

      const storeName = storeData?.store?.name || 'VAPOSTORE';
      await mailServiceInstance.sendResetPasswordEmail(user.email, storeName, resetUrl);
    },
  },

  /**
   * ✅ Advanced cookie setup for subdomain sharing
   */
  advanced: {
    cookiePrefix: process.env.AUTH_COOKIE_PREFIX || 'clicknvape_app',
    crossSubDomainCookies:
      process.env.NODE_ENV === 'production'
        ? {
          enabled: true,
          domain: '.clicknvape.fr', // 👈 shared cookie for all subdomains
        }
        : undefined,
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith('/get-session')) {
        const origin = ctx.getHeader('Origin') || ctx.getHeader('Referer') || '';
        const session = ctx.context.newSession;
        
        const detectedApp = Object.entries(APP_CONFIG).find(([_, config]) =>
          origin.includes(new URL(config.url).hostname),
        )?.[0];

        if (!session) {
          return;
        }
        const user = session.user;
        if (detectedApp && !APP_CONFIG[detectedApp].roles.includes(user.role)) {
          await auth.api.signOut({ headers: ctx.request.headers }); // Invalidate session
          return new Response(
            JSON.stringify({ message: 'Session invalidated' }),
            {
              status: 200,
            },
          );
        }
      }

    }),
    after: createAuthMiddleware(async (ctx) => {
      // 🎯 Restrict roles per app
      if (ctx.path.startsWith('/sign-in/email')) {
        const app = ctx.getHeader('X-APP');
        const session = ctx.context.newSession;
        const user = session.user;


        const allowedRoles: Record<string, UserRole[]> = {
          CUSTOMER_APP: [UserRole.CUSTOMER],
          ADMIN_APP: [UserRole.PARTNER, UserRole.STORE_MANAGER, UserRole.SALES_ADVISOR],
          SUPER_ADMIN_APP: [UserRole.SUPER_ADMIN],
        };

        if (app && allowedRoles[app] && !allowedRoles[app].includes(user.role)) {
          // Delete session from DB
          if (session && session.session.id) {
            await db.delete(schema.sessions).where(eq(schema.sessions.id, session.session.id));
          }

          // ❌ Clear cookie (with subdomain-safe domain)
          const cookieName = getCookieName(app);
          const cookieHeader = `${cookieName}=; Path=/; ${process.env.NODE_ENV === 'production' ? 'Domain=.clicknvape.fr;' : ''
            } Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax;`;

          return new Response(
            JSON.stringify({
              code: ErrorType.NOT_ALLOWED,
              message: 'Your role is not allowed to access this app',
            }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': cookieHeader,
              },
            },
          );
        }
      }

      // 🔐 Send confirmation email after password change
      if (ctx.path.startsWith('/change-password')) {
        const sessionResult = await auth.api.getSession({ headers: ctx.request.headers });
        const user = sessionResult?.user;
        if (user?.email) {
          try {
            const storeData = await db.query.storeUsers.findFirst({
              where: eq(schema.storeUsers.userId, user.id),
              with: { store: true },
            });

            if (storeData?.store?.name) {
              await mailServiceInstance.sendPasswordUpdateEmail(user.email, storeData.store.name);
            }
          } catch (error) {
            console.error('Erreur dans le hook après changement de mot de passe:', error);
          }
        }
      }
    }),
  },
});
