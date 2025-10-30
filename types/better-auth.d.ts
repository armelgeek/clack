// Type adaptation for better-auth to ensure compatibility with local Auth usage
export type Auth = ReturnType<typeof import('better-auth').betterAuth>;
