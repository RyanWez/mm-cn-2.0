# Deployment Guide - Vercel

## Pre-deployment Checklist

### 1. Environment Variables
Add these to your Vercel project settings:

```
OLLAMA_API_KEY=your_production_ollama_api_key
NODE_ENV=production
```

### 2. Vercel Configuration
The app is already configured with `vercel.json` (if exists) or uses default Next.js settings.

### 3. Build Settings
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

## Deployment Steps

### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option 2: GitHub Integration
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy

## Post-deployment

### Monitor Logs
- Vercel Dashboard → Your Project → Logs
- Logs are minimal in production (only errors and critical info)
- Development logs won't show in production

### Performance Monitoring
- Check Function Duration (should be < 10s for most translations)
- Monitor Cache Hit Rate
- Watch for API errors

## Troubleshooting

### Issue: "OLLAMA_API_KEY is not set"
**Solution:** Add the environment variable in Vercel dashboard

### Issue: Slow translations
**Solution:** 
- Check Ollama API status
- Verify network connectivity
- Consider increasing timeout limits

### Issue: Cache not working
**Solution:** 
- Vercel Serverless Functions are stateless
- In-memory cache resets on each cold start
- Consider using Redis or Vercel KV for persistent cache

## Recommended Improvements for Production

### 1. Add Redis Cache (Optional)
Replace in-memory cache with Redis for better performance:
```bash
npm install @vercel/kv
```

### 2. Add Error Tracking
```bash
npm install @sentry/nextjs
```

### 3. Add Rate Limiting
Implement per-user rate limiting to prevent abuse

### 4. Add Analytics
Track translation usage and performance metrics

## Cost Considerations

### Vercel
- Free tier: 100GB bandwidth, 100 hours function execution
- Pro tier: $20/month for more resources

### Ollama Cloud
- Check pricing at https://ollama.com/cloud
- Monitor API usage in dashboard

## Security Notes

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Rotate API keys regularly**
3. **Use environment variables** for all secrets
4. **Enable Vercel Firewall** if available
5. **Monitor for unusual API usage**
