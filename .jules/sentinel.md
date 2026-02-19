## 2026-02-16 - Unused Secret Injection via Build Config
**Vulnerability:** The `vite.config.ts` was configured to inject `GEMINI_API_KEY` into the client-side bundle via the `define` option, despite the key not being used in the application.
**Learning:** Injecting secrets via build configuration creates a risk of exposing sensitive data in the client-side bundle, even if the code doesn't explicitly use it, if the variable exists in the build environment.
**Prevention:** Only inject environment variables that are strictly necessary and safe for client-side use (e.g., using `VITE_` prefix and avoiding explicit `define` for sensitive keys unless absolutely required and understood).

## 2026-02-16 - Missing Production Security Headers
**Vulnerability:** The Nginx configuration for production (`nginx.conf`) lacked standard security headers, exposing the application to clickjacking, MIME sniffing, and unnecessary feature access.
**Learning:** Even with secure code, the deployment environment (Nginx) must be hardened separately. Client-side security (like CSP meta tags) is often insufficient compared to HTTP headers.
**Prevention:** Always include `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` in server configurations by default.
