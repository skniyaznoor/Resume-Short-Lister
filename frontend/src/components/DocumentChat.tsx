import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function DocumentChat({ extractedText }: { extractedText: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: `You are an expert legal document assistant. The user has uploaded a document. Here is the text:\n\n${extractedText}\n\nAnswer the user's questions based on this document. Keep your responses helpful, clear, and easy to understand.`
    },
    {
      role: 'assistant',
      content: 'Hello! I have read your document. What questions do you have about it?'
    }
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    const updatedMessages = [...messages, userMessage];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (!res.body) throw new Error("No response body");

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: newMessages[lastIndex].content + chunk
          };
          return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred. Please check your API key.' }]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#0a0a0c] border border-white/5 rounded-3xl overflow-hidden mt-8 shadow-2xl">
      <div className="bg-white/5 p-5 border-b border-white/5 font-bold text-white flex items-center space-x-3">
        <div className="p-2 bg-indigo-500/20 rounded-xl">
          <Bot className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h4 className="text-lg">Chat with Document</h4>
          <p className="text-xs text-indigo-300 font-medium tracking-wider uppercase">Powered by OpenRouter 120B Model</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.filter(m => m.role !== 'system').map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex space-x-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-indigo-500 to-purple-700'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-blue-600/20 border border-blue-500/20 text-blue-50' : 'bg-white/5 border border-white/10 text-slate-200'}`}>
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className="flex justify-start animate-in fade-in">
            <div className="flex space-x-3 max-w-[80%]">
               <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-purple-700 shadow-lg">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#050507] border-t border-white/5">
        <div className="relative flex items-center max-w-3xl mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about the document..."
            className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl py-4 pl-5 pr-14 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="absolute right-2 p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-600 rounded-xl text-white transition-all shadow-lg disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
