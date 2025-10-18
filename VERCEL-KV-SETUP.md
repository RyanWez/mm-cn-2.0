# Vercel KV Setup Guide

## ဘာကြောင့် Vercel KV လိုအပ်သလဲ?

**ပြဿနာ:** In-memory cache က Vercel serverless function cold start တိုင်း reset ဖြစ်တယ်

**ဖြေရှင်းချက်:** Vercel KV က Redis-based persistent cache ပေးတယ်

**အကျိုးကျေးဇူးများ:**
- ✅ Cache က deployments ကြားမှာ ရှိနေတယ်
- ✅ API calls 70-80% လျှော့ချနိုင်တယ်
- ✅ Response time မြန်တယ်
- ✅ API costs သက်သာတယ်

## Setup လုပ်နည်း

### 1. Vercel KV Database ဖန်တီးရန်

1. Vercel Dashboard သွားပါ: https://vercel.com/dashboard
2. **Storage** tab ကို နှိပ်ပါ
3. **Create Database** နှိပ်ပါ
4. **KV** ကို ရွေးပါ
5. Database name ပေးပါ (e.g., `translation-cache`)
6. Region ရွေးပါ (Singapore အနီးဆုံး)
7. **Create** နှိပ်ပါ

### 2. Environment Variables ယူရန်

Database ဖန်တီးပြီးရင်:

1. **`.env.local` tab** ကို နှိပ်ပါ
2. အောက်ပါ variables တွေ မြင်ရပါမယ်:
   ```
   KV_REST_API_URL="https://..."
   KV_REST_API_TOKEN="..."
   ```
3. **Copy Snippet** နှိပ်ပါ

### 3. Local Development အတွက်

`.env.local` ဖိုင်မှာ ထည့်ပါ:

```bash
# Vercel KV (Optional for local dev)
KV_REST_API_URL="https://your-kv-url.kv.vercel-storage.com"
KV_REST_API_TOKEN="your-token-here"
```

**မှတ်ချက်:** Local development မှာ KV မထည့်ရင်လဲ ရပါတယ်။ In-memory cache သုံးမယ်။

### 4. Production Deployment

Vercel မှာ deploy လုပ်တဲ့အခါ:

1. Project Settings → Environment Variables သွားပါ
2. KV variables တွေ အလိုအလျောက် ထည့်ပေးပြီးသားဖြစ်ပါမယ် (KV database ကို project နဲ့ link လုပ်ထားရင်)
3. မရှိရင် manually ထည့်ပါ:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### 5. Project နဲ့ KV Database ချိတ်ရန်

1. Project Settings → Storage သွားပါ
2. **Connect Store** နှိပ်ပါ
3. သင့် KV database ကို ရွေးပါ
4. **Connect** နှိပ်ပါ

## Testing

### Local မှာ test လုပ်ရန်:

```bash
npm run dev
```

Console မှာ မြင်ရမယ်:
- `[Cache] Miss - fetching translation` (ပထမဆုံး)
- `[Cache] Hit - length: XX` (ဒုတိယအကြိမ်)

### Production မှာ test လုပ်ရန်:

1. Deploy လုပ်ပါ: `vercel --prod`
2. တူညီတဲ့ text ကို နှစ်ကြိမ် translate လုပ်ပါ
3. ဒုတိယအကြိမ် က မြန်သင့်တယ် (cache hit)

## Pricing

### Vercel KV Free Tier:
- **Storage:** 256 MB
- **Requests:** 10,000 per day
- **Bandwidth:** 256 MB per day

**သေးသေးလေး လုပ်ငန်းအတွက် Free tier လုံလောက်ပါတယ်!**

### ခန့်မှန်းချက်:
- တစ်ခု translation cache entry ≈ 500 bytes
- 256 MB = ~500,000 translations
- 10K requests/day = ~300 translations/day (cache read + write)

## Monitoring

### Cache Performance ကြည့်ရန်:

Vercel Dashboard → Storage → Your KV Database:
- **Keys:** Cache entries အရေအတွက်
- **Memory Usage:** Storage သုံးစွဲမှု
- **Commands:** Request count

### Logs ကြည့်ရန်:

Development မှာ:
```
[Cache] Hit - length: 50
[Cache] Miss - fetching translation
[Cache] Saved - length: 45
```

## Troubleshooting

### Issue: "KV is not available"
**ဖြစ်ရတဲ့အကြောင်းရင်း:** Environment variables မရှိဘူး
**ဖြေရှင်းနည်း:** In-memory cache သုံးမယ် (automatic fallback)

### Issue: Cache မအလုပ်လုပ်ဘူး
**စစ်ဆေးရန်:**
1. Environment variables မှန်ကန်သလား?
2. KV database က project နဲ့ connected လား?
3. Console logs မှာ errors ရှိလား?

### Issue: "Too many requests"
**ဖြစ်ရတဲ့အကြောင်းရင်း:** Free tier limit ပြည့်သွားပြီ
**ဖြေရှင်းနည်း:** 
- Cache expiry time တိုချပါ (လက်ရှိ 24 hours)
- Upgrade to paid plan
- သို့မဟုတ် in-memory cache ပြန်သုံးပါ

## Cache Management

### Cache ရှင်းလင်းရန်:

Vercel Dashboard → Storage → Your KV Database → **Data Browser**:
- `translation:*` keys တွေကို ဖျက်နိုင်ပါတယ်

### Cache size လျှော့ချရန်:

`src/ai/translate-ollama.ts` မှာ:
```typescript
const CACHE_EXPIRY = 12 * 60 * 60; // 12 hours instead of 24
```

## အကြံပြုချက်

1. **Local development:** KV မလိုပါဘူး၊ in-memory cache လုံလောက်ပါတယ်
2. **Production:** KV သုံးသင့်ပါတယ် (performance + cost savings)
3. **Free tier:** သေးသေးလေး လုပ်ငန်းအတွက် လုံလောက်ပါတယ်
4. **Monitoring:** ပုံမှန် cache performance ကြည့်ပါ

## Summary

✅ **Setup လွယ်တယ်** - 5 minutes ပဲ ကြာတယ်
✅ **Free tier ရှိတယ်** - သေးသေးလေး app အတွက် လုံလောက်တယ်
✅ **Performance ကောင်းတယ်** - API calls 70-80% လျှော့ချနိုင်တယ်
✅ **Automatic fallback** - KV မရှိရင် in-memory cache သုံးတယ်
