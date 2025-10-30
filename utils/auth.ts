export const generateBasicAuthToken = (username, password): string => {
  return Buffer.from(`${username}:${password}`).toString('base64');
};
