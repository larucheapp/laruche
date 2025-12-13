import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Library, Loader2, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const WikiAssistantTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Bonjour ! Je suis Apis. Posez-moi une question, je chercherai un résumé sur Wikipédia."
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // --- Logic ---

  const findBestMatch = async (query: string) => {
    const searchEndpoint = `https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    try {
      const response = await fetch(searchEndpoint);
      const data = await response.json();
      if (data.query.search.length > 0) {
        return data.query.search[0].title;
      }
      return null;
    } catch (error) {
      console.error("Wikipedia Search API Error:", error);
      return null;
    }
  };

  const getSummaryForPage = async (title: string) => {
    const summaryEndpoint = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    try {
      const response = await fetch(summaryEndpoint, {
        headers: { 'Accept': 'application/json; charset=utf-8' }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.extract;
    } catch (error) {
      console.error("Wikipedia Summary API Error:", error);
      return null;
    }
  };

  const typeWriterEffect = (text: string) => {
    setIsTyping(true);
    const words = text.split(' ');
    let currentWordIndex = 0;
    
    // Add empty assistant message
    const msgId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: msgId, role: 'assistant', content: '' }]);

    const intervalId = setInterval(() => {
      if (currentWordIndex < words.length) {
        setMessages(prev => prev.map(msg => {
          if (msg.id === msgId) {
            return {
              ...msg,
              content: msg.content + (msg.content ? ' ' : '') + words[currentWordIndex]
            };
          }
          return msg;
        }));
        currentWordIndex++;
      } else {
        clearInterval(intervalId);
        setIsTyping(false);
        // Re-focus input after typing
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }, 50); // Typing speed
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: userMsg }]);
    setIsThinking(true);

    try {
      // 1. Search
      const bestTitle = await findBestMatch(userMsg);
      let responseText = "Désolé, je n'ai rien trouvé sur Wikipédia pour cette recherche.";

      // 2. Get Summary
      if (bestTitle) {
        const summary = await getSummaryForPage(bestTitle);
        if (summary) {
          responseText = summary;
        } else {
          responseText = `J'ai trouvé un article intitulé "${bestTitle}", mais je n'ai pas pu en extraire le résumé.`;
        }
      }

      setIsThinking(false);
      typeWriterEffect(responseText);

    } catch (err) {
      setIsThinking(false);
      typeWriterEffect("Une erreur est survenue lors de la communication avec Wikipédia.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden bg-zinc-950/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2 text-violet-400">
          <Library size={18} />
          <h2 className="text-[10px] font-bold uppercase tracking-wider">Assistant Wiki</h2>
        </div>
        <div className="bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
            <span className="text-[9px] text-violet-300 font-medium flex items-center gap-1">
                <Sparkles size={8} /> AI Assistant
            </span>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-1 min-h-0"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-2 max-w-[90%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
          >
            {/* Avatar */}
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center shrink-0 border
              ${msg.role === 'assistant' 
                ? 'bg-zinc-800 border-zinc-700 text-violet-400' 
                : 'bg-violet-600 border-violet-500 text-white'}
            `}>
              {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>

            {/* Bubble */}
            <div className={`
              px-3 py-2 rounded-2xl text-xs leading-relaxed
              ${msg.role === 'assistant' 
                ? 'bg-zinc-800/80 text-zinc-200 rounded-tl-none border border-zinc-700/50' 
                : 'bg-violet-600 text-white rounded-tr-none shadow-lg shadow-violet-900/20'}
            `}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-2 max-w-[85%] self-start animate-pulse">
             <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-violet-400">
                <Bot size={14} />
             </div>
             <div className="bg-zinc-800/50 px-3 py-2 rounded-2xl rounded-tl-none border border-zinc-700/50 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="mt-2 pt-2 border-t border-white/5 flex gap-2 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isThinking || isTyping}
          placeholder="Chercher sur Wikipédia..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 text-xs text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none transition-colors disabled:opacity-50"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isThinking || isTyping}
          className="w-9 h-9 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-all shadow-lg shadow-violet-900/20"
        >
          {isThinking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
};