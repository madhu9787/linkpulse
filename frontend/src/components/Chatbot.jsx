import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { FiMessageSquare, FiSend, FiX, FiMinus, FiCpu, FiZap, FiMessageCircle } from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm **PulseBot**, your AI helper. Ask me anything about creating links, analytics, QR codes, password protection, or custom aliases!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send message history along with the new message
      const history = messages.map(({ role, content }) => ({ role, content }));
      const response = await api.post('/chat', {
        messages: [...history, userMessage],
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (err) {
      console.error('Failed to chat:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I am having trouble connecting right now. Please make sure the server is running and try again!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Minimal formatting helper for simple bold/markdown tags in answers
  const formatMarkdown = (text) => {
    if (!text) return '';
    // Replace **bold** with <strong>bold</strong>
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace *bullet* points on newlines
    html = html.replace(/^\s*\*\s+(.*?)$/gm, '<li class="ml-4 list-disc my-1">$1</li>');
    // Replace newlines with breaks
    return html.split('\n').join('<br />');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* ── Chat Toggle Button ── */}
      {!isOpen && (
        <div className="relative group flex items-center justify-end">
          {/* Tooltip / Hover Pill */}
          <div className={`absolute right-20 transition-all duration-500 whitespace-nowrap bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl mr-2 ${showTooltip ? 'opacity-100 scale-100 animate-bounce' : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100'}`}>
            ✨ Click me to explore or ask your queries
          </div>
          
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-16 h-16 rounded-full bg-linear-to-br from-purple-500 via-fuchsia-500 to-pink-500 text-white flex items-center justify-center shadow-lg hover:shadow-fuchsia-500/40 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border border-white/20 overflow-hidden z-50 p-0"
          >
            <div className="absolute inset-0 bg-white/10 blur-xl rounded-full" />
            <FiMessageCircle size={28} className="relative z-10 drop-shadow-md" />
            <span className="absolute top-3 right-3 flex h-3 w-3 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)] border border-white/50"></span>
            </span>
          </button>
        </div>
      )}

      {/* ── Chat Box Window ── */}
      {isOpen && (
        <div
          className="animate-scale-in w-[340px] sm:w-[400px] h-[550px] rounded-3xl border border-white/10 bg-black/60 backdrop-blur-3xl flex flex-col overflow-hidden"
          style={{
            boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
          }}
        >
          {/* Header */}
          <div className="relative px-5 py-4 flex items-center justify-between border-b border-white/10 bg-white/5">
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-purple-500/20 via-fuchsia-500/20 to-pink-500/20 pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-linear-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30 border border-white/20">
                <FiMessageCircle size={22} className="text-white drop-shadow-md" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white tracking-tight leading-none flex items-center gap-1">
                  Pulse AI <FiZap size={12} className="text-yellow-400" />
                </h3>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-bold uppercase tracking-wider mt-1.5 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  Online & Ready
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Minimize"
              >
                <FiMinus size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <FiX size={14} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 scrollbar-thin">
            {messages.map((msg, i) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={i}
                  className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ${
                      isAssistant
                        ? 'bg-white/10 text-slate-100 border border-white/10 rounded-tl-sm backdrop-blur-md'
                        : 'bg-linear-to-br from-purple-500 via-fuchsia-500 to-pink-500 text-white rounded-tr-sm border border-fuchsia-400/20'
                    }`}
                  >
                    <p
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                      className="leading-relaxed break-words"
                    />
                  </div>
                </div>
              );
            })}

            {/* Loading / Typing bubble */}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div
                  className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm px-5 py-4 border border-white/10 flex gap-2 items-center shadow-lg"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Helper (when chat is empty/starts) */}
          {messages.length === 1 && !loading && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 justify-center border-t border-white/5" style={{ borderColor: 'var(--border-sub)' }}>
              {[
                'How to shorten link?',
                'Password gate?',
                'View analytics?',
              ].map((txt) => (
                <button
                  key={txt}
                  onClick={() => { setInput(txt); }}
                  className="text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
                >
                  {txt}
                </button>
              ))}
            </div>
          )}

          {/* Input Form Footer */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-white/10 bg-white/5 flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Pulse AI..."
              className="flex-1 min-w-0 h-11 px-4 rounded-full text-sm outline-none transition-all bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-full bg-linear-to-br from-purple-500 via-fuchsia-500 to-pink-500 text-white flex items-center justify-center shadow-lg hover:shadow-fuchsia-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex-shrink-0 cursor-pointer border border-white/20"
            >
              <FiSend size={15} className="ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
