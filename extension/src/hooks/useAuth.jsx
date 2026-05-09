import { useState, useEffect, useCallback, createContext, useContext } from 'react';

/**
 * Custom authentication hook for Chrome extensions using
 * chrome.identity.launchWebAuthFlow() with OAuth 2.0 Authorization Code + PKCE.
 * 
 * This replaces @asgardeo/auth-react which doesn't work in extension popups
 * because popups close on redirect.
 */

const AuthContext = createContext(null);

// --- PKCE Helpers ---
function generateRandomString(length) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// --- Auth Provider ---
export function AuthProvider({ children, config }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  const {
    clientID,
    baseUrl,
    scope = ['openid', 'profile'],
  } = config;

  const redirectURL = chrome.identity?.getRedirectURL?.() || 'https://localhost';
  const authorizeEndpoint = `${baseUrl}/oauth2/authorize`;
  const tokenEndpoint = `${baseUrl}/oauth2/token`;
  const userinfoEndpoint = `${baseUrl}/oauth2/userinfo`;
  const logoutEndpoint = `${baseUrl}/oidc/logout`;

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const stored = await chrome.storage.local.get(['access_token', 'token_expiry', 'user_info']);
        if (stored.access_token && stored.token_expiry && Date.now() < stored.token_expiry) {
          setAccessToken(stored.access_token);
          setUser(stored.user_info || null);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('[Auth] Failed to check session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  // Fetch user info with access token
  const fetchUserInfo = useCallback(async (token) => {
    try {
      const res = await fetch(userinfoEndpoint, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const userInfo = await res.json();
        setUser(userInfo);
        await chrome.storage.local.set({ user_info: userInfo });
        return userInfo;
      }
    } catch (err) {
      console.error('[Auth] Failed to fetch user info:', err);
    }
    return null;
  }, [userinfoEndpoint]);

  // Sign in using chrome.identity.launchWebAuthFlow
  const signIn = useCallback(async () => {
    try {
      // Generate PKCE code verifier and challenge
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString(16);

      // Build the authorization URL
      const scopeStr = Array.isArray(scope) ? scope.join(' ') : scope;
      const authUrl = new URL(authorizeEndpoint);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', clientID);
      authUrl.searchParams.set('redirect_uri', redirectURL);
      authUrl.searchParams.set('scope', scopeStr);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      // Launch the auth flow in a separate window
      const responseUrl = await chrome.identity.launchWebAuthFlow({
        url: authUrl.toString(),
        interactive: true,
      });

      // Parse the authorization code from the redirect
      const url = new URL(responseUrl);
      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');

      if (!code) {
        throw new Error('No authorization code received');
      }

      if (returnedState !== state) {
        throw new Error('State mismatch - potential CSRF attack');
      }

      // Exchange the code for tokens
      const tokenRes = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectURL,
          client_id: clientID,
          code_verifier: codeVerifier,
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        throw new Error(`Token exchange failed: ${errText}`);
      }

      const tokens = await tokenRes.json();
      const expiresAt = Date.now() + (tokens.expires_in || 3600) * 1000;

      // Store tokens
      await chrome.storage.local.set({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        id_token: tokens.id_token || null,
        token_expiry: expiresAt,
      });

      setAccessToken(tokens.access_token);
      setIsAuthenticated(true);

      // Fetch user info
      await fetchUserInfo(tokens.access_token);

      return tokens;
    } catch (err) {
      console.error('[Auth] Sign in failed:', err);
      throw err;
    }
  }, [clientID, authorizeEndpoint, tokenEndpoint, redirectURL, scope, fetchUserInfo]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      const stored = await chrome.storage.local.get(['id_token']);

      // Clear local storage
      await chrome.storage.local.remove([
        'access_token',
        'refresh_token',
        'id_token',
        'token_expiry',
        'user_info',
      ]);

      // Optionally call Asgardeo logout endpoint
      if (stored.id_token) {
        try {
          const logoutUrl = new URL(logoutEndpoint);
          logoutUrl.searchParams.set('id_token_hint', stored.id_token);
          logoutUrl.searchParams.set('post_logout_redirect_uri', redirectURL);
          await chrome.identity.launchWebAuthFlow({
            url: logoutUrl.toString(),
            interactive: false,
          });
        } catch {
          // Silent logout failure is OK
        }
      }
    } catch (err) {
      console.error('[Auth] Sign out error:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [logoutEndpoint, redirectURL]);

  // Get current access token (with expiry check)
  const getAccessToken = useCallback(async () => {
    const stored = await chrome.storage.local.get(['access_token', 'token_expiry']);
    if (stored.access_token && stored.token_expiry && Date.now() < stored.token_expiry) {
      return stored.access_token;
    }
    // Token expired — user needs to re-auth
    setIsAuthenticated(false);
    setAccessToken(null);
    return null;
  }, []);

  const value = {
    isAuthenticated,
    isLoading,
    accessToken,
    user,
    signIn,
    signOut,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
