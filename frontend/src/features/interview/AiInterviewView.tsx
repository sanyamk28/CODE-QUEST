import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, Send, Mic, MicOff, Volume2 } from 'lucide-react';

interface InterviewMessage {
  speaker: 'AI' | 'USER';
  text: string;
}

interface InterviewReport {
  overall: number;
  technical: number;
  communication: number;
  feedback: string;
}

interface AiInterviewViewProps {
  messages: InterviewMessage[];
  loading: boolean;
  userInput: string;
  report: InterviewReport | null;
  onInputChange: (val: string) => void;
  onSendMessage: () => void;
}

export const AiInterviewView: React.FC<AiInterviewViewProps> = ({
  messages,
  loading,
  userInput,
  report,
  onInputChange,
  onSendMessage,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
      }
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!speechSupported) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!isListening) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onInputChange(userInput ? `${userInput} ${transcript}` : transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } else {
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-400" />
            <span className="font-bold text-sm text-white">AI Technical Recruiter Round</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
              Google Gemini 1.5 Flash
            </span>
          </div>
        </div>

        <div className="space-y-3 h-80 overflow-y-auto p-3 rounded-xl bg-[#070a13] border border-slate-800/80">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.speaker === 'USER' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  m.speaker === 'USER'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[9px] font-bold opacity-60">
                    {m.speaker === 'USER' ? 'YOU' : 'AI RECRUITER'}
                  </span>
                  {m.speaker === 'AI' && (
                    <button
                      onClick={() => speakText(m.text)}
                      title="Read question aloud"
                      className="text-purple-300 hover:text-white"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-xs text-purple-400 font-mono flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Evaluating answer & generating followup...
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {speechSupported && (
            <button
              onClick={toggleSpeechRecognition}
              title={isListening ? 'Listening... Click to stop' : 'Click to speak answer'}
              className={`px-3 py-2.5 rounded-xl border transition flex items-center justify-center ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}

          <input
            type="text"
            value={userInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder={isListening ? 'Listening to speech...' : 'Explain your approach, design patterns, or tradeoffs...'}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#070a13] border border-slate-800 text-xs text-slate-200 outline-none"
          />
          <button
            onClick={onSendMessage}
            disabled={loading || !userInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" /> Send
          </button>
        </div>

        {report && (
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300 text-sm">Performance Evaluation Report</span>
              <span className="font-bold text-emerald-400 text-base">{report.overall}/100</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                Technical Score: <span className="font-bold text-sky-400">{report.technical}%</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                Communication: <span className="font-bold text-emerald-400">{report.communication}%</span>
              </div>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">{report.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};
