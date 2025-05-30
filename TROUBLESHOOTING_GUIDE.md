# 🔧 دليل استكشاف الأخطاء وإصلاحها

## 🎯 نظرة عامة

هذا الدليل يساعدك في تشخيص وحل المشاكل الشائعة في النظام.

---

## 🚨 المشاكل الشائعة وحلولها

### **1. 🤖 مشاكل Gemini AI**

#### **❌ المشكلة: Gemini لا يرد**
```
🔍 الأعراض:
- لا توجد ردود من Gemini
- رسائل خطأ في اللوج
- timeout errors
```

```javascript
🔧 الحلول:
1. تحقق من مفتاح API:
   - اذهب للإعدادات
   - تأكد من صحة مفتاح Gemini API
   - جرب مفتاح جديد

2. تحقق من الاتصال:
   - ping google.com
   - تحقق من الإنترنت
   - جرب VPN إذا كان محجوب

3. تحقق من اللوج:
   console.log('🔧 Gemini settings:', settings);
   console.log('🚀 API Response:', response);
```

#### **❌ المشكلة: Gemini يرد بأخطاء**
```
🔍 الأعراض:
- "API key not valid"
- "Quota exceeded"
- "Model not found"
```

```javascript
🔧 الحلول:
1. مفتاح API خطأ:
   - احصل على مفتاح جديد من Google AI Studio
   - تأكد من تفعيل Gemini API

2. تجاوز الحد المسموح:
   - انتظر حتى إعادة تعيين الحد
   - ترقية الحساب إذا لزم الأمر

3. نموذج خطأ:
   - استخدم 'gemini-1.5-flash'
   - تحقق من النماذج المتاحة
```

### **2. 🎨 مشاكل نظام الألوان**

#### **❌ المشكلة: لا يتم كشف الألوان**
```
🔍 الأعراض:
- "No color found in Gemini response"
- الصور لا تُرسل
- كشف خطأ للألوان
```

```javascript
🔧 الحلول:
1. تحقق من الألوان المتاحة:
   curl http://localhost:3002/api/colors
   
2. تحقق من الكلمات المفتاحية:
   - تأكد من وجود الكلمات الصحيحة
   - أضف مرادفات للألوان
   
3. تحقق من اللوج:
   console.log('🎨 Loaded colors:', colorMap);
   console.log('🔍 Searching in:', text);
```

#### **❌ المشكلة: الألوان لا تُحفظ**
```
🔍 الأعراض:
- الألوان تختفي بعد إعادة التشغيل
- "Error saving colors"
- ملف colors-data.json لا يُنشأ
```

```javascript
🔧 الحلول:
1. تحقق من صلاحيات الملفات:
   chmod 755 ./
   
2. تحقق من مساحة القرص:
   df -h
   
3. تحقق من اللوج:
   console.log('💾 Colors saved to file successfully');
   console.log('❌ Error saving colors:', error);
```

### **3. 📱 مشاكل Facebook API**

#### **❌ المشكلة: الرسائل لا تُرسل**
```
🔍 الأعراض:
- "Upload attachment failure"
- "Invalid access token"
- timeout في إرسال الرسائل
```

```javascript
🔧 الحلول:
1. تحقق من Access Token:
   - اذهب للإعدادات
   - تأكد من صحة Page Access Token
   - جدد التوكن إذا انتهت صلاحيته

2. تحقق من صلاحيات الصفحة:
   - pages_messaging
   - pages_read_engagement
   - pages_manage_metadata

3. اختبر الاتصال:
   curl -X GET "https://graph.facebook.com/v18.0/me?access_token=YOUR_TOKEN"
```

#### **❌ المشكلة: Webhook لا يعمل**
```
🔍 الأعراض:
- لا تصل رسائل من Facebook
- "Webhook verification failed"
- 404 errors على webhook URL
```

```javascript
🔧 الحلول:
1. تحقق من URL:
   - تأكد من أن الخادم يعمل
   - تحقق من HTTPS (مطلوب للإنتاج)
   - اختبر: curl https://your-domain.com/webhook

2. تحقق من Verify Token:
   - تأكد من تطابق التوكن في Facebook وقاعدة البيانات
   
3. تحقق من اللوج:
   console.log('📨 Webhook verification:', req.query);
```

### **4. 💾 مشاكل قاعدة البيانات**

#### **❌ المشكلة: فشل الاتصال بقاعدة البيانات**
```
🔍 الأعراض:
- "Database connection failed"
- "Supabase client error"
- بيانات لا تُحفظ
```

```javascript
🔧 الحلول:
1. تحقق من متغيرات البيئة:
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY

2. تحقق من الاتصال:
   - اذهب لـ Supabase Dashboard
   - تحقق من حالة المشروع
   - جرب الاستعلامات يدوياً

3. تحقق من الصلاحيات:
   - RLS policies
   - Table permissions
   - API access
```

### **5. 🖼️ مشاكل الصور**

#### **❌ المشكلة: الصور لا تُرسل**
```
🔍 الأعراض:
- "Image upload failed"
- "URL not accessible"
- صور مكسورة
```

```javascript
🔧 الحلول:
1. تحقق من روابط الصور:
   curl -I https://files.easy-orders.net/image.jpg
   
2. تحقق من تنسيق الصور:
   - JPG, PNG, GIF مدعومة
   - حجم أقل من 25MB
   - HTTPS مطلوب

3. تحقق من اللوج:
   console.log('📤 Sending image:', imageUrl);
   console.log('📤 Facebook API response:', response);
```

---

## 🔍 أدوات التشخيص

### **1. فحص حالة النظام**
```bash
# تحقق من تشغيل الخدمات
ps aux | grep node
netstat -tlnp | grep :3002

# تحقق من اللوج
tail -f /path/to/logfile
```

### **2. اختبار APIs**
```bash
# اختبار Colors API
curl http://localhost:3002/api/colors

# اختبار كشف الألوان
curl -X POST http://localhost:3002/api/colors/detect \
  -H "Content-Type: application/json" \
  -d '{"text": "أحمر"}'

# اختبار معالجة الرسائل
curl -X POST http://localhost:3002/api/process-message \
  -H "Content-Type: application/json" \
  -d '{"senderId": "test", "messageText": "test", "messageId": "test", "pageId": "test", "timestamp": 123}'
```

### **3. فحص قاعدة البيانات**
```sql
-- تحقق من الجداول
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- تحقق من الإعدادات
SELECT * FROM gemini_settings;
SELECT * FROM facebook_settings;

-- تحقق من المحادثات الحديثة
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 10;
```

### **4. فحص الملفات**
```bash
# تحقق من ملف الألوان
cat colors-data.json | jq .

# تحقق من صلاحيات الملفات
ls -la colors-data.json

# تحقق من مساحة القرص
df -h
```

---

## 📊 مراقبة الأداء

### **مؤشرات مهمة للمراقبة:**

#### **1. زمن الاستجابة**
```javascript
// في الكود
const startTime = Date.now();
// ... العملية
const endTime = Date.now();
console.log(`⏱️ Operation took: ${endTime - startTime}ms`);
```

#### **2. معدل النجاح**
```javascript
// تتبع النجاح والفشل
let successCount = 0;
let errorCount = 0;

// في كل عملية
if (success) successCount++;
else errorCount++;

console.log(`📊 Success rate: ${successCount/(successCount+errorCount)*100}%`);
```

#### **3. استخدام الذاكرة**
```bash
# مراقبة استخدام الذاكرة
top -p $(pgrep node)
htop
```

---

## 🚨 إجراءات الطوارئ

### **عند توقف النظام:**

#### **1. إعادة تشغيل سريعة**
```bash
# إيقاف العمليات
pkill -f "npm run api"
pkill -f "npm run dev"

# إعادة التشغيل
npm run api &
npm run dev &
```

#### **2. فحص سريع**
```bash
# تحقق من الخدمات
curl http://localhost:3002/api/colors
curl http://localhost:8080

# تحقق من قاعدة البيانات
# اذهب لـ Supabase Dashboard
```

#### **3. استعادة من النسخ الاحتياطية**
```bash
# استعادة ملف الألوان
cp colors-data.json.backup colors-data.json

# استعادة إعدادات قاعدة البيانات
# من Supabase Dashboard
```

---

## 📞 الحصول على المساعدة

### **معلومات مفيدة للدعم:**

#### **1. معلومات النظام**
```bash
# إصدار Node.js
node --version

# إصدار npm
npm --version

# نظام التشغيل
uname -a
```

#### **2. لوج الأخطاء**
```bash
# آخر 50 سطر من اللوج
tail -50 /path/to/logfile

# البحث عن أخطاء محددة
grep "ERROR" /path/to/logfile
```

#### **3. حالة الخدمات**
```bash
# حالة العمليات
ps aux | grep node

# حالة المنافذ
netstat -tlnp | grep :3002
netstat -tlnp | grep :8080
```

### **قبل طلب المساعدة:**
1. ✅ جرب الحلول في هذا الدليل
2. ✅ اجمع معلومات النظام واللوج
3. ✅ حدد الخطوات لإعادة إنتاج المشكلة
4. ✅ اذكر متى بدأت المشكلة
5. ✅ اذكر أي تغييرات حديثة في النظام
