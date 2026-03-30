# KSSMS Deployment Guide

## Prerequisites

Before deployment, ensure you have:

1. **Supabase Account**: https://supabase.com
2. **Clerk Account**: https://clerk.com
3. **Vercel Account**: https://vercel.com
4. **GitHub Account**: https://github.com
5. **Email Service** (Optional): Resend, Mailgun, or SMTP credentials

---

## Step 1: Supabase Setup

### Create a New Project

1. Go to [Supabase](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `kssms`
   - Database password: (generate strong password)
   - Region: Select closest to Kebbi State (or Africa region)
4. Click "Create new project"

### Set Up Database Schema

1. Go to SQL Editor in Supabase
2. Click "New Query"
3. Copy the entire contents of `database.sql`
4. Paste and execute
5. Verify all tables are created

### Get Connection Details

1. Go to Project Settings → API
2. Copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Go to Project Settings → Database
4. Copy `Connection string` - extract the service key

---

## Step 2: Clerk Setup

### Create Application

1. Go to [Clerk](https://clerk.com)
2. Create new application
3. Choose authentication method (Email/Password recommended)
4. Go to API Keys
5. Copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### Set Up Webhooks

1. Go to Webhooks
2. Create new endpoint
3. Webhook URL: `https://your-domain.vercel.app/api/webhooks/clerk`
4. Events: Select `user.created`
5. Copy webhook secret

---

## Step 3: Vercel Deployment

### Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/kssms.git
git push -u origin main
```

### Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Framework: Next.js (should auto-detect)
5. Environment Variables: Add all from `.env.local.example`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CLERK_WEBHOOK_SECRET`

6. Click "Deploy"

### Update Clerk Webhook URL

After deployment:
1. Go to Clerk Dashboard
2. Update webhook endpoint URL to your Vercel deployment
3. Test webhook

---

## Step 4: Environment Variables

Create `.env.production` on Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api
```

---

## Step 5: Testing

### Test User Creation

1. Go to your deployed URL
2. Test sign up process
3. Verify user is created in Supabase

### Test School Creation

1. Create a user with state_admin role in Supabase
2. Log in and create a school
3. Verify school appears in database

### Test Student Management

1. Create school admin user
2. Add students to the school
3. Verify students appear in list

---

## Post-Deployment Checklist

- [ ] Custom domain configured on Vercel
- [ ] HTTPS enabled
- [ ] Environment variables set correctly
- [ ] Clerk webhook operational
- [ ] Supabase Row Level Security policies active
- [ ] Database backups automated
- [ ] Email notifications working
- [ ] Admin user created
- [ ] Sample data loaded

---

## Troubleshooting

### Deployment Issues

**Build Failures**
```bash
# Clear cache and rebuild
vercel rebuild
```

**Environment Variables Not Loading**
- Verify variables are set in Vercel dashboard
- Restart deployment after adding variables
- Check for typos in variable names

**Database Connection Errors**
- Verify Supabase URL and keys
- Check database connection limits: Supabase → Project Settings → Database
- Ensure database is not paused

**Clerk Authentication Not Working**
- Verify webhook is receiving events: Clerk → Logs
- Check webhook secret matches in code
- Ensure user creation event is selected in webhook

### Performance Issues

**Slow Database Queries**
1. Check Supabase query performance: Project → Analytics
2. Create indexes for frequently queried columns
3. Optimize RLS policies

**High API Usage**
1. Monitor Vercel analytics
2. Implement request caching
3. Optimize client-side data fetching

---

## Monitoring & Maintenance

### Supabase Monitoring

- Check storage usage: Project Settings → Storage
- Monitor query performance: Analytics
- Review logs: Logs
- Set up alerts: Project Settings → Alerts

### Vercel Monitoring

- Check deployment status: Deployments
- Monitor performance: Analytics
- Review logs: Function Logs
- Set up error tracking: Integrations

### Database Backups

Supabase automatically creates backups. To manage:
1. Go to Project Settings → Backups
2. Configure backup frequency
3. Download backups as needed

---

## Security

### Best Practices

1. **Rotate Secrets Regularly**
   - Update API keys quarterly
   - Use strong passwords

2. **Enable RLS (Row Level Security)**
   - Already configured in database.sql
   - Test RLS policies

3. **Monitor Access**
   - Review Supabase logs regularly
   - Check Clerk user activity
   - Monitor failed login attempts

4. **Secure Environment Variables**
   - Never commit .env files
   - Use Vercel environment variables
   - Rotate secrets if exposed

---

## Scaling

As the system grows:

1. **Database Optimization**
   - Increase database compute
   - Enable read replicas
   - Optimize queries

2. **CDN & Caching**
   - Vercel includes global CDN
   - Implement Redis for caching

3. **Email Service**
   - Migrate from SMTP to Resend or SendGrid
   - Enable batch email sending

4. **Analytics**
   - Implement advanced analytics with Segment
   - Set up data warehouse with Mixpanel

---

## Support

For deployment issues:
1. Check Vercel logs: `vercel logs`
2. Review Supabase documentation
3. Check Clerk support
4. Create GitHub issues for bugs

---

## Rollback Procedures

If deployment fails:

1. **Vercel Rollback**
   ```
   vercel rollback
   ```

2. **Database Rollback**
   - Use Supabase backups
   - Restore from backup point

3. **Manual Redeployment**
   ```bash
   vercel --prod
   ```

---

**Last Updated**: 2024
**Version**: 1.0
