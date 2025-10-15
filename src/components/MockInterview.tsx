import { useState, useEffect, useRef } from "react";

// Extend Window interface to include speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

interface MockInterviewProps {
  userInfo: {
    name: string;
    program: string;
    university: string;
    country: string;
  };
}

export default function MockInterview({ userInfo }: MockInterviewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const interviewQuestions = [
    "Good day! Welcome to your visa interview preparation. Could you please introduce yourself and tell me why you want to study in Sweden?",
    "What specific program will you be studying and why did you choose this particular field?",
    "How do you plan to finance your studies and living expenses in Sweden?",
    "What are your plans after completing your studies? Do you intend to return to your home country?",
    "How will studying in Sweden contribute to your career goals?",
    "Do you have any ties to your home country that will ensure your return?",
    "Have you visited Sweden before? What do you know about Swedish culture and education system?",
    "Thank you for participating in this mock interview. You've done well! Remember to speak confidently and provide specific examples during your actual visa interview."
  ];

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: '1',
      role: 'ai',
      content: `Hello ${userInfo.name}! Welcome to your mock visa interview for studying ${userInfo.program} at ${userInfo.university}. I'll be conducting a practice interview similar to what you might experience at the Swedish embassy. Are you ready to begin?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    if (isAudioEnabled) {
      speakMessage(welcomeMessage.content);
    }

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({ title: "Speech recognition error", description: "Please try again or type your response." });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const speakMessage = (text: string) => {
    if (!isAudioEnabled) return;
    
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    synthesisRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleUserMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Generate AI response
    setTimeout(() => {
      let aiResponse = "";
      
      if (currentQuestion < interviewQuestions.length - 1) {
        // Provide feedback and ask next question
        const feedbacks = [
          "Thank you for that response. ",
          "That's a good answer. ",
          "I see. ",
          "Interesting. ",
          "Thank you for sharing that. "
        ];
        
        aiResponse = feedbacks[Math.floor(Math.random() * feedbacks.length)] + interviewQuestions[currentQuestion + 1];
        setCurrentQuestion(prev => prev + 1);
      } else {
        aiResponse = interviewQuestions[interviewQuestions.length - 1];
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (isAudioEnabled) {
        speakMessage(aiResponse);
      }
    }, 1000);

    setInputMessage("");
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      handleUserMessage(inputMessage.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (!isAudioEnabled) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="h-full bg-background p-4 flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 flex flex-col">
        {/* Header */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Mock Visa Interview
                  <Badge variant="secondary">Practice Session</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Preparing for: {userInfo.program} at {userInfo.university}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAudio}
                  className="flex items-center gap-2"
                >
                  {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  {isAudioEnabled ? "Audio On" : "Audio Off"}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Interface */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isSpeaking && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm flex items-center gap-2">
                    <div className="animate-pulse flex space-x-1">
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    Speaking...
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4 space-y-2">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your response or use voice input..."
                onKeyPress={handleKeyPress}
                disabled={isSpeaking}
                className="flex-1"
              />
              <Button
                onClick={isListening ? stopListening : startListening}
                variant="outline"
                size="icon"
                disabled={isSpeaking}
                className={isListening ? "bg-red-100 border-red-300" : ""}
              >
                {isListening ? <MicOff className="h-4 w-4 text-red-600" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isSpeaking}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isListening ? "Listening... Speak now" : "Click the microphone to use voice input or type your response"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}