# OAuth IDP Setup Guide

This guide will help you configure your custom Identity Provider (IDP) for OAuth authentication in this Next.js application.

## Overview

The application now supports custom OAuth/OIDC providers using better-auth's `genericOAuth` plugin. You can authenticate users with any OAuth 2.0 / OpenID Connect compliant identity provider.

## Quick Start

### 1. Gather Your IDP Information

From your Identity Provider, collect the following information:

- **Client ID**: Your OAuth application's client identifier
- **Client Secret**: Your OAuth application's client secret
- **Authorization Endpoint**: The URL where users are redirected to log in
  - Example: `https://your-idp.example.com/oauth/authorize`
  - For Okta: `https://your-domain.okta.com/oauth2/default/v1/authorize`
  - For Auth0: `https://your-domain.auth0.com/authorize`
  - For Keycloak: `https://your-keycloak.example.com/realms/{realm}/protocol/openid-connect/auth`
- **Token Endpoint**: The URL to exchange authorization code for access token
  - Example: `https://your-idp.example.com/oauth/token`
  - For Okta: `https://your-domain.okta.com/oauth2/default/v1/token`
  - For Auth0: `https://your-domain.auth0.com/oauth/token`
  - For Keycloak: `https://your-keycloak.example.com/realms/{realm}/protocol/openid-connect/token`
- **UserInfo Endpoint** (optional): The URL to fetch user profile information
  - Example: `https://your-idp.example.com/oauth/userinfo`
  - For Okta: `https://your-domain.okta.com/oauth2/default/v1/userinfo`
  - For Auth0: `https://your-domain.auth0.com/userinfo`
  - For Keycloak: `https://your-keycloak.example.com/realms/{realm}/protocol/openid-connect/userinfo`
- **Scopes**: The OAuth scopes you want to request (typically `openid profile email`)

### 2. Configure Your IDP's Redirect URI

In your IDP's OAuth application settings, add the following redirect URI:

```
http://localhost:3000/api/auth/callback/custom-idp
```

For production, update this to your production URL:

```
https://your-domain.com/api/auth/callback/custom-idp
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure the OAuth settings:

```bash
# Enable OAuth IDP
OAUTH_IDP_ENABLED="true"

# Display name (shown on login button)
OAUTH_IDP_NAME="Your Company IDP"

# OAuth credentials
OAUTH_IDP_CLIENT_ID="your-actual-client-id"
OAUTH_IDP_CLIENT_SECRET="your-actual-client-secret"

# OAuth endpoints
OAUTH_IDP_AUTHORIZATION_ENDPOINT="https://your-idp.example.com/oauth/authorize"
OAUTH_IDP_TOKEN_ENDPOINT="https://your-idp.example.com/oauth/token"
OAUTH_IDP_USERINFO_ENDPOINT="https://your-idp.example.com/oauth/userinfo"

# OAuth scopes (space-separated)
OAUTH_IDP_SCOPES="openid profile email"

# Client-side variables (must match server-side)
NEXT_PUBLIC_OAUTH_IDP_ENABLED="true"
NEXT_PUBLIC_OAUTH_IDP_NAME="Your Company IDP"
```

### 4. Start the Application

```bash
pnpm dev
```

Visit http://localhost:3000/login and you should see the OAuth sign-in button!

## Configuration Details

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OAUTH_IDP_ENABLED` | Yes | Set to `"true"` to enable OAuth |
| `OAUTH_IDP_NAME` | No | Display name for the IDP (default: "Custom IDP") |
| `OAUTH_IDP_CLIENT_ID` | Yes | OAuth client ID from your IDP |
| `OAUTH_IDP_CLIENT_SECRET` | Yes | OAuth client secret from your IDP |
| `OAUTH_IDP_AUTHORIZATION_ENDPOINT` | Yes | Authorization URL |
| `OAUTH_IDP_TOKEN_ENDPOINT` | Yes | Token exchange URL |
| `OAUTH_IDP_USERINFO_ENDPOINT` | No | UserInfo URL (optional) |
| `OAUTH_IDP_SCOPES` | No | Space-separated scopes (default: "openid profile email") |
| `NEXT_PUBLIC_OAUTH_IDP_ENABLED` | Yes | Must match `OAUTH_IDP_ENABLED` for client-side |
| `NEXT_PUBLIC_OAUTH_IDP_NAME` | No | Must match `OAUTH_IDP_NAME` for client-side |

### Security Features

The OAuth implementation includes:

- ✅ **PKCE (Proof Key for Code Exchange)**: Enhanced security for OAuth flows
- ✅ **State parameter**: CSRF protection
- ✅ **Secure token handling**: Tokens never exposed to client-side
- ✅ **Environment validation**: Zod validates all configuration at startup

### User Mapping

The OAuth provider maps user info to better-auth user fields. The default mapping expects these fields from your IDP:

```typescript
{
  sub: string,           // User ID (or 'id')
  email: string,         // User email
  name: string,          // User full name (or 'preferred_username')
  picture?: string,      // User avatar URL (or 'avatar_url')
  email_verified?: boolean
}
```

If your IDP returns different field names, you can customize the mapping in `lib/auth.ts`.

## Common IDP Examples

### Okta

```bash
OAUTH_IDP_NAME="Okta"
OAUTH_IDP_AUTHORIZATION_ENDPOINT="https://your-domain.okta.com/oauth2/default/v1/authorize"
OAUTH_IDP_TOKEN_ENDPOINT="https://your-domain.okta.com/oauth2/default/v1/token"
OAUTH_IDP_USERINFO_ENDPOINT="https://your-domain.okta.com/oauth2/default/v1/userinfo"
OAUTH_IDP_SCOPES="openid profile email"
```

### Auth0

```bash
OAUTH_IDP_NAME="Auth0"
OAUTH_IDP_AUTHORIZATION_ENDPOINT="https://your-domain.auth0.com/authorize"
OAUTH_IDP_TOKEN_ENDPOINT="https://your-domain.auth0.com/oauth/token"
OAUTH_IDP_USERINFO_ENDPOINT="https://your-domain.auth0.com/userinfo"
OAUTH_IDP_SCOPES="openid profile email"
```

### Keycloak

```bash
OAUTH_IDP_NAME="Keycloak"
OAUTH_IDP_AUTHORIZATION_ENDPOINT="https://your-keycloak.example.com/realms/{realm}/protocol/openid-connect/auth"
OAUTH_IDP_TOKEN_ENDPOINT="https://your-keycloak.example.com/realms/{realm}/protocol/openid-connect/token"
OAUTH_IDP_USERINFO_ENDPOINT="https://your-keycloak.example.com/realms/{realm}/protocol/openid-connect/userinfo"
OAUTH_IDP_SCOPES="openid profile email"
```

### Azure AD / Microsoft Entra ID

```bash
OAUTH_IDP_NAME="Microsoft"
OAUTH_IDP_AUTHORIZATION_ENDPOINT="https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize"
OAUTH_IDP_TOKEN_ENDPOINT="https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
OAUTH_IDP_USERINFO_ENDPOINT="https://graph.microsoft.com/oidc/userinfo"
OAUTH_IDP_SCOPES="openid profile email"
```

## Testing

### Test the OAuth Flow

1. Navigate to http://localhost:3000/login
2. Click "Sign in with [Your IDP Name]"
3. You should be redirected to your IDP's login page
4. After successful authentication, you'll be redirected back to the app
5. You should be logged in and redirected to the dashboard

### Debugging

If OAuth isn't working:

1. **Check environment variables**: Make sure `OAUTH_IDP_ENABLED="true"`
2. **Verify redirect URI**: Ensure it matches in your IDP settings
3. **Check endpoints**: Verify all URLs are correct and accessible
4. **Review scopes**: Ensure your IDP supports the requested scopes
5. **Check browser console**: Look for errors in the browser developer tools
6. **Check server logs**: Review terminal output for error messages

## Production Deployment

### Before Deploying

1. Generate a secure `BETTER_AUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

2. Update environment variables in your hosting platform:
   - Set `NEXT_PUBLIC_APP_URL` to your production URL
   - Update all OAuth endpoints if different for production
   - Configure production redirect URI in your IDP

3. Update IDP redirect URI to production:
   ```
   https://your-production-domain.com/api/auth/callback/custom-idp
   ```

### Vercel Deployment

In your Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add all required OAuth environment variables
3. Make sure to include both server and client variables:
   - `OAUTH_IDP_ENABLED`
   - `NEXT_PUBLIC_OAUTH_IDP_ENABLED`
   - And all other OAuth configuration variables

### Security Checklist

- ✅ Use HTTPS in production (`NEXT_PUBLIC_APP_URL` should use `https://`)
- ✅ Never commit `.env.local` to version control
- ✅ Rotate client secrets periodically
- ✅ Use separate OAuth apps for development and production
- ✅ Review OAuth scopes - only request what you need
- ✅ Enable email verification in production (`requireEmailVerification: true`)
- ✅ Implement rate limiting on auth endpoints

## Troubleshooting

### OAuth button not showing on login page

**Problem**: The "Sign in with Custom IDP" button doesn't appear.

**Solution**:
- Verify `NEXT_PUBLIC_OAUTH_IDP_ENABLED="true"` in `.env.local`
- Restart the development server after changing environment variables
- Check browser console for errors

### "Invalid redirect URI" error

**Problem**: IDP returns an error about invalid redirect URI.

**Solution**:
- Add `http://localhost:3000/api/auth/callback/custom-idp` to your IDP's allowed redirect URIs
- Ensure the redirect URI matches exactly (including protocol and port)
- For production, add `https://your-domain.com/api/auth/callback/custom-idp`

### User info not mapping correctly

**Problem**: User data (name, email) not appearing correctly after login.

**Solution**:
- Check what fields your IDP returns in the userinfo response
- Customize the `profile` mapping in `lib/auth.ts` if needed
- Ensure your OAuth scopes include the necessary claims

### Environment variables not loading

**Problem**: Changes to `.env.local` not taking effect.

**Solution**:
- Restart the development server (`pnpm dev`)
- Verify the file is named `.env.local` (not `.env` or `.env.development`)
- Check for syntax errors in the `.env.local` file

## Advanced Configuration

### Customizing User Profile Mapping

If your IDP returns different field names, edit `lib/auth.ts`:

```typescript
// In lib/auth.ts, inside the genericOAuth config:
profile: (profile: any) => ({
  id: profile.sub || profile.id || profile.user_id,
  email: profile.email || profile.mail,
  name: profile.name || profile.display_name || profile.preferred_username,
  image: profile.picture || profile.avatar_url || profile.photo,
  emailVerified: profile.email_verified || false,
}),
```

### Multiple OAuth Providers

To add multiple OAuth providers, you can add more configurations to the `genericOAuth` plugin:

```typescript
genericOAuth({
  config: [
    {
      providerId: "custom-idp",
      // ... existing config
    },
    {
      providerId: "another-idp",
      clientId: env.ANOTHER_IDP_CLIENT_ID,
      // ... additional provider config
    },
  ],
})
```

## Support

For issues specific to:
- **better-auth**: https://better-auth.vercel.app/docs
- **Next.js**: https://nextjs.org/docs
- **Your IDP**: Consult your IDP's OAuth/OIDC documentation

## Summary

You now have a fully configured OAuth authentication system! Users can sign in with:
- ✅ Email/Password (existing)
- ✅ Custom OAuth IDP (new)

The login page automatically shows/hides OAuth options based on configuration, making it easy to toggle features without code changes.

