import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import type { AIFrequency, PaidVsFree } from '../../types';

const AI_MODELS = [
  'ChatGPT',
  'Gemini',
  'Claude',
  'Copilot (Microsoft)',
  'DeepSeek',
  'Perplexity',
  'Mistral / Le Chat',
  'Llama (Meta)',
  'Kimi',
  'Grok',
  'NotebookLM',
  'Other',
] as const;

const TASK_TYPES = [
  'Writing & editing',
  'Research & summarizing',
  'Translation',
  'Data analysis',
  'Coding / programming',
  'Creating presentations',
  'Generating images',
  'Administrative tasks',
  'Teaching preparation',
  'Student assessment',
  'Other',
] as const;

const VIBE_CODING_OPTIONS = [
  { value: 'yes', label: 'Yes, I have tried it' },
  { value: 'heard', label: 'I\'ve heard of it but never tried' },
  { value: 'no', label: 'No, this is new to me' },
] as const;

const FREQUENCIES: { value: AIFrequency; label: string }[] = [
  { value: 'never', label: 'Never used AI' },
  { value: 'monthly', label: 'A few times a month' },
  { value: 'weekly', label: 'A few times a week' },
  { value: 'daily', label: 'Every day' },
  { value: 'multiple_daily', label: 'Multiple times a day' },
];

const PAID_OPTIONS: { value: PaidVsFree; label: string }[] = [
  { value: 'free_only', label: 'Free tools only' },
  { value: 'mostly_free', label: 'Mostly free, occasionally paid' },
  { value: 'mix', label: 'Mix of both' },
  { value: 'mostly_paid', label: 'Mostly paid' },
  { value: 'paid_only', label: 'Paid tools only' },
];

export default function AISurveyPage() {
  const navigate = useNavigate();
  const { participant, session } = useAuth();
  const [modelsUsed, setModelsUsed] = useState<string[]>([]);
  const [otherModel, setOtherModel] = useState('');
  const [taskTypes, setTaskTypes] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<AIFrequency | ''>('');
  const [paidVsFree, setPaidVsFree] = useState<PaidVsFree | ''>('');
  const [vibeCoding, setVibeCoding] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frequency) { setError('Please select how often you use AI.'); return; }
    if (!paidVsFree) { setError('Please select paid vs free.'); return; }
    if (!participant || !session) { setError('Session error. Please refresh.'); return; }

    setError('');
    setLoading(true);

    // Replace generic "Other" with the actual name if provided
    const finalModels = modelsUsed.map((m) =>
      m === 'Other' && otherModel.trim() ? `Other: ${otherModel.trim()}` : m
    );

    const { error: dbError } = await supabase.from('dive_ai_surveys').insert({
      participant_id: participant.id,
      session_id: session.id,
      models_count: finalModels.length,
      models_used: finalModels,
      task_types: taskTypes,
      frequency,
      paid_vs_free: paidVsFree,
      vibe_coding: vibeCoding || null,
    });

    setLoading(false);

    if (dbError) {
      console.error('Survey save error:', dbError);
      setError('Failed to save. Please try again.');
      return;
    }

    navigate('/module1', { replace: true });
  };

  const handleSkip = () => {
    navigate('/module1', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Quick AI Survey</h1>
          <p className="text-primary-300 mt-1 text-sm">
            Before we start — a quick snapshot of your AI usage.
          </p>
          <p className="text-primary-400 text-xs mt-2">
            This is completely anonymous. Results will be shown as aggregates only.
          </p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Frequency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              How often do you use AI tools?
            </label>
            <div className="space-y-1.5">
              {FREQUENCIES.map((f) => (
                <label
                  key={f.value}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    frequency === f.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={f.value}
                    checked={frequency === f.value}
                    onChange={() => setFrequency(f.value)}
                    className="accent-primary-600"
                  />
                  <span className="text-sm text-gray-700">{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Models used — only show if not "never" */}
          {frequency && frequency !== 'never' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Which AI tools have you used? <span className="font-normal text-gray-400">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AI_MODELS.map((model) => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => toggleItem(modelsUsed, setModelsUsed, model)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        modelsUsed.includes(model)
                          ? 'bg-primary-100 border-primary-400 text-primary-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
                {modelsUsed.includes('Other') && (
                  <input
                    type="text"
                    value={otherModel}
                    onChange={(e) => setOtherModel(e.target.value)}
                    placeholder="Which other AI tool(s)?"
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                )}
              </div>

              {/* Task types */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What do you use AI for? <span className="font-normal text-gray-400">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {TASK_TYPES.map((task) => (
                    <button
                      key={task}
                      type="button"
                      onClick={() => toggleItem(taskTypes, setTaskTypes, task)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        taskTypes.includes(task)
                          ? 'bg-amber-100 border-amber-400 text-amber-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paid vs Free */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Paid or free AI tools?
                </label>
                <div className="space-y-1.5">
                  {PAID_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        paidVsFree === opt.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paidVsFree"
                        value={opt.value}
                        checked={paidVsFree === opt.value}
                        onChange={() => setPaidVsFree(opt.value)}
                        className="accent-primary-600"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Vibe Coding */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Have you tried "vibe coding"?
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Giving instructions in natural language and letting the AI write the code for you.
                </p>
                <div className="space-y-1.5">
                  {VIBE_CODING_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        vibeCoding === opt.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="vibeCoding"
                        value={opt.value}
                        checked={vibeCoding === opt.value}
                        onChange={() => setVibeCoding(opt.value)}
                        className="accent-primary-600"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>

          <p className="text-xs text-center text-gray-400">
            Your name will not be linked to these answers.
          </p>
        </form>
      </div>
    </div>
  );
}
