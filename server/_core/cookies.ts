import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(req: Request): Pick<
  CookieOptions,
  "domain" | "httpOnly" | "path" | "sameSite" | "secure"
> {
  // When running in development over plain HTTP, setting `SameSite='none'` without
  // the `Secure` flag will cause modern browsers to reject the cookie. To make
  // local dev reliable we use `sameSite: 'lax'` when the request is not secure,
  // and `sameSite: 'none'` when the connection is secure (HTTPS).
  const secure = isSecureRequest(req);
  const sameSite = secure ? ("none" as const) : ("lax" as const);

  if (process.env.NODE_ENV === "development" && !isSecureRequest(req )) {
    return {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    };
  }

  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    domain: process.env.NODE_ENV === "production" || process.env.CODESANDBOX_HOST ? ".csb.app" : undefined,
  };
}
