import { env } from "../config/env";

export const AUTH_COOKIE_NAME = "token";

export const AUTH_COOKIE_MAX_AGE =
  30 * 24 * 60 * 60 * 1000;

export const authCookieOptions = {
  httpOnly: true,

  secure:
    env.NODE_ENV === "production",

  sameSite:
    env.NODE_ENV === "production"
      ? ("none" as const)
      : ("lax" as const),

  maxAge: AUTH_COOKIE_MAX_AGE,

  ...(env.COOKIE_DOMAIN
    ? {
        domain: env.COOKIE_DOMAIN,
      }
    : {}),
};