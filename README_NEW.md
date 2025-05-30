# 🤖 Facebook Reply Automator AR

نظام رد تلقائي ذكي لصفحات Facebook باللغة العربية مع إدارة الطلبات وإرسال الصور.

## ✨ المميزات الحالية

- 🤖 **ردود ذكية** باستخدام Gemini AI
- 📱 **تكامل Facebook Messenger** مع webhook
- 📦 **نظام إدارة الطلبات** التلقائي
- 🖼️ **إرسال الصور** كـ attachments فعلية
- 💬 **واجهة محادثة** في الوقت الفعلي
- 📊 **تحليلات ومتابعة** الأداء
- 🎯 **استخراج بيانات العملاء** تلقائياً
- 🔄 **إنشاء الطلبات** عند اكتمال البيانات

## 🛠️ التقنيات المستخدمة

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: Supabase
- **AI**: Google Gemini AI
- **Deployment**: Vercel
- **Webhook**: Facebook Graph API

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- npm أو yarn
- حساب Supabase
- حساب Google AI Studio
- حساب Facebook Developer

### التثبيت

1. **استنساخ المشروع:**
```bash
git clone https://github.com/elhenawymokhtar1/facebook-reply-automator-ar.git
cd facebook-reply-automator-ar
```

2. **تثبيت التبعيات:**
```bash
npm install
```

3. **إعداد متغيرات البيئة:**
```bash
cp .env.example .env
```

4. **تشغيل الخادم:**
```bash
# تشغيل الواجهة
npm run dev

# تشغيل API
npm run api

# تشغيل كل شيء
npm run start:all
```

## ⚙️ الإعداد

### Facebook Webhook
- **URL**: `https://fbautoar.vercel.app/api/process-message`
- **Verify Token**: `facebook_verify_token_123`
- **Events**: messages, messaging_postbacks

### قاعدة البيانات
الجداول المطلوبة في Supabase:
- `conversations` - المحادثات
- `messages` - الرسائل  
- `orders` - الطلبات
- `facebook_settings` - إعدادات Facebook
- `product_images` - صور المنتجات

## 🎯 كيف يعمل النظام

### 1. استقبال الرسائل
- Facebook يرسل webhook إلى `/api/process-message`
- النظام يستقبل الرسالة ويحللها
- يستخرج بيانات العميل (اسم، هاتف، عنوان، مقاس، لون)

### 2. معالجة الطلبات
- إذا كانت البيانات مكتملة، ينشئ طلب تلقائياً
- يحفظ الطلب في قاعدة البيانات
- يرسل رسالة تأكيد للعميل

### 3. إرسال الصور
- عند طلب العميل لصورة منتج
- النظام يجد الصورة المناسبة
- يرسلها كـ attachment فعلي في Facebook

## 📖 التوثيق الشامل

راجع ملف [DOCUMENTATION.md](./DOCUMENTATION.md) للتوثيق التفصيلي.

## 🔧 الصيانة

### مراقبة النظام:
- تحقق من Vercel logs
- راقب Supabase metrics
- تابع Facebook API status

### التحديثات:
```bash
git pull origin main
npm install
npm run build
```

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ branch جديد
3. اعمل التغييرات
4. ارسل Pull Request

## 📄 الترخيص

MIT License

## 📞 الدعم

للمساعدة أو الاستفسارات، راجع ملف التوثيق أو افتح issue جديد.

---

**آخر تحديث:** ديسمبر 2024
**الحالة:** جاهز للإنتاج ✅
