import { createRemoteJWKSet, jwtVerify } from 'jose';

// WSO2 Asgardeo JWKS endpoint for token verification
const ASGARDEO_BASE_URL = process.env.ASGARDEO_BASE_URL || 'https://api.asgardeo.io/t/medidrip';
const JWKS = createRemoteJWKSet(new URL(`${ASGARDEO_BASE_URL}/oauth2/jwks`));

/**
 * Authentication middleware that verifies the JWT access token
 * from WSO2 Asgardeo and attaches the user ID to the request.
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${ASGARDEO_BASE_URL}/oauth2/token`,
    });

    // Attach user info to request
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
