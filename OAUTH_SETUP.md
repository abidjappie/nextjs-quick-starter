# OAuth Provider Management

This guide covers OAuth authentication setup using the database-backed provider management system.

## Overview

The application uses a **database-backed OAuth provider management system** that allows global admins to:

- ✅ Configure multiple OAuth providers without code changes
- ✅ Add, edit, delete, and toggle providers via web UI
- ✅ Automatically display enabled providers on login page
- ✅ Manage configurations through a protected admin panel

**Note:** Provider changes require an application restart (recommended by better-auth for security).

## Quick Start

### 1. Set Up Global Admin

First, configure the global admin user who can access the `/system` admin panel:

```bash
# Add to .env.local
GLOBAL_ADMIN_EMAIL="admin@example.com"
GLOBAL_ADMIN_PASSWORD="your-secure-password"
```

### 2. Run Database Setup

```bash
# Install dependencies (includes bcryptjs for password hashing)
pnpm install

# Seed the global admin user
pnpm db:seed
```

This creates a global admin account with the specified email and password.

### 3. Access the System Panel

1. Start your development server: `pnpm dev`
2. Sign in with your admin credentials at `http://localhost:3000/login`
3. Navigate to `http://localhost:3000/system`

### 4. Add OAuth Provider

In the `/system` panel:

1. Click "Add Provider"
2. Fill in the provider details:
   - **Provider Name**: Display name (e.g., "Google Workspace")
   - **Provider ID**: Unique identifier (e.g., "google-workspace")
     - ⚠️ **This ID is permanent and will be used in the redirect URI**
     - Use lowercase letters, numbers, and hyphens only
     - Cannot be changed after creation
   - **Client ID**: From your OAuth provider
   - **Client Secret**: From your OAuth provider
   - **Authorization URL**: e.g., `https://accounts.google.com/o/oauth2/v2/auth`
   - **Token URL**: e.g., `https://oauth2.googleapis.com/token`
   - **User Info URL**: e.g., `https://openidconnect.googleapis.com/v1/userinfo` (optional)
   - **Scopes**: e.g., `openid profile email`
   - **Enabled**: Check to enable

3. **Note the Redirect URI** shown below the Provider ID field
4. Click "Create Provider"
5. **Restart your application** for changes to take effect

### 5. Configure OAuth Provider Callback

**⚠️ CRITICAL:** In your OAuth provider's settings (Google Console, Okta, etc.), add the redirect URI that was shown in the form.

The redirect URI format is:
```
http://localhost:3000/api/auth/callback/{provider-id}
```

**Replace `{provider-id}` with the EXACT Provider ID you entered in step 4.**

For example:
- If Provider ID is `google-workspace`, use: `http://localhost:3000/api/auth/callback/google-workspace`
- If Provider ID is `okta-sso`, use: `http://localhost:3000/api/auth/callback/okta-sso`
- If Provider ID is `auth0-login`, use: `http://localhost:3000/api/auth/callback/auth0-login`

**You can also find the redirect URI format in the system panel:**
1. Go to `/system`
2. Look at the gray box above the provider table showing the URI format
3. Replace `{provider-id}` with your actual Provider ID

**❌ DO NOT use `custom-idp`** - that was from the old environment variable system.

For production, use:
```
https://your-domain.com/api/auth/callback/{provider-id}
```

**The redirect URI MUST match your Provider ID exactly, or you will get "Mismatched redirect_uri" errors.**

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

1. **Verify provider is enabled**: Check the provider status in `/system`
2. **Verify redirect URI**: Ensure it matches in your IDP settings
3. **Check endpoints**: Verify all URLs are correct and accessible
4. **Review scopes**: Ensure your IDP supports the requested scopes
5. **Check browser console**: Look for errors in the browser developer tools
6. **Check server logs**: Review terminal output for error messages
7. **Restart the app**: Provider changes require an application restart

## Production Deployment

### Before Deploying

1. Generate a secure `BETTER_AUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

2. Update environment variables in your hosting platform:
   - Set `NEXT_PUBLIC_APP_URL` to your production URL
   - Set `GLOBAL_ADMIN_EMAIL` and `GLOBAL_ADMIN_PASSWORD`

3. Configure OAuth providers in `/system` admin panel after deployment

4. Update IDP redirect URIs to production URLs for each provider:
   ```
   https://your-production-domain.com/api/auth/callback/{provider-id}
   ```

### Vercel Deployment

In your Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add required environment variables:
   - `DATABASE_URL` and `DATABASE_AUTH_TOKEN`
   - `BETTER_AUTH_SECRET`
   - `GLOBAL_ADMIN_EMAIL`
   - `GLOBAL_ADMIN_PASSWORD`
   - `NEXT_PUBLIC_APP_URL`

3. After deployment, access `/system` to configure OAuth providers

### Security Checklist

- ✅ Use HTTPS in production (`NEXT_PUBLIC_APP_URL` should use `https://`)
- ✅ Never commit `.env.local` to version control
- ✅ Change default global admin password
- ✅ Rotate client secrets periodically (update in `/system`)
- ✅ Use separate OAuth apps for development and production
- ✅ Review OAuth scopes - only request what you need
- ✅ Enable email verification in production (`requireEmailVerification: true`)
- ✅ Implement rate limiting on auth endpoints
- ✅ Consider encrypting client secrets at rest in database

## Troubleshooting

### OAuth button not showing on login page

**Problem**: OAuth provider button doesn't appear on login page.

**Solution**:
- Verify the provider is enabled in `/system`
- Restart the development server after adding/enabling providers
- Check that the database connection is working
- Check browser console and server logs for errors

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
- Verify the UserInfo URL is correct in provider configuration
- Ensure your OAuth scopes include the necessary claims (openid, profile, email)

### Provider changes not taking effect

**Problem**: Changes to OAuth providers in `/system` not working.

**Solution**:
- **Restart the application** after making changes
- Provider configurations are loaded at startup
- Check server logs for any errors during provider loading

## Advanced Configuration

### Multiple OAuth Providers

The system supports unlimited OAuth providers through the `/system` admin panel. Simply add multiple providers with unique Provider IDs:

1. Click "Add Provider" in `/system`
2. Use unique Provider IDs (e.g., `google-workspace`, `okta-corp`, `azure-ad`)
3. Each provider will appear as a separate button on the login page
4. Restart the app after adding all providers

## Managing OAuth Providers via System Panel

### Accessing the Admin Panel

Only users with global admin privileges can access `/system`:

1. Sign in with the global admin account
2. Navigate to `/system`
3. You'll see the OAuth Provider Management dashboard

### Adding Providers

1. Click "Add Provider"
2. Fill in all required fields
3. Test the configuration before enabling
4. Save and restart the application

### Editing Providers

1. Click "Edit" on any provider
2. Update configuration (Provider ID cannot be changed)
3. Save changes
4. Restart the application for changes to take effect

### Enabling/Disabling Providers

Use the "Enable/Disable" toggle to temporarily disable providers without deleting them.

### Deleting Providers

Click "Delete" and confirm. This permanently removes the provider from the database.

### Important Notes

**⚠️ Application Restart Required**

Changes to OAuth providers require an application restart to take effect. This is the recommended pattern from better-auth for security and stability.

**🔒 Security Considerations**

- Client secrets are stored in the database (consider encrypting in production)
- Only global admins can manage providers
- All changes are logged for audit purposes
- Use HTTPS in production for OAuth callbacks

## Global Admin Management

### Changing Admin Credentials

To change the global admin email or password:

1. Update `GLOBAL_ADMIN_EMAIL` and/or `GLOBAL_ADMIN_PASSWORD` in `.env.local`
2. Run `pnpm db:seed` again
3. The seed script will update the existing admin or create a new one

## Database Schema

The system adds two schema enhancements:

### oauth_providers Table

Stores OAuth provider configurations:
- `id` - Auto-increment primary key
- `name` - Display name for the provider
- `provider_id` - Unique identifier (used in callbacks)
- `client_id` - OAuth client ID
- `client_secret` - OAuth client secret
- `authorization_url` - Authorization endpoint
- `token_url` - Token endpoint
- `user_info_url` - UserInfo endpoint (optional)
- `scopes` - Space-separated OAuth scopes
- `enabled` - Boolean to enable/disable
- `created_at`, `updated_at` - Timestamps

### user Table Enhancement

Added `is_global_admin` boolean field to identify admin users.

## Troubleshooting

### "Mismatched redirect_uri" Error

This is the most common OAuth error. It means the redirect URI configured in your OAuth provider doesn't match what your application is sending.

**Solution:**

1. Go to `/system` in your admin panel
2. Click "Show Redirect URI →" next to the provider with the error
3. Copy the EXACT URL shown (e.g., `http://localhost:3000/api/auth/callback/your-provider-id`)
4. Go to your OAuth provider's configuration (Google Console, Okta, etc.)
5. Add this EXACT URL to the allowed redirect URIs
6. Make sure there are no typos or extra characters
7. Restart your application

**Common Mistakes:**
- ❌ Using `custom-idp` instead of your actual Provider ID
- ❌ Missing the `/api/auth/callback/` path
- ❌ Wrong port number (make sure it matches `NEXT_PUBLIC_APP_URL`)
- ❌ HTTP vs HTTPS mismatch
- ❌ Trailing slash differences

### Provider Not Showing on Login Page

**Possible Causes:**
1. Provider is disabled - Check `/system` and make sure it's enabled
2. Application not restarted - Changes require an app restart
3. Database connection issue - Check your `DATABASE_URL`

**Solution:**
1. Enable the provider in `/system`
2. Restart the application: `pnpm dev`
3. Check browser console for errors

### Cannot Access /system Panel

**Possible Causes:**
1. Not logged in as global admin
2. User doesn't have `isGlobalAdmin` flag set

**Solution:**
1. Make sure you're logged in with the email from `GLOBAL_ADMIN_EMAIL`
2. Run `pnpm db:seed` to ensure admin user is created
3. Check database: `sqlite3 local.db "SELECT email, is_global_admin FROM user;"`

## Support

For issues specific to:
- **better-auth**: https://better-auth.vercel.app/docs
- **Next.js**: https://nextjs.org/docs
- **Your IDP**: Consult your IDP's OAuth/OIDC documentation
- **System Panel**: Check server logs for detailed error messages

## Summary

You now have a fully configured OAuth authentication system with:
- ✅ Email/Password authentication
- ✅ Multiple OAuth providers (database-backed)
- ✅ Admin panel for provider management
- ✅ Dynamic login page that shows all enabled providers

The system provides a user-friendly interface for managing OAuth configurations without code changes, while maintaining security through global admin access controls.

