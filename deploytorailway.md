# Deploying StockHarmony to Railway

This guide provides detailed instructions for deploying the StockHarmony application to Railway.

## Environment Variables

The following environment variables need to be configured in your Railway project:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To set these in Railway:
1. Go to your project in the Railway dashboard
2. Navigate to the "Variables" tab
3. Add each environment variable with its corresponding value from your Supabase project

## Build and Start Commands

Configure the following commands in your Railway project settings:

```bash
# Build Command
npm install && npm run build

# Start Command
npm run preview
```

## Dependencies

The application requires the following key dependencies (as specified in package.json):

### Core Dependencies
- React: ^18.3.1
- React DOM: ^18.3.1
- React Router DOM: ^6.26.2
- @supabase/supabase-js: ^2.47.12
- @tanstack/react-query: ^5.56.2
- Lucide React: ^0.462.0
- jsPDF: ^2.5.2
- jsPDF-autotable: ^3.8.4

### Development Dependencies
- TypeScript: ^5.5.3
- Vite: ^5.4.1
- @vitejs/plugin-react-swc: ^3.5.0
- Tailwind CSS: ^3.4.11

## Database Configuration

StockHarmony uses Supabase as its database and backend service. To configure the database connection:

1. Ensure your Supabase project is set up and running
2. Configure the following in your Supabase project:
   - Enable Row Level Security (RLS) policies
   - Set up authentication providers if needed
   - Configure storage buckets for file uploads
3. Add the Supabase URL and anon key to Railway environment variables

## CORS Configuration

If you're experiencing CORS issues:

1. In your Supabase project settings, add your Railway deployment URL to the allowed origins
2. The format will be: `https://your-app-name.railway.app`

## Deployment Instructions

### 1. Prepare Your Repository

Ensure your repository includes:
- A `Procfile` (not required but recommended)
- Properly configured `vite.config.ts`
- All environment variables documented

### 2. Deploy to Railway

1. Create a new project in Railway
2. Connect your GitHub repository
3. Configure environment variables
4. Set build and start commands
5. Deploy the application

### 3. Configure Domain (Optional)

1. Go to your Railway project settings
2. Navigate to the "Domains" section
3. Generate a Railway subdomain or configure a custom domain

## Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Confirm Supabase connection is working
- [ ] Test authentication flows
- [ ] Verify file uploads and storage
- [ ] Check all API endpoints are functioning
- [ ] Test CORS configuration with frontend requests

## Troubleshooting

Common issues and solutions:

### Build Failures
- Ensure all dependencies are properly listed in package.json
- Check if the Node.js version is compatible (recommended: 18.x or higher)
- Verify environment variables are properly set

### Runtime Errors
- Check Supabase connection strings
- Verify API endpoints are correctly configured
- Ensure storage buckets are properly set up

### CORS Issues
- Verify Supabase allowed origins include your Railway domain
- Check for any missing CORS headers in your API responses

## Monitoring and Logs

Access logs in Railway:
1. Go to your project dashboard
2. Click on the "Deployments" tab
3. Select the current deployment
4. View logs in real-time

## Support

If you encounter any issues:
1. Check Railway's documentation: https://docs.railway.app/
2. Review Supabase documentation: https://supabase.com/docs
3. Open an issue in the project repository