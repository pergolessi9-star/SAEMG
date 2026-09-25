import React, { useState } from 'react';
import {
  Bot,
  ShieldCheck,
  Fingerprint,
  Layers,
  Lock,
  GraduationCap,
  ArrowRight,
  Send,
  Scale,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { EdpbSubagentResponse } from '../types';

export const EdpbAgentsModule: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('governance');
  const [query, setQuery] = useState<string>(
    '¿Cómo debe articularse técnicamente el mecanismo de supervisión humana y parada de emergencia (kill-switch) en un modelo de clasificación clínica según los Artículos 14 del AI Act y 22 del RGPD?'
  );
  const [context, setContext] = useState<string>('Modelo de clasificación de radiografías en PyTorch con API FastAPI.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<EdpbSubagentResponse | null>(null);
  const [evidenceHash, setEvidenceHash] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const subagents = [
    {
      id: 'governance',
      name: 'Gobernanza & Supervisión Humana',
      role: 'Especialista en Art. 9, 10, 14, kill-switch y auditabilidad',
      icon: <ShieldCheck className="w-4 h-4 text-blue-400" />,
      defaultQuery:
        '¿Cómo debe articularse técnicamente el mecanismo de supervisión humana y parada de emergencia (kill-switch) en un modelo de clasificación clínica según los Artículos 14 del AI Act y 22 del RGPD?',
    },
    {
      id: 'evidence',
      name: 'Evidencias Criptográficas SHA-256',
      role: 'Auditor forense y trazabilidad técnica (Art. 12)',
      icon: <Fingerprint className="w-4 h-4 text-emerald-400" />,
      defaultQuery:
        '¿Qué estructura de registros (logging) y mecanismos de hashing SHA-256 se requieren para que las inferencias sean legalmente inmutables ante una autoridad de control?',
    },
    {
      id: 'multiframe',
      name: 'Analista Multi-Marco Regulatorio',
      role: 'Intersección AI Act ↔ RGPD ↔ ePrivacy ↔ eIDAS ↔ NIS2',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
      defaultQuery:
        '¿Cómo armonizar la Evaluación de Impacto en Protección de Datos (EIPD/DPIA del RGPD Art. 35) con la Evaluación de Impacto en Derechos Fundamentales (FRIA del AI Act Art. 27)?',
    },
    {
      id: 'cybersecurity',
      name: 'Ciberseguridad & Cloud Zero-Trust',
      role: 'Art. 15, Cloud Act, FISA y resiliencia técnica',
      icon: <Lock className="w-4 h-4 text-rose-400" />,
      defaultQuery:
        '¿Qué controles técnicos mitigan los riesgos de Cloud Act y FISA al desplegar modelos fundacionales en proveedores hyperscalers manteniendo soberanía europea?',
    },
    {
      id: 'training',
      name: 'Diseñador de Formación & Compliance',
      role: 'Alfabetización en IA (Art. 4) y planes formativos',
      icon: <GraduationCap className="w-4 h-4 text-amber-400" />,
      defaultQuery:
        'Diseña un programa formativo práctico de 4 módulos para que ingenieros de software cumplan con los estándares de IA confiable del AI Act.',
    },
  ];

  const handleSelectAgent = (agent: typeof subagents[0]) => {
    setSelectedAgentId(agent.id);
    setQuery(agent.defaultQuery);
    setResponse(null);
    setEvidenceHash(null);
  };

  const handleConsultAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/edpb-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          query: query.trim(),
          context: context.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al consultar el sub-agente.');
      }

      setResponse(data.agentResponse);
      setEvidenceHash(data.evidence?.sha256Hash || null);
    } catch (err: any) {
      setError(err.message || 'Error con el sub-agente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyHash = () => {
    if (!evidenceHash) return;
    navigator.clipboard.writeText(evidenceHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-400" />
            <span>Sub-Agentes Expertos EDPB (Gemma 4 Compliance Intelligence)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Ecosistema de agentes especializados inspirados en el panel de Manuel Gago Fernández (EDPB-SPE-2025-2030).
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-[11px] font-mono text-blue-300">
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          <span>EDPB Support Pool of Experts 2025-2030</span>
        </div>
      </div>

      {/* Sub-Agent Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {subagents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => handleSelectAgent(agent)}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-950/80 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                  : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                  {agent.icon}
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">{agent.name}</h4>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {agent.role}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interaction Form */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
        <form onSubmit={handleConsultAgent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
              Consulta al Sub-Agente Seleccionado
            </label>
            <textarea
              rows={3}
              required
              disabled={isLoading}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Plantea un caso normativo o técnico concreto..."
              className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Contexto Técnico del Repositorio o Arquitectura (Opcional)
            </label>
            <input
              type="text"
              disabled={isLoading}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Ej. Pipeline de Computer Vision en PyTorch desplegado en Azure / AWS..."
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Cada dictamen genera un hash SHA-256 trazable con supervisión humana.
            </span>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Consultando Sub-Agente...</span>
                </>
              ) : (
                <>
                  <span>Consultar con Gemma 4</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Sub-Agent Response */}
      {response && (
        <div className="space-y-4">
          {/* Header of Response */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Dictamen emitido por:
                </span>
                <span className="text-sm font-bold text-white">{response.agentName}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ecosistema EDPB • Manuel Gago Fernández (EDPB-SPE-2025-2030)
              </p>
            </div>

            {evidenceHash && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  SHA-256: {evidenceHash.slice(0, 16)}...
                </span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'Hash Copiado' : 'Copiar Hash SHA-256'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Dictamen Principal */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Fundamentación Jurídica y Análisis Técnico
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {response.opinion}
              </p>
            </div>

            {/* Artículos y Puntos de Acción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">
                  Artículos y Directivas Aplicables
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {response.legalArticlesApplied.map((art, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>{art}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                  Puntos de Acción Técnica Recomendados
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {response.technicalActionPoints.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Declaración de Trazabilidad */}
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-slate-400 flex items-center justify-between">
              <span>{response.evidenceStatement}</span>
              <span className="text-[11px] font-mono text-emerald-400">Auditability: 100%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
