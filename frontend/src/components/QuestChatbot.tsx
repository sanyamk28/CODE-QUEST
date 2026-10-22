import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  X,
  Send,
  RotateCcw,
  Minimize2,
  Maximize2,
  Copy,
  Check,
  Lightbulb,
  CornerDownLeft,
  MessageSquareCode,
  Compass
} from 'lucide-react';
import { ActiveTabType } from '../types';
import { sendChatMessage, ChatMessage } from '../services/api';

interface QuestChatbotProps {
  activeTab: ActiveTabType;
  userName: string;
  targetRole: string;
  isSimulator?: boolean;
}

// Local smart responder if backend/Gemini is offline or unreachable
const getLocalSmartResponse = (query: string, targetRole: string, screen: string, userName: string) => {
  const q = query.toLowerCase().trim();

  if (q.includes('two pointer') || q.includes('sliding window') || q.includes('binary search') || q.includes('dsa') || q.includes('tree') || q.includes('graph') || q.includes('dynamic programming') || q.includes('algorithm')) {
    return {
      reply: `### 💡 High-Yield DSA Interview Strategy\n\n` +
        `When solving coding interview questions, remember these core patterns:\n\n` +
        `1. **Two Pointers & Sliding Window**:\n` +
        `   - Use when working with sorted arrays, pairs, or contiguous subarrays.\n` +
        `   - Reduces typical $O(N^2)$ brute force to $O(N)$ linear time.\n\n` +
        `2. **Binary Search on Answer**:\n` +
        `   - If the problem asks for the *minimum maximum* or *maximum minimum* value within a range, Binary Search across the search space.\n\n` +
        `3. **Fast Verification Framework**:\n` +
        `   - Trace sample input with $N=1, 2$ and large edge values.\n` +
        `   - Always mention Time & Space complexity before coding!`,
      suggestions: ['Give a Two Pointers code example', 'Top 5 Graph algorithms for interviews', 'How to master Dynamic Programming?']
    };
  }

  if (q.includes('sql') || q.includes('database') || q.includes('index') || q.includes('join') || q.includes('query')) {
    return {
      reply: `### 🗄️ Database & SQL Optimization Guide\n\n` +
        `SQL questions in tech interviews focus on performance and analytical queries:\n\n` +
        `\`\`\`sql\n` +
        `-- Top N per department using window ranking\n` +
        `SELECT department, employee_name, salary\n` +
        `FROM (\n` +
        `  SELECT department, employee_name, salary,\n` +
        `         DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rnk\n` +
        `  FROM employees\n` +
        `) ranked\n` +
        `WHERE rnk <= 3;\n` +
        `\`\`\`\n\n` +
        `- **Index Tip**: B-Tree indexes significantly accelerate \`WHERE\`, \`JOIN\`, and \`ORDER BY\` on high-cardinality columns.\n` +
        `- Check out our **SQL Lab** in the navigation bar to practice live interactive queries!`,
      suggestions: ['Difference between RANK and DENSE_RANK', 'How does indexing work in PostgreSQL?', 'How to optimize slow queries?']
    };
  }

  if (q.includes('resume') || q.includes('ats') || q.includes('bullet') || q.includes('cv')) {
    return {
      reply: `### 📄 Resume & ATS Mastery for ${targetRole || 'Software Engineers'}\n\n` +
        `1. **Google X-Y-Z Formula**:\n` +
        `   > *"Accomplished [X] as measured by [Y], by doing [Z].*\n\n` +
        `2. **Action Verbs + Quantifiable Impact**:\n` +
        `   - Replace *"Worked on backend APIs"* with:\n` +
        `   - *"Architected high-throughput REST APIs using Python & Redis, slashing p99 latency by 45% for 150K DAU."*\n\n` +
        `3. Try uploading your resume to our **Resume ATS** tool in the sidebar for instant real-time scoring!`,
      suggestions: ['Rewrite a bullet point for me', 'What skills should I list on my resume?', 'How to beat ATS filters?']
    };
  }

  if (q.includes('system design') || q.includes('microservice') || q.includes('caching') || q.includes('scalability')) {
    return {
      reply: `### 🏗️ System Design Framework (4-Step Formula)\n\n` +
        `1. **Scope & Scale (5m)**: Features, DAU, read/write ratio, and throughput (QPS).\n` +
        `2. **High-Level Diagram (10m)**: Client ➔ CDN ➔ Load Balancer ➔ Stateless App Cluster ➔ Cache (Redis) ➔ DB.\n` +
        `3. **Data Layer Decisions (15m)**: SQL vs NoSQL, sharding keys, indexing, and replication.\n` +
        `4. **Deep Dive Bottlenecks (15m)**: Single points of failure, rate limiting, and cache invalidation policies.`,
      suggestions: ['Explain CAP Theorem in 60 seconds', 'How does Redis cache invalidation work?', 'Designing a URL Shortener']
    };
  }

  if (q.includes('roadmap') || q.includes('prepare') || q.includes('interview') || q.includes('placement')) {
    return {
      reply: `### 🎯 Targeted Placement Plan for ${userName} (${targetRole || 'Developer'})\n\n` +
        `- **Weeks 1-2**: Master CS Fundamentals (OS, DBMS, Networks, OOP).\n` +
        `- **Weeks 3-5**: Core DSA Patterns (Sliding Window, Trees, Graphs, Heaps).\n` +
        `- **Weeks 6-8**: Practical Full-Stack or System Design projects.\n` +
        `- **Weeks 9+**: Daily mock interviews using our AI Interviewer and live Battle Arena challenges!\n\n` +
        `You can monitor your personalized milestone track in the **Roadmaps** tab anytime!`,
      suggestions: ['How many hours should I study daily?', 'How to prepare for Behavioral / STAR questions?', 'What projects stand out to recruiters?']
    };
  }

  return {
    reply: `Hello ${userName}! 👋 I am **QuestAI**, your dedicated technical interview and engineering mentor on CodeQuest.\n\n` +
      `Here are things I can help you with right now:\n` +
      `- 🧠 **DSA & Coding**: Intuition, complexity analysis, and pattern identification.\n` +
      `- 🗄️ **SQL & Databases**: Window functions, query tuning, and index strategies.\n` +
      `- 📄 **Resume & Career**: Google X-Y-Z bullet rewrites, ATS keywords for **${targetRole || 'Software Engineers'}**.\n` +
      `- 🏗️ **System Design & Architecture**: Scalability, caching, and distributed principles.\n` +
      `- 🎯 **Preparation Advice**: Roadmaps, mock interview tips, and placement strategies.\n\n` +
      `What would you like to dive into today?`,
    suggestions: [
      'Explain Binary Search in simple terms',
      'How to optimize SQL queries for interviews?',
      'Tips to pass technical phone screens'
    ]
  };
};

// Formatted Markdown Message Renderer
const FormattedContent: React.FC<{ content: string }> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="text-[13px] leading-relaxed space-y-2 text-slate-200">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const lang = hasLang ? firstLine : 'code';
          const code = (hasLang ? lines.slice(1) : lines).join('\n');

          return (
            <div key={index} className="my-2.5 rounded-xl overflow-hidden border border-slate-700/70 bg-[#060810] shadow-md">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#0e1424] border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                <span className="font-semibold text-indigo-400 uppercase tracking-wider">{lang}</span>
                <button
                  onClick={() => handleCopy(code, index)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-700/60 text-slate-300 hover:text-white transition text-[11px]"
                  title="Copy code"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 font-mono text-[12px] text-slate-200 overflow-x-auto selection:bg-indigo-600/40">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Render standard text with simple markdown parsing (headers, bold, lists, inline code)
        const paragraphs = part.split('\n');
        return (
          <div key={index} className="space-y-1.5">
            {paragraphs.map((line, pIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={pIdx} className="text-sm font-bold text-white pt-1 text-indigo-300 flex items-center gap-1.5">
                    {trimmed.replace('### ', '')}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={pIdx} className="text-sm font-extrabold text-white pt-1 text-sky-300">
                    {trimmed.replace('## ', '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const bulletText = trimmed.slice(2);
                return (
                  <div key={pIdx} className="flex items-start gap-2 pl-1">
                    <span className="text-indigo-400 font-bold text-xs mt-1">•</span>
                    <span className="flex-1">{parseInlineStyles(bulletText)}</span>
                  </div>
                );
              }
              if (/^\d+\.\s/.test(trimmed)) {
                const numMatch = trimmed.match(/^(\d+\.)\s(.*)/);
                if (numMatch) {
                  return (
                    <div key={pIdx} className="flex items-start gap-2 pl-1">
                      <span className="text-indigo-400 font-semibold text-xs mt-0.5">{numMatch[1]}</span>
                      <span className="flex-1">{parseInlineStyles(numMatch[2])}</span>
                    </div>
                  );
                }
              }

              return <p key={pIdx}>{parseInlineStyles(trimmed)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

// Helper for bold and inline code in paragraphs
function parseInlineStyles(text: string): React.ReactNode {
  // Regex to match **bold** or `inline code`
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const tokens = text.split(regex);

  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800/90 text-indigo-300 font-mono text-[11px] border border-slate-700/60">
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}

export const QuestChatbot: React.FC<QuestChatbotProps> = ({
  activeTab,
  userName,
  targetRole,
  isSimulator = false
}) => {
  // STRICT REQUIREMENT: Chatbot MUST NOT be shown on coding arena, mcq, or brainteasers
  const isExcludedScreen = ['arena', 'mcqs', 'puzzles'].includes(activeTab);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initial welcome message
  const initialMessages: ChatMessage[] = [
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hi **${userName || 'Friend'}**! 👋 I'm **QuestAI**, your 24/7 technical interview & coding mentor.\n\n` +
        `Ask me anything about algorithms, SQL queries, system design, resume ATS optimization, or your preparation roadmap!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('cq_mentor_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialMessages;
  });

  const [suggestions, setSuggestions] = useState<string[]>([
    'Explain Two Pointers pattern',
    'How to optimize SQL joins?',
    'What are the top 5 System Design topics?',
    'Tips to improve ATS resume score'
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem('cq_mentor_chat_messages', JSON.stringify(messages.slice(-25)));
    } catch {
      // ignore
    }
  }, [messages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // If excluded, do not render
  if (isExcludedScreen) {
    return null;
  }

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Format history for payload
      const historyPayload = messages.slice(-4).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await sendChatMessage({
        message: query,
        history: historyPayload,
        screen: activeTab,
        target_role: targetRole,
        user_name: userName
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      if (res.suggestions && res.suggestions.length > 0) {
        setSuggestions(res.suggestions);
      }
    } catch (err) {
      console.warn('Backend chat API failed or unreachable, switching to local knowledge responder:', err);
      // Fallback seamlessly to local intelligent responder
      const fallback = getLocalSmartResponse(query, targetRole, activeTab, userName);
      const aiMsg: ChatMessage = {
        id: `ai-local-${Date.now()}`,
        role: 'assistant',
        content: fallback.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      if (fallback.suggestions) {
        setSuggestions(fallback.suggestions);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages(initialMessages);
    localStorage.removeItem('cq_mentor_chat_messages');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Position classes
  const containerClasses = isSimulator
    ? 'absolute bottom-16 right-3 z-40'
    : 'fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50';

  return (
    <div className={containerClasses}>
      {/* Floating Chat Trigger Button when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-[0_8px_25px_rgba(79,70,229,0.45)] hover:shadow-[0_10px_35px_rgba(79,70,229,0.65)] hover:scale-105 active:scale-95 transition-all duration-300 border border-indigo-400/30"
          title="Open QuestAI Mentor Chatbot"
        >
          {/* Subtle animated halo */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 opacity-40 blur-sm group-hover:opacity-75 transition duration-300 animate-pulse" />

          <div className="relative flex items-center justify-center">
            <Bot className="h-5 w-5 text-white animate-bounce" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#070a13]" />
          </div>

          <div className="relative flex flex-col text-left">
            <span className="text-xs font-bold tracking-wide flex items-center gap-1">
              QuestAI <Sparkles className="h-3 w-3 text-amber-300 fill-amber-300" />
            </span>
            <span className="text-[10px] text-indigo-100 font-medium">Ask Anything</span>
          </div>
        </button>
      )}

      {/* Expanded Chatbot Modal / Drawer */}
      {isOpen && (
        <div
          className={`flex flex-col bg-[#090d18]/95 backdrop-blur-2xl border border-indigo-500/25 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] ring-1 ring-white/10 transition-all duration-300 overflow-hidden ${
            isSimulator
              ? 'w-[340px] max-h-[500px]'
              : isMinimized
              ? 'w-[320px] sm:w-[360px] h-14'
              : 'w-[calc(100vw-32px)] sm:w-[410px] md:w-[430px] h-[550px] max-h-[82vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#0d1326] via-[#111833] to-[#0d1326] border-b border-slate-800/90 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-600/30 border border-indigo-400/30">
                <Bot className="h-4 w-4 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0d1326]" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-wide">QuestAI Mentor</h3>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    24/7 AI
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready
                  </span>
                  <span>•</span>
                  <span className="truncate max-w-[140px] capitalize text-slate-300">
                    Context: {activeTab.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition"
                title="Clear chat history"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition"
                title={isMinimized ? 'Expand chat' : 'Minimize chat'}
              >
                {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition"
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Body (hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Message History Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-700">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-400 font-medium">
                        {isUser ? (
                          <span>You • {msg.timestamp}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-indigo-400">
                            <Sparkles className="h-3 w-3" /> QuestAI • {msg.timestamp}
                          </span>
                        )}
                      </div>

                      <div
                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                          isUser
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                            : 'bg-[#10162a] border border-slate-800 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        {isUser ? (
                          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <FormattedContent content={msg.content} />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2 pt-1">
                    <div className="h-6 w-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                      <Bot className="h-3.5 w-3.5 animate-pulse" />
                    </div>
                    <div className="bg-[#10162a] border border-slate-800 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">QuestAI is crafting your answer...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Chips */}
              {suggestions.length > 0 && !isLoading && (
                <div className="px-3 py-1.5 bg-[#0a0f1d] border-t border-slate-800/80 overflow-x-auto scrollbar-none flex items-center gap-1.5 select-none">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                    <Lightbulb className="h-3 w-3 text-amber-400" /> Ideas:
                  </span>
                  {suggestions.slice(0, 3).map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item)}
                      className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-slate-700/60 hover:border-indigo-500/40 transition whitespace-nowrap"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Area */}
              <div className="p-3 bg-[#0d1324] border-t border-slate-800 flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a technical or interview question... (Enter to send)"
                  rows={2}
                  disabled={isLoading}
                  className="flex-1 bg-[#060913] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition ${
                    input.trim() && !isLoading
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/40 hover:scale-105 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                  title="Send message (Enter)"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestChatbot;
