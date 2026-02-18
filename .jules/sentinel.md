## 2026-02-16 - Unused Secret Injection via Build Config
**Vulnerability:** The `vite.config.ts` was configured to inject `GEMINI_API_KEY` into the client-side bundle via the `define` option, despite the key not being used in the application.
**Learning:** Injecting secrets via build configuration creates a risk of exposing sensitive data in the client-side bundle, even if the code doesn't explicitly use it, if the variable exists in the build environment.
**Prevention:** Only inject environment variables that are strictly necessary and safe for client-side use (e.g., using `VITE_` prefix and avoiding explicit `define` for sensitive keys unless absolutely required and understood).

## 2026-02-17 - Missing Security Headers in Nginx
**Vulnerability:** The `nginx.conf` lacked standard security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP), leaving the application vulnerable to clickjacking, MIME-sniffing, and XSS attacks.
**Learning:** Default Nginx configurations are insecure by default. SPAs using third-party scripts (GTM, Google Fonts) require careful CSP tuning (e.g., allowing 'unsafe-inline' for GTM/styled-components).
**Prevention:** Always include a security headers block in `nginx.conf` templates. Use a "deny by default" CSP and incrementally allow required sources.
