
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, User, Clock, MessageSquare, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConversationsListProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
}

const ConversationsList = ({ selectedConversation, onSelectConversation }: ConversationsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingConversation, setDeletingConversation] = useState<string | null>(null);
  const { conversations, isLoading, error, refetch } = useConversations();

  // حذف المحادثة
  const deleteConversation = async (conversationId: string) => {
    try {
      setDeletingConversation(conversationId);

      // حذف الرسائل أولاً
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) {
        throw messagesError;
      }

      // حذف الطلبات المرتبطة (إن وجدت)
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .eq('conversation_id', conversationId);

      if (ordersError) {
        console.warn('Error deleting related orders:', ordersError);
      }

      // حذف المحادثة
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) {
        throw conversationError;
      }

      toast.success('تم حذف المحادثة بنجاح');

      // إذا كانت المحادثة المحذوفة هي المحددة، قم بإلغاء التحديد
      if (selectedConversation === conversationId) {
        onSelectConversation('');
      }

      // إعادة تحميل المحادثات
      refetch();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('فشل في حذف المحادثة');
    } finally {
      setDeletingConversation(null);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.customer_name.includes(searchTerm) ||
    (conv.last_message && conv.last_message.includes(searchTerm))
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  if (error) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-500">
            <p>خطأ في تحميل المحادثات</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="text-lg">المحادثات</CardTitle>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="البحث في المحادثات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-scroll p-0" style={{maxHeight: 'calc(100vh - 300px)'}}>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="mr-2">تحميل المحادثات...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد محادثات</p>
              <p className="text-sm mt-2">ستظهر المحادثات هنا عند وصول رسائل جديدة</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 pb-4">
            {/* إضافة بيانات تجريبية للاختبار */}
            {filteredConversations.length === 0 && (
              <>
                {Array.from({ length: 15 }, (_, i) => (
                  <div
                    key={`test-${i}`}
                    className="p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onSelectConversation(`test-${i}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3 space-x-reverse flex-1">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">مستخدم تجريبي {i + 1}</h4>
                          <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>منذ {i + 1} دقيقة</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-red-500 text-white text-xs">
                        {i + 1}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      رسالة تجريبية رقم {i + 1} - هذا نص تجريبي لاختبار التمرير
                    </p>
                  </div>
                ))}
              </>
            )}
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                  selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div
                    className="flex items-center space-x-3 space-x-reverse flex-1 cursor-pointer"
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      {conversation.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{conversation.customer_name}</h4>
                      <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(conversation.last_message_at)}</span>
                      </div>
                      {conversation.page_name && (
                        <div className="text-xs text-blue-600 mt-1">
                          📄 {conversation.page_name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    {conversation.unread_count > 0 && (
                      <Badge className="bg-red-500 text-white text-xs">
                        {conversation.unread_count}
                      </Badge>
                    )}

                    {/* زر الحذف */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={deletingConversation === conversation.id}
                        >
                          {deletingConversation === conversation.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف المحادثة</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف محادثة "{conversation.customer_name}"؟
                            <br />
                            سيتم حذف جميع الرسائل والطلبات المرتبطة بهذه المحادثة نهائياً.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteConversation(conversation.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div
                  className="cursor-pointer"
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.last_message || "لا توجد رسائل"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationsList;
