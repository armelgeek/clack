const { S3_ACCESS_KEY, S3_SECRET_KEY, S3_HOST, BUCKET_NAME } = process.env;

const config = () => {
  return {
    databaseUrl:
      process.env.DATABASE_URL ||
      'postgresql://postgres:root@localhost:5432/clicknvape?search_path=public',
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    appUrl: process.env.REACT_APP_URL || 'http://localhost:5173',
    superAdminAppUrl:
      process.env.SUPER_ADMIN_APP_URL || 'http://localhost:5174',
    nextoreApi: {
      url: process.env.NEXTORE_API_URL,
      username: process.env.NEXTORE_API_USERNAME,
      password: process.env.NEXTORE_API_PASSWORD,
    },
    objectStorage: {
      accessKey: S3_ACCESS_KEY,
      secretKey: S3_SECRET_KEY,
      bucketName: BUCKET_NAME,
      url: S3_HOST,
    },
  };
};
export default config;
