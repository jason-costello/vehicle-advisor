# Environment Variables Setup Guide

This document explains how to set up environment variables for the Vehicle Advisor application in both development and production environments.

## Development Environment

For local development, create a `.env` file in the root directory of the project with the following variables:

```
# MarketCheck API (for VIN decoding and market data)
VITE_MARKETCHECK_API_KEY=your_marketcheck_api_key_here
VITE_MARKETCHECK_BASE_URL=https://api.marketcheck.com/v2
VITE_MARKETCHECK_CLIENT_ID=your_marketcheck_client_id_here
VITE_MARKETCHECK_CLIENT_SECRET=your_marketcheck_client_secret_here
VITE_MARKETCHECK_TOKEN_URL=https://api.marketcheck.com/oauth/token

# Anthropic Claude API (for AI negotiation strategy)
VITE_CLAUDE_API_KEY=your_claude_api_key_here
VITE_CLAUDE_API_URL=https://api.anthropic.com/v1/messages
```

## Environment Variables in SvelteKit

SvelteKit has a specific approach to handling environment variables:

1. Variables prefixed with `VITE_` are available in client-side code via `import.meta.env.VITE_*`
2. All environment variables are available in server-side code via `process.env.*`

Our application uses a centralized configuration module at `src/lib/config/environment.ts` to handle this automatically and provide consistent access regardless of execution context.

## Production Environment

In production, set these environment variables according to your hosting platform:

### Vercel

1. Go to your project settings in the Vercel dashboard
2. Navigate to the "Environment Variables" section
3. Add each of the variables listed above
4. Deploy your application

### Netlify

1. Go to your site settings in the Netlify dashboard
2. Navigate to "Build & deploy" > "Environment"
3. Add each of the variables listed above
4. Redeploy your application

### Other Hosting Providers

Most hosting providers have a way to set environment variables through their dashboard or CLI. Refer to your hosting provider's documentation for specific instructions.

## Server-Only Variables

Some environment variables should only be available on the server. These should not be prefixed with `VITE_` to ensure they are not exposed to the client.

For example:
```
DATABASE_URL=your_database_connection_string
PRIVATE_API_KEY=your_private_key
```

## Testing Environment Variables

You can verify your environment variables are set correctly by:

1. Creating a temporary API endpoint in `src/routes/api/test-env/+server.ts`
2. Logging out the values (be careful not to expose sensitive values in production)
3. Making a request to this endpoint

## Troubleshooting

If environment variables aren't working:

1. Make sure the `.env` file is in the root directory
2. Verify the variable names match exactly (they are case-sensitive)
3. Restart your development server after changing environment variables
4. Check for any typos in the variable names or values
5. Ensure your hosting provider has the variables set correctly

## Security Considerations

- Never commit your `.env` file to version control
- Use different API keys for development and production
- Consider using environment-specific API endpoints
- Rotate API keys regularly for security