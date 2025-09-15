import { db } from '@/database/connection'
import * as schema from '@/database/schema'
import { betterAuth, type User } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { openAPI } from 'better-auth/plugins'
export const auth = betterAuth({
    plugins: [
        openAPI(),
    ],
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema
    }),
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    trustedOrigins:
        process.env.NODE_ENV === 'production'
            ? ['http://localhost:5173']
            : [process.env.BETTER_AUTH_URL || 'http://localhost:3000', process.env.REACT_APP_URL || 'http://localhost:5173'],
    user: {
        modelName: 'users',
        deleteUser: {
            enabled: true
        }
    },
    session: {
        modelName: 'sessions',
        additionalFields: {
            impersonatedBy: { type: 'string', default: null, returned: true }
        }
    },
    account: {
        modelName: 'accounts'
    },
    verification: {
        modelName: 'verifications'
    },
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true,
        requireEmailVerification: false
    }
})