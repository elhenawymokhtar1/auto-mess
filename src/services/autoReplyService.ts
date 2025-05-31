import { createClient } from '@supabase/supabase-js';
import { FacebookApiService } from "./facebookApi";
import { GeminiAiService } from "./geminiAi";

// إعداد Supabase
const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface AutoReplyMatch {
  id: string;
  keywords: string[];
  response_text: string;
  matchedKeyword: string;
}

export class AutoReplyService {
  // البحث عن رد مناسب للرسالة
  static async findMatchingReply(message: string): Promise<AutoReplyMatch | null> {
    try {
      const { data: autoReplies, error } = await supabase
        .from('auto_replies')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching auto replies:', error);
        return null;
      }

      const messageText = message.toLowerCase().trim();

      for (const reply of autoReplies) {
        for (const keyword of reply.keywords) {
          if (messageText.includes(keyword.toLowerCase())) {
            return {
              id: reply.id,
              keywords: reply.keywords,
              response_text: reply.response_text,
              matchedKeyword: keyword
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error in findMatchingReply:', error);
      return null;
    }
  }

  // معالجة رسالة واردة وإرسال رد آلي إذا وُجد
  static async processIncomingMessage(
    senderId: string,
    message: string,
    conversationId?: string
  ): Promise<boolean> {
    try {
      console.log(`🔍 Processing message: "${message}" for sender: ${senderId}`);

      // أولاً: البحث عن رد آلي تقليدي
      const matchingReply = await this.findMatchingReply(message);

      if (matchingReply) {
        console.log(`📝 Found traditional auto reply for keyword: ${matchingReply.matchedKeyword}`);
        // إرسال الرد التقليدي
        const success = await this.sendTraditionalReply(senderId, matchingReply, conversationId);
        if (success) return true;
      }

      // ثانياً: إذا لم يوجد رد تقليدي، جرب Gemini AI
      console.log('🤖 No traditional auto reply found, trying Gemini AI...');

      if (!conversationId) {
        console.log('❌ No conversation ID provided for Gemini AI');
        return false;
      }

      // التحقق من حالة Gemini AI
      const { GeminiAiService } = await import('./geminiAi');
      const geminiSettings = await GeminiAiService.getGeminiSettings();

      if (!geminiSettings || !geminiSettings.is_enabled) {
        console.log('🚫 Gemini AI is disabled - sending default response');

        // إرسال رد افتراضي عندما يكون Gemini معطل بدون استخدام GeminiAiService
        const defaultResponse = "شكراً لتواصلك معنا! سيتم الرد عليك قريباً من قبل فريق خدمة العملاء.";

        try {
          // إرسال الرد مباشرة عبر Facebook API بدون Gemini
          const success = await this.sendDirectReply(senderId, defaultResponse, conversationId);
          if (success) {
            console.log('✅ Default response sent successfully');
            return true;
          } else {
            console.error('❌ Failed to send default response');
            return false;
          }
        } catch (error) {
          console.error('❌ Failed to send default response:', error);
          return false;
        }
      }

      console.log(`🚀 Calling Gemini AI for conversation: ${conversationId}`);
      console.log('🔍 About to call GeminiAiService.processIncomingMessage with:', { message, conversationId, senderId });
      console.log('🔍 GeminiAiService object:', GeminiAiService);
      console.log('🔍 processIncomingMessage function:', GeminiAiService.processIncomingMessage);
      const geminiSuccess = await GeminiAiService.processIncomingMessage(
        message,
        conversationId,
        senderId
      );
      console.log('🔍 GeminiAiService.processIncomingMessage returned:', geminiSuccess);

      if (geminiSuccess) {
        console.log('✅ Gemini AI response sent successfully');
        return true;
      } else {
        console.log('❌ Gemini AI failed to process message');
      }

      console.log('No matching auto reply found for message:', message);
      return false;
    } catch (error) {
      console.error('Error processing incoming message:', error);
      return false;
    }
  }

  // إرسال رد مباشر بدون Gemini (للرد الافتراضي عند تعطيل Gemini)
  private static async sendDirectReply(
    senderId: string,
    message: string,
    conversationId?: string
  ): Promise<boolean> {
    try {
      console.log('📤 Sending direct reply without Gemini...');

      // الحصول على إعدادات Facebook
      const { data: facebookSettings, error: settingsError } = await supabase
        .from('facebook_settings')
        .select('*')
        .single();

      if (settingsError || !facebookSettings) {
        console.error('Facebook settings not found:', settingsError);
        return false;
      }

      // إرسال الرد مباشرة
      const facebookService = new FacebookApiService(facebookSettings.access_token);

      const result = await facebookService.sendMessage(
        facebookSettings.access_token,
        senderId,
        message
      );

      if (result) {
        console.log('✅ Direct reply sent successfully:', {
          senderId,
          message: message.substring(0, 50) + '...'
        });

        // حفظ الرد في قاعدة البيانات إذا كان لدينا معرف المحادثة
        if (conversationId) {
          await this.saveAutoReplyMessage(conversationId, message, false);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error sending direct reply:', error);
      return false;
    }
  }

  // إرسال رد تقليدي
  private static async sendTraditionalReply(
    senderId: string,
    matchingReply: AutoReplyMatch,
    conversationId?: string
  ): Promise<boolean> {
    try {
      // الحصول على إعدادات Facebook
      const { data: facebookSettings, error: settingsError } = await supabase
        .from('facebook_settings')
        .select('*')
        .single();

      if (settingsError || !facebookSettings) {
        console.error('Facebook settings not found:', settingsError);
        return false;
      }

      // إرسال الرد الآلي
      const facebookService = new FacebookApiService(facebookSettings.access_token);

      const result = await facebookService.sendMessage(
        facebookSettings.access_token,
        senderId,
        matchingReply.response_text
      );

      if (result) {
        console.log('Traditional auto reply sent successfully:', {
          senderId,
          matchedKeyword: matchingReply.matchedKeyword,
          response: matchingReply.response_text
        });

        // حفظ الرد في قاعدة البيانات إذا كان لدينا معرف المحادثة
        if (conversationId) {
          await this.saveAutoReplyMessage(conversationId, matchingReply.response_text, false);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error sending traditional reply:', error);
      return false;
    }
  }

  // حفظ الرد الآلي في قاعدة البيانات
  static async saveAutoReplyMessage(
    conversationId: string,
    responseText: string,
    isAiGenerated: boolean = false
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: responseText,
          sender_type: 'bot',
          is_read: true,
          is_auto_reply: true,
          is_ai_generated: isAiGenerated
        });

      if (error) {
        console.error('Error saving auto reply message:', error);
      }
    } catch (error) {
      console.error('Error in saveAutoReplyMessage:', error);
    }
  }

  // إنشاء محادثة جديدة إذا لم تكن موجودة
  static async getOrCreateConversation(
    customerFacebookId: string,
    customerName: string,
    pageId: string
  ): Promise<string | null> {
    try {
      // البحث عن محادثة موجودة بـ customer_facebook_id فقط (لأن فيه unique constraint عليه)
      const { data: existingConversation, error: searchError } = await supabase
        .from('conversations')
        .select('id, customer_name')
        .eq('customer_facebook_id', customerFacebookId)
        .maybeSingle(); // استخدام maybeSingle بدلاً من single

      if (searchError && searchError.code !== 'PGRST116') {
        console.error('Error searching for conversation:', searchError);
        return null;
      }

      if (existingConversation) {
        // إذا كانت المحادثة موجودة ولكن الاسم يبدأ بـ "User" والاسم الجديد مختلف، قم بتحديثه
        if (existingConversation.customer_name.startsWith('User ') &&
            customerName !== existingConversation.customer_name &&
            !customerName.startsWith('User ')) {

          console.log(`🔄 تحديث اسم العميل: ${existingConversation.customer_name} → ${customerName}`);

          const { error: updateError } = await supabase
            .from('conversations')
            .update({
              customer_name: customerName,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingConversation.id);

          if (updateError) {
            console.error('Error updating customer name:', updateError);
          } else {
            console.log('✅ تم تحديث اسم العميل بنجاح');
          }
        }

        return existingConversation.id;
      }

      // محاولة الحصول على الاسم الحقيقي من Facebook API
      let realName = customerName;
      try {
        const { FacebookApiService } = await import('./facebookApi');
        const pageSettings = await FacebookApiService.getPageSettings(pageId);

        if (pageSettings && pageSettings.access_token) {
          const facebookService = new FacebookApiService(pageSettings.access_token);
          const userInfo = await facebookService.getUserInfo(customerFacebookId, pageSettings.access_token);

          if (userInfo && userInfo.name) {
            realName = userInfo.name;
            console.log(`✅ Got real name for new conversation: ${realName} (ID: ${customerFacebookId})`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not get real name for ${customerFacebookId}, using: ${customerName}`);
      }

      // إنشاء محادثة جديدة
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          facebook_page_id: pageId,
          customer_facebook_id: customerFacebookId,
          customer_name: realName, // استخدام الاسم الحقيقي إذا توفر
          last_message_at: new Date().toISOString(),
          is_online: true,
          unread_count: 0 // ابدأ بـ 0 وسيتم زيادته في updateConversation
        })
        .select('id')
        .single();

      if (createError) {
        // إذا كان duplicate key error، جرب البحث مرة أخرى
        if (createError.code === '23505') {
          console.log('⚠️ Conversation already exists, fetching it...');
          const { data: existingConv } = await supabase
            .from('conversations')
            .select('id')
            .eq('customer_facebook_id', customerFacebookId)
            .single();

          return existingConv?.id || null;
        }

        console.error('Error creating conversation:', createError);
        return null;
      }

      return newConversation.id;
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error);
      return null;
    }
  }

  // معالجة webhook من Facebook
  static async handleFacebookWebhook(webhookData: any): Promise<void> {
    try {
      if (webhookData.object !== 'page') {
        return;
      }

      for (const entry of webhookData.entry) {
        const pageId = entry.id;

        if (entry.messaging) {
          for (const messagingEvent of entry.messaging) {
            if (messagingEvent.message && !messagingEvent.message.is_echo) {
              const senderId = messagingEvent.sender.id;
              const messageText = messagingEvent.message.text;

              if (messageText) {
                // الحصول على معلومات المرسل الحقيقية من Facebook API
                let senderName = `User ${senderId}`;

                try {
                  // الحصول على إعدادات الصفحة للحصول على access token
                  const { FacebookApiService } = await import('./facebookApi');
                  const pageSettings = await FacebookApiService.getPageSettings(pageId);

                  if (pageSettings && pageSettings.access_token) {
                    const facebookService = new FacebookApiService(pageSettings.access_token);
                    const userInfo = await facebookService.getUserInfo(senderId, pageSettings.access_token);

                    if (userInfo && userInfo.name) {
                      senderName = userInfo.name;
                      console.log(`✅ Got real user name: ${senderName} for ID: ${senderId}`);
                    }
                  }
                } catch (error) {
                  console.error('Error getting user name from Facebook API:', error);
                  // استخدم الاسم الافتراضي في حالة الخطأ
                }

                // إنشاء أو الحصول على المحادثة
                const conversationId = await this.getOrCreateConversation(
                  senderId,
                  senderName,
                  pageId
                );

                if (conversationId) {
                  // حفظ الرسالة الواردة
                  await supabase
                    .from('messages')
                    .insert({
                      conversation_id: conversationId,
                      content: messageText,
                      sender_type: 'customer',
                      is_read: false,
                      is_auto_reply: false
                    });

                  // معالجة الرد الآلي
                  await this.processIncomingMessage(senderId, messageText, conversationId);

                  // تحديث المحادثة
                  await supabase
                    .from('conversations')
                    .update({
                      last_message: messageText,
                      last_message_at: new Date().toISOString(),
                      unread_count: supabase.rpc('increment_unread_count', { conversation_id: conversationId })
                    })
                    .eq('id', conversationId);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling Facebook webhook:', error);
    }
  }
}
