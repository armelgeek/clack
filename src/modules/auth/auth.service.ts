import { db } from '@/database/connection';
import * as schema from '@/database/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createAuthMiddleware, openAPI, twoFactor } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import { ErrorType } from 'types/common/error';
import { UserRole } from 'types/enums/user';
import { MailService } from '../mail/mail.service';

const mailServiceInstance = new MailService();

export const auth = betterAuth({
  plugins: [openAPI(), twoFactor()],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  socialProviders: {
    google: {
      prompt: 'select_account consent',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: 'offline',
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins:
    process.env.NODE_ENV === 'production'
      ? [
          process.env.REACT_APP_URL_SUPERADMIN || 'http://localhost:5173',
          process.env.REACT_APP_URL_ADMIN || 'http://localhost:5174',
          process.env.REACT_APP_URL_CLIENT || 'http://localhost:5173',
          process.env.SUPER_ADMIN_APP_URL || 'http://localhost:5173',
        ]
      : [
          process.env.BETTER_AUTH_URL || 'http://localhost:3000',
          process.env.REACT_APP_URL_SUPERADMIN || 'http://localhost:5174',
          process.env.REACT_APP_URL_ADMIN || 'http://localhost:5173',
          process.env.REACT_APP_URL_CLIENT || 'http://localhost:5173',
          process.env.SUPER_ADMIN_APP_URL || 'http://localhost:5174',
        ],
  user: {
    modelName: 'users',
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'customer',
        returned: true,
        optional: true,
      },
      phoneNumber: {
        type: 'string',
        defaultValue: null,
        returned: true,
        optional: true,
      },
      birthday: {
        type: 'string',
        defaultValue: null,
        returned: true,
        optional: true,
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
  session: {
    modelName: 'sessions',
    expiresIn: 15 * 60, // 15 minutes
    updateAge: 5 * 60, // 5 minutes
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
    autoSignIn: process.env.AUTH_AUTO_SIGN_IN !== 'false',
    requireEmailVerification: false,
    sendResetPassword: async ({ user, token }) => {
  const resetUrl = `${process.env.REACT_APP_URL_SUPERADMIN}/reset-password?token=${token}`;

      // Use schema.* references to avoid cross-module drizzle type mismatches
      const storeData = await db.query.storeUsers.findFirst({
        where: eq(schema.storeUsers.userId, user.id),
        with: { store: true },
      });

      const storeName = storeData?.store?.name || 'VAPOSTORE';

      await mailServiceInstance.sendResetPasswordEmail(
        user.email,
        storeName,
        resetUrl,
      );
    },
  },
  advanced: {
    cookiePrefix: process.env.AUTH_COOKIE_PREFIX || 'clicknvape_app',
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Check if the user is allowed to access the app
      if (ctx.path.startsWith('/sign-in/email')) {
        const app = ctx.getHeader('X-APP');
        const session = ctx.context.newSession;
        const user = session.user;

        // Define allowed roles per app
        const allowedRoles: Record<string, UserRole[]> = {
          CUSTOMER_APP: [UserRole.CUSTOMER],
          ADMIN_APP: [
            UserRole.PARTNER,
            UserRole.STORE_MANAGER,
            UserRole.SALES_ADVISOR,
          ],
          SUPER_ADMIN_APP: [UserRole.SUPER_ADMIN],
        };

        // Check if app header is provided and validate role
        if (app && allowedRoles[app]) {
          if (!allowedRoles[app].includes(user.role)) {
            // Delete session if role not allowed
            if (session && session.session.id) {
              // Use schema.sessions to avoid duplicate symbol import issues
              await db.delete(schema.sessions).where(
                eq(schema.sessions.id, session.session.id),
              );
            }

            const cookieName = `${process.env.AUTH_COOKIE_PREFIX || 'clicknvape_app'}-session`;
            const cookieHeader = `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax;`;

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
      }

      // Send confirmation email after changing the password
      if (ctx.path.startsWith('/change-password')) {
        const sessionResult = await auth.api.getSession({
          headers: ctx.request.headers,
        });

        const user = sessionResult?.user;

        if (user && user.email) {
          try {
            // Use schema.* references to avoid cross-module drizzle type mismatches
            const storeData = await db.query.storeUsers.findFirst({
              where: eq(schema.storeUsers.userId, user.id),
              with: { store: true },
            });

            if (storeData?.store?.name) {
              await mailServiceInstance.sendPasswordUpdateEmail(
                user.email,
                storeData.store.name,
              );
            }
          } catch (error) {
            console.error(
              'Erreur dans le hook après changement de mot de passe:',
              error,
            );
          }
        }
      }
    }),
  },
});
