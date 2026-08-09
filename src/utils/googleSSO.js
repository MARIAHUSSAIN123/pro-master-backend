import https from "https";
import crypto from "crypto";

// Spec 3.1 — "Secure authentication (email/password, SSO option)".
//
// Verifies a Google Sign-In ID token (the client — web back office or
// mobile app — runs the normal Google Sign-In flow and hands us the
// resulting id_token). Implemented with Node's built-in `crypto` and
// `https` only, so no google-auth-library / jwks-rsa dependency is
// required.
//
// NOTE: set GOOGLE_CLIENT_ID in .env to the OAuth client ID issued in
// Google Cloud Console for this app — tokens whose "aud" doesn't
// match are rejected.

const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"];

let cachedKeys = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // Google rotates these infrequently

const fetchGoogleCerts = () =>
  new Promise((resolve, reject) => {
    https
      .get(GOOGLE_CERTS_URL, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body).keys);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });

const getGoogleKeys = async () => {
  if (cachedKeys && Date.now() - cachedAt < CACHE_TTL_MS) return cachedKeys;
  cachedKeys = await fetchGoogleCerts();
  cachedAt = Date.now();
  return cachedKeys;
};

const base64UrlDecode = (str) => Buffer.from(str, "base64url").toString("utf8");

/**
 * Verifies a Google ID token's signature and standard claims.
 * @param {string} idToken
 * @returns {Promise<{email: string, name: string, sub: string, emailVerified: boolean}>}
 */
export const verifyGoogleIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== "string" || idToken.split(".").length !== 3) {
    throw new Error("Malformed ID token.");
  }

  const [headerB64, payloadB64, signatureB64] = idToken.split(".");
  const header = JSON.parse(base64UrlDecode(headerB64));
  const payload = JSON.parse(base64UrlDecode(payloadB64));

  if (header.alg !== "RS256") {
    throw new Error("Unsupported token algorithm.");
  }

  const keys = await getGoogleKeys();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) {
    throw new Error("Signing key not found (Google may have rotated keys — retry).");
  }

  const publicKey = crypto.createPublicKey({
    key: { kty: jwk.kty, n: jwk.n, e: jwk.e },
    format: "jwk",
  });

  const signedData = `${headerB64}.${payloadB64}`;
  const signature = Buffer.from(signatureB64, "base64url");
  const isValid = crypto.verify("RSA-SHA256", Buffer.from(signedData), publicKey, signature);

  if (!isValid) {
    throw new Error("Invalid token signature.");
  }

  if (!GOOGLE_ISSUERS.includes(payload.iss)) {
    throw new Error("Invalid token issuer.");
  }

  if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Token was not issued for this application.");
  }

  if (payload.exp * 1000 < Date.now()) {
    throw new Error("Token has expired.");
  }

  if (!payload.email) {
    throw new Error("Google account has no email on file.");
  }

  return {
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email,
    sub: payload.sub,
    emailVerified: !!payload.email_verified,
  };
};
