import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchAppById, createApp, updateApp, MiniApp, MiniAppInput, executeMiniApp } from '../lib/api';
import { 
  Sparkles, Save, ArrowLeft, Plus, Trash2, Play, 
  Settings2, Wrench, Palette, Sliders, CheckCircle2 
} from 'lucide-react';

const AVAILABLE_TOOLS = [
  { id: 'flight_search', name: 'Flight Search & Radar', desc: 'Finds flights, schedules, layovers and price comparison' },
  { id: 'world_clock', name: 'World Clock & Meeting Sync', desc: 'Calculates global times, daylight savings & meeting overlaps' },
  { id: 'currency_converter', name: 'Currency & FX Radar', desc: 'Live exchange rates and multi-currency converter' },
  { id: 'lead_qualifier', name: 'Lead Qualifier & Concierge', desc: 'B2B lead fit scoring and onboarding automation' },
];

export const AppEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [icon, setIcon] = useState('Sparkles');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [tools, setTools] = useState<string[]>(['world_clock']);
  const [inputs, setInputs] = useState<MiniAppInput[]>([]);
  const [primaryColor, setPrimaryColor] = useState('#38bdf8');
  const [badge, setBadge] = useState('AI Mini-App');
  const [widgetLayout, setWidgetLayout] = useState<'card' | 'floating'>('card');

  // Simulator State
  const [simInputs, setSimInputs] = useState<Record<string, any>>({});
  const [simRunning, setSimRunning] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    if (!isNew && id) {
      loadApp(id);
    } else {
      // Default template for new app
      setName('Smart Research Assistant');
      setSlug('smart-research');
      setCategory('Research & Analysis');
      setDescription('Autonomous assistant that pulls insights and calculates optimal outputs.');
      setSystemPrompt('You are a concise research agent. Analyze the provided query and generate a crisp briefing.');
      setTools(['world_clock']);
      setInputs([
        { id: 'topic', label: 'Research Subject / Keyword', type: 'text', placeholder: 'e.g. Autonomous AI Agents', required: true, default: 'Autonomous AI Agents' },
        { id: 'format', label: 'Output Format', type: 'select', options: ['Executive Summary', 'Key Bullet Points', 'Technical Analysis'], required: true, default: 'Executive Summary' }
      ]);
    }
  }, [id, isNew]);

  async function loadApp(appId: string) {
    try {
      setLoading(true);
      const app = await fetchAppById(appId);
      setName(app.name);
      setSlug(app.slug);
      setCategory(app.category);
      setIcon(app.icon);
      setDescription(app.description);
      setSystemPrompt(app.systemPrompt);
      setTools(app.tools || []);
      setInputs(app.inputs || []);
      setPrimaryColor(app.theme?.primaryColor || '#38bdf8');
      setBadge(app.theme?.badge || 'AI Mini-App');
      setWidgetLayout(app.theme?.widgetLayout || 'card');

      // Initialize sim inputs
      const initSim: Record<string, any> = {};
      app.inputs?.forEach(inp => { initSim[inp.id] = inp.default || ''; });
      setSimInputs(initSim);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleAddInput() {
    const newField: MiniAppInput = {
      id: `field_${Date.now()}`,
      label: 'New Parameter',
      type: 'text',
      placeholder: 'Enter value',
      required: false,
      default: ''
    };
    setInputs([...inputs, newField]);
  }

  function handleRemoveInput(index: number) {
    const next = [...inputs];
    next.splice(index, 1);
    setInputs(next);
  }

  function handleUpdateInput(index: number, field: Partial<MiniAppInput>) {
    const next = [...inputs];
    next[index] = { ...next[index], ...field };
    setInputs(next);
  }

  function toggleTool(toolId: string) {
    if (tools.includes(toolId)) {
      setTools(tools.filter(t => t !== toolId));
    } else {
      setTools([...tools, toolId]);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveSuccess(false);
    const payload: Partial<MiniApp> = {
      name,
      slug,
      category,
      icon,
      description,
      systemPrompt,
      tools,
      inputs,
      theme: {
        primaryColor,
        mode: 'dark',
        badge,
        widgetLayout
      }
    };

    try {
      if (isNew) {
        const created = await createApp(payload);
        navigate(`/editor/${created.id}`);
      } else if (id) {
        await updateApp(id, payload);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert('Error saving Mini-App');
    } finally {
      setSaving(false);
    }
  }

  async function handleRunSimulator() {
    setSimRunning(true);
    setSimResult(null);
    try {
      const targetId = isNew ? 'app_world_clock' : (id || 'app_world_clock');
      const res = await executeMiniApp(targetId, simInputs);
      setSimResult(res);
    } catch (err: any) {
      setSimResult({ error: err.message });
    } finally {
      setSimRunning(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Mini-App configuration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isNew ? 'Create New AI Mini-App' : `Edit: ${name}`}
            </h1>
            <p className="text-xs text-slate-400">
              Configure system prompts, Gemini tool capabilities, input parameters and visual styling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
              <CheckCircle2 size={14} />
              Saved successfully
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* General Information */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Settings2 size={18} className="text-sky-400" />
              <h2 className="font-bold text-base text-white">General Information</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">App Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Gemini System Prompt */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles size={18} className="text-indigo-400" />
              <h2 className="font-bold text-base text-white">Gemini Agent Prompt & Persona</h2>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                System Instructions
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-sky-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                placeholder="Instruct Gemini how to reason, what tone to use, and how to format responses..."
              />
            </div>
          </div>

          {/* Gemini Tools Selection */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Wrench size={18} className="text-emerald-400" />
              <h2 className="font-bold text-base text-white">Autonomous Agent Tools</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_TOOLS.map((tool) => {
                const active = tools.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      active
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{tool.name}</span>
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-emerald-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{tool.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Inputs Builder */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-sky-400" />
                <h2 className="font-bold text-base text-white">Input Parameters Schema</h2>
              </div>
              <button
                type="button"
                onClick={handleAddInput}
                className="flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20"
              >
                <Plus size={14} />
                <span>Add Input Field</span>
              </button>
            </div>

            <div className="space-y-3">
              {inputs.map((inp, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Field Key"
                      value={inp.id}
                      onChange={(e) => handleUpdateInput(idx, { id: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Display Label"
                      value={inp.label}
                      onChange={(e) => handleUpdateInput(idx, { label: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                    <select
                      value={inp.type}
                      onChange={(e) => handleUpdateInput(idx, { type: e.target.value as any })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="text">Text Input</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="select">Dropdown Select</option>
                      <option value="textarea">Textarea</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveInput(idx)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Theme & Visuals */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Palette size={18} className="text-purple-400" />
              <h2 className="font-bold text-base text-white">Visual Customization</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                  />
                  <span className="text-xs font-mono text-slate-300">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Widget Mode</label>
                <select
                  value={widgetLayout}
                  onChange={(e) => setWidgetLayout(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="card">Inline Card</option>
                  <option value="floating">Floating Bubble</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Play size={16} className="text-sky-400" fill="currentColor" />
                <h3 className="font-bold text-sm text-white">Live Simulator Bench</h3>
              </div>
              <span className="text-[11px] font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/50">
                Interactive Test
              </span>
            </div>

            <div className="space-y-3">
              {inputs.map((inp) => (
                <div key={inp.id} className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">{inp.label}</label>
                  <input
                    type={inp.type === 'number' ? 'number' : 'text'}
                    value={simInputs[inp.id] ?? (inp.default || '')}
                    onChange={(e) => setSimInputs({ ...simInputs, [inp.id]: e.target.value })}
                    placeholder={inp.placeholder}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              ))}

              <button
                onClick={handleRunSimulator}
                disabled={simRunning}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles size={14} />
                <span>{simRunning ? 'Agent Reasoning...' : 'Run with Gemini'}</span>
              </button>
            </div>

            {/* Sim Output */}
            {simResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/60 pb-2">
                  <span>Execution Result</span>
                  <span className="text-emerald-400 font-medium">Tool Executed: {simResult.result?.tool_executed || 'Direct Prompt'}</span>
                </div>
                <div className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {simResult.result?.markdown || JSON.stringify(simResult, null, 2)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
