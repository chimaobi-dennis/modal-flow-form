import { useState } from "react";
import { MessageSquare, X, Send, User, Bot, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Message {
  id: string;
  type: 'user' | 'ai' | 'officer';
  content: string;
  timestamp: Date;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotModal = ({ isOpen, onClose }: ChatbotModalProps) => {
  const [activeChat, setActiveChat] = useState<'ai' | 'officer'>('ai');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m here to help you with your application process. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate response
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: activeChat,
        content: activeChat === 'ai' 
          ? 'I understand your question. Let me help you with that...'
          : 'Thank you for contacting us. A case officer will review your query and respond within 24 hours.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 1000);

    setNewMessage('');
  };

  const switchToOfficer = () => {
    setActiveChat('officer');
    const switchMessage: Message = {
      id: Date.now().toString(),
      type: 'officer',
      content: 'You\'ve been connected to a case officer. Please describe your issue and we\'ll assist you promptly.',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, switchMessage]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md xl:h-[550px] h-[500px] flex flex-col shadow-xl border-0">
        <CardHeader className="pb-3 bg-gradient-to-r bg-white from-primary/10 to-primary/5 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Help Center</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-destructive/10 hover:text-destructive">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button
              variant={activeChat === 'ai' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 rounded-full"
              onClick={() => setActiveChat('ai')}
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
            <Button
              variant={activeChat === 'officer' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 rounded-full"
              onClick={switchToOfficer}
            >
              <Phone className="h-4 w-4 mr-2" />
              Case Officer
            </Button>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <ScrollArea className="flex-1 p-4 bg-gradient-to-r from-primary/100 to-primary/100 max-h-[550px]">
            <div className="space-y-4 pr-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                   {message.type !== 'user' && (
                    <div className="flex-shrink-0">
                      {message.type === 'ai' ? (
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-orange-50 to-orange-50 text-primary'
                        : message.type === 'ai'
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-primary border border-blue-100'
                        : 'bg-gradient-to-r from-green-50 to-emerald-50 text-primary border border-green-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gradient-to-br from-slate-600 to-slate-700 bg rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-50" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          <div className="p-4 bg-muted/30 bg-gradient-to-r from-primary/50 to-primary/50">
            <div className="flex gap-2 bg-gradient-to-r from-primary/5 to-primary/5 rounded-full">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="rounded-full border-0 bg-background shadow-sm"
              />
              <Button onClick={handleSendMessage} className="rounded-full px-4">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatbotModal;