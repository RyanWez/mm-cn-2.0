# Setup Guide - Myanmar-Chinese Chat Assistant

## ✅ Firebase ဖြုတ်ပြီးပါပြီ

Firebase နဲ့ ပတ်သက်တဲ့ code တွေအားလုံးကို ဖြုတ်ပြီး local storage သုံးပြီး run လို့ရအောင် ပြင်ပြီးပါပြီ။

## 🔧 ပြောင်းလဲမှုများ

### ဖြုတ်လိုက်တဲ့ Files:
- `firebase.json` - Firebase configuration
- `firestore.rules` - Firestore security rules
- `apphosting.yaml` - Firebase App Hosting config
- `src/lib/firebase.ts` - Firebase client SDK
- `src/lib/firebase-admin.ts` - Firebase Admin SDK
- `src/lib/auth.ts` - Firebase Authentication
- `src/lib/database.ts` - Firestore database functions

### ဖန်တီးထားတဲ့ Files:
- `src/lib/storage.ts` - LocalStorage management (Firebase အစား)
- `.env.local.example` - Environment variables template
- `.env.local` - Your local environment file
- `SETUP_GUIDE.md` - This file

### ပြင်ဆင်ထားတဲ့ Files:
- `package.json` - Firebase dependencies ဖြုတ်ပြီး
- `src/ai/translate.ts` - In-memory caching သုံးပြီး
- `src/hooks/use-translator.ts` - LocalStorage သုံးပြီး
- `src/components/app/translator/TranslationHistory.tsx` - LocalStorage ကနေ data ယူပြီး
- `README.md` - Setup instructions အသစ်

## 🚀 အခု Run နည်း

### 1. Gemini API Key ထည့်ပါ

`.env.local` file ကို ဖွင့်ပြီး သင့် Gemini API key ထည့်ပါ:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

**API Key ရယူနည်း:**
1. [Google AI Studio](https://makersuite.google.com/app/apikey) သို့ သွားပါ
2. Google account နဲ့ login ဝင်ပါ
3. "Create API Key" ကို နှိပ်ပါ
4. API key ကို copy လုပ်ပြီး `.env.local` မှာ ထည့်ပါ

### 2. Development Server Run ပါ

```bash
npm run dev
```

Server က `http://localhost:9002` မှာ run နေပါပြီ။

### 3. Production Build

```bash
npm run build
npm start
```

## 📦 Storage System

### LocalStorage ထဲမှာ သိမ်းထားတာတွေ:

1. **user_id** - Unique user identifier
2. **translation_history** - Translation history (max 50 items)
3. **translation_cache** - Cached translations (24 hours expiry)
4. **translation_cooldown** - Last translation timestamp

### Server-side:

1. **In-memory cache** - Repeated queries အတွက်
2. **Cooldown tracking** - API abuse prevention

## 🎯 Features

✅ Real-time streaming translation
✅ Local storage caching
✅ Translation history (50 items)
✅ 15-second cooldown
✅ Common phrases library
✅ Copy to clipboard
✅ Responsive design
✅ Light theme
✅ No authentication required
✅ Offline history access

## 🔒 Security Notes

- API key က server-side only (GEMINI_API_KEY)
- Client-side မှာ sensitive data မရှိပါ
- LocalStorage က browser-specific ဖြစ်ပါတယ်
- Translation history က device-specific ဖြစ်ပါတယ်

## 🐛 Troubleshooting

### Translation မရရင်:
1. `.env.local` မှာ GEMINI_API_KEY စစ်ပါ
2. API key valid ရှိမရှိ စစ်ပါ
3. Internet connection စစ်ပါ
4. Browser console မှာ error ကြည့်ပါ

### History မပေါ်ရင်:
1. Browser localStorage enabled ရှိမရှိ စစ်ပါ
2. Private/Incognito mode မဟုတ်ဘူးလား စစ်ပါ
3. Browser DevTools > Application > Local Storage ကြည့်ပါ

### Build error ရရင်:
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📝 Development Tips

### Cache ရှင်းနည်း:
Browser DevTools > Application > Local Storage > Clear All

### Cooldown ပြန်ရှင်းနည်း:
Browser DevTools > Application > Local Storage > Delete `translation_cooldown`

### History ရှင်းနည်း:
Browser DevTools > Application > Local Storage > Delete `translation_history`

## 🎉 အောင်မြင်ပါပြီ!

Firebase dependencies မရှိတော့ပါ။ Local မှာ လွယ်လွယ်ကူကူ run လို့ရပါပြီ။

**Next Steps:**
1. `.env.local` မှာ API key ထည့်ပါ
2. `npm run dev` run ပါ
3. `http://localhost:9002` ကို browser မှာ ဖွင့်ပါ
4. Translation စမ်းကြည့်ပါ!

---

**Questions?** Check the main README.md for more details.
