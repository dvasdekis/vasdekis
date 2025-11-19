# Security Implementation for GitHub Pages

This document explains the security measures implemented for the Vasdekis website when deployed on GitHub Pages.

## Challenge

GitHub Pages has limitations when it comes to setting custom HTTP security headers. Unlike Cloudflare Pages or Netlify, GitHub Pages doesn't support `_headers` files or custom server configurations.

## Implemented Solutions

### 1. Meta Tag Security Headers

The following security headers are implemented via HTML meta tags in `index.html`:

- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `X-XSS-Protection: 1; mode=block` - Enables XSS filtering
- `Permissions-Policy` - Restricts access to browser features

### 2. Service Worker (sw.js)

A service worker is registered to:
- Cache resources for offline functionality
- Provide client-side security enforcement
- Add an additional layer of protection

### 3. Jekyll Configuration (_config.yml)

Jekyll configuration includes:
- Site metadata for proper SEO
- Plugin configuration for GitHub Pages compatibility
- Security-related settings

### 4. GitHub Actions Workflow

The `.github/workflows/pages.yml` workflow:
- Ensures proper Jekyll build process
- Deploys to GitHub Pages with appropriate permissions
- Maintains build security

## Limitations on GitHub Pages

The following security headers from `_headers` **cannot** be effectively implemented on GitHub Pages:

- `X-Frame-Options` (requires HTTP header)
- `Strict-Transport-Security` (requires HTTP header)
- `Content-Security-Policy` with `frame-ancestors` (limited via meta tags)
- `Cross-Origin-*` policies (require HTTP headers)

## Recommendations

For full security header support, consider:

1. **Cloudflare Pages** (currently used) - Full support for `_headers` file
2. **Netlify** - Full support for `_headers` file  
3. **Custom hosting** with reverse proxy (nginx, Apache)
4. **GitHub Pages with Cloudflare proxy** - Use Cloudflare as a proxy in front of GitHub Pages

## Verification

To verify the implemented headers:

1. Open browser developer tools
2. Navigate to the Network tab
3. Reload the page
4. Check the response headers for the implemented security measures

Note: Some security policies are enforced client-side and may not appear in HTTP headers but are still effective.