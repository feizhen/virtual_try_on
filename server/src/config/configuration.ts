export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  app: {
    name: process.env.APP_NAME || 'Vibe Coding Template',
    url: process.env.APP_URL || 'http://localhost:3000',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl:
      process.env.GEMINI_API_BASE_URL ||
      'https://generativelanguage.googleapis.com',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-image-preview',
    timeout: parseInt(process.env.GEMINI_TIMEOUT || '60', 10),
  },
});
