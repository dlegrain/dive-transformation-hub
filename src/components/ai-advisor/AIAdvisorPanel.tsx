import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, X, Send, AlertTriangle, Info, AlertOctagon, Loader2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import { buildSystemPrompt, detectAlerts, type ProactiveAlert } from '../../lib/ai-advisor';
import { supabase } from '../../lib/supabase';
import type { AIMessage } from '../../types';

const MODULE_LABELS: Record<string, string> = {
  module1: 'Maturity Diagnostic',
  module2: 'Resistance Mapping',
  module3: 'Solutions Arsenal',
  module4: '90-Day Plan',
};

function getModuleFromPath(pathname: string): string {
  if (pathname.startsWith('/module1')) return 'module1';
  if (pathname.startsWith('/module2')) return 'module2';
  if (pathname.startsWith('/module3')) return 'module3';
  if (pathname.startsWith('/module4')) return 'module4';
  return 'general';
}

export default function AIAdvisorPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const store = useStore();
  const currentModule = getModuleFromPath(location.pathname);
  const messages = store.aiMessages[currentModule] || [];

  const alerts = detectAlerts(
    store.dimensions,
    store.stakeholders,
    store.solutions,
    store.tasks,
    store.kpis,
  );

  const relevantAlerts = alerts.filter(
    (a) => a.module === currentModule || currentModule === 'general'
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    store.addAIMessage(currentModule, userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(
        MODULE_LABELS[currentModule] || 'General',
        store.institutionName,
        store.dimensions,
        store.stakeholders,
        store.solutions,
        store.tasks,
        store.kpis,
        store.hiddenDimensions,
        store.customDimensions,
      );

      const conversationMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call AI endpoint (dev proxy or Supabase Edge Function)
      let responseData: { content?: string };

      const devProxy = import.meta.env.DEV ? 'http://localhost:3001' : null;
      if (devProxy) {
        const resp = await fetch(`${devProxy}/functions/v1/ai-advisor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemPrompt, messages: conversationMessages }),
        });
        if (!resp.ok) throw new Error(`Proxy error: ${resp.status}`);
        responseData = await resp.json();
      } else {
        const { data, error } = await supabase.functions.invoke('ai-advisor', {
          body: { systemPrompt, messages: conversationMessages },
        });
        if (error) throw error;
        responseData = data;
      }

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: responseData?.content || 'I apologize, I could not generate a response. Please try again.',
        timestamp: new Date().toISOString(),
      };

      store.addAIMessage(currentModule, assistantMessage);
    } catch (err) {
      console.error('AI Advisor error:', err);
      store.addAIMessage(currentModule, {
        role: 'assistant',
        content: 'Connection error. Please check that the Supabase Edge Function is deployed and the API key is configured.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const alertIcon = (severity: ProactiveAlert['severity']) => {
    switch (severity) {
      case 'critical': return <AlertOctagon size={14} className="text-danger-500 shrink-0" />;
      case 'warning': return <AlertTriangle size={14} className="text-warning-500 shrink-0" />;
      default: return <Info size={14} className="text-primary-500 shrink-0" />;
    }
  };

  const alertBg = (severity: ProactiveAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-danger-50 border-danger-200';
      case 'warning': return 'bg-warning-50 border-warning-200';
      default: return 'bg-primary-50 border-primary-200';
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 z-50"
          title="AI Advisor"
        >
          <MessageSquare size={22} />
          {relevantAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {relevantAlerts.length}
            </span>
          )}
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-[420px] bg-white border-l border-gray-200 shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="px-4 py-3 bg-primary-950 text-white flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">AI Advisor</h3>
              <p className="text-xs text-primary-300">
                {MODULE_LABELS[currentModule] || 'General'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {relevantAlerts.length > 0 && (
                <button
                  onClick={() => setShowAlerts(!showAlerts)}
                  className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
                    showAlerts ? 'bg-primary-700' : 'bg-primary-800 hover:bg-primary-700'
                  }`}
                >
                  <AlertTriangle size={12} />
                  {relevantAlerts.length} alert{relevantAlerts.length > 1 ? 's' : ''}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-primary-300 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Alerts panel */}
          {showAlerts && relevantAlerts.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 space-y-2 max-h-48 overflow-y-auto">
              {relevantAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${alertBg(alert.severity)}`}
                >
                  {alertIcon(alert.severity)}
                  <span className="text-gray-700">{alert.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-1">
                  Ask me anything about your adoption plan.
                </p>
                <p className="text-xs text-gray-400">
                  I have access to all your module data and 9 research articles.
                </p>
                <div className="mt-4 space-y-1.5">
                  {[
                    'What should be our top priority?',
                    'How realistic is our plan?',
                    'What are we missing?',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                      }}
                      className="block w-full text-left px-3 py-2 text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm prose-gray max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:my-1.5 [&>ul]:pl-4 [&>ol]:my-1.5 [&>ol]:pl-4 [&>li]:mb-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>h1]:font-bold [&>h2]:font-semibold [&>h3]:font-semibold [&>h1]:mt-3 [&>h2]:mt-2.5 [&>h3]:mt-2 [&>h1]:mb-1 [&>h2]:mb-1 [&>h3]:mb-1 [&>blockquote]:border-l-2 [&>blockquote]:border-gray-300 [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-gray-500">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content.split('\n').map((line, j) => (
                      <p key={j} className={j > 0 ? 'mt-2' : ''}>
                        {line}
                      </p>
                    ))
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-xl rounded-bl-sm">
                  <Loader2 size={16} className="animate-spin text-primary-500" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask the AI Advisor..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
