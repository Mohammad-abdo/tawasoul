import jwt from 'jsonwebtoken';

const DEFAULT_JWT_SECRET = 'your-secret-key';

const getUniqueSecrets = (secrets) => [...new Set(secrets.filter(Boolean))];

export const getUserAccessTokenSecret = () =>
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

export const getUserAccessTokenExpiry = () =>
  process.env.ACCESS_TOKEN_EXPIRY || '1d';

export const getRefreshTokenSecret = () =>
  process.env.REFRESH_TOKEN_SECRET || DEFAULT_JWT_SECRET;

export const getRefreshTokenExpiry = () =>
  process.env.REFRESH_TOKEN_EXPIRY || '7d';

export const getGeneralJwtSecret = () =>
  process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

export const verifyUserAccessToken = (token) =>
  jwt.verify(token, getUserAccessTokenSecret());

export const verifyGeneralJwtToken = (token) =>
  jwt.verify(token, getGeneralJwtSecret());

export const verifyUserOrDoctorToken = (token) => {
  const secrets = getUniqueSecrets([
    getUserAccessTokenSecret(),
    getGeneralJwtSecret()
  ]);

  let lastError;

  for (const secret of secrets) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};
