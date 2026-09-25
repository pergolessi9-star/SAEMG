import React, { useState } from 'react';
import {
  Flame,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  Scale,
  Sparkles,
  Info,
  FileJson,
  Layers,
  HeartHandshake,
  UserCheck,
} from 'lucide-react';
import { RiskClassificationResult, FriaReport } from '../types';
import { JsonViewer } from './JsonViewer';

export const RiskClassifierModule: React.FC = () => {
  const [subTab, setSubTab] = useState<'tier' | 'fria'>('tier');

  // Tier Classification state
  const [description, setDescription] = useState<string>(
    'Sistema automatizado de análisis curricular y preselección de candidatos para contratación laboral en empresas tecnológicas.'
  );
  const [sector, setSector] = useState<string>('Empleo y Gestión de Recursos Humanos');
  const [targetUsers, setTargetUsers] = useState<string>('Departamentos de RRHH y candidatos a empleo');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RiskClassificationResult | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'json'>('cards');

  // FRIA State
  const [friaPurpose, setFriaPurpose] = useState<string>(
    'Filtrado y priorización de currículums para puestos de responsabilidad'
  );
  const [friaImpacted, setFriaImpacted] = useState<string>(
    'Candidatos que aplican al puesto de trabajo (posible impacto de género o edad)'
  );
  const [friaLoading, setFriaLoading] = useState<boolean>(false);
  const [friaResult, setFriaResult] = useState<FriaReport | null>(null);

  const presetExamples = [
    {
      title: 'Selección de Personal (Alto Riesgo)',
      desc: 'Herramienta de filtrado de CVs y ranking predictivo de candidatos para entrevistas laborales.',
      sector: 'Empleo y RRHH (Anexo III, punto 4)',
      users: 'Equipos de selección y candidatos',
    },
    {
      title: 'Triaje Hospitalario (Alto Riesgo)',
      desc: 'Modelo de deep learning para priorización de urgencias y dosificación de fármacos.',
      sector: 'Salud y Dispositivos Médicos (Anexo III)',
      users: 'Personal médico hospitalario',
    },
    {
      title: 'Chatbot Comercial (Riesgo Específico)',
      desc: 'Asistente de atención al cliente en e-commerce que responde consultas de productos.',
      sector: 'Comercio electrónico y retail',
      users: 'Consumidores finales',
    },
    {
      title: 'Puntuación Social Ciudadana (Inadmisible)',
      desc: 'Plataforma para evaluar fiabilidad ciudadana y restringir acceso a servicios públicos según comportamiento.',
      sector: 'Administración pública',
      users: 'Ciudadanos y autoridades',
    },
  ];

  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/risk-classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemDescription: description.trim(),
          sector: sector.trim(),
          targetUsers: targetUsers.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al clasificar el riesgo del sistema.');
      }

      setResult(data.classification);
    } catch (err: any) {
      setError(err.message || 'Error en la clasificación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunFria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setFriaLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/fria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemDescription: description.trim(),
          intendedPurpose: friaPurpose.trim(),
          impactedCategories: friaImpacted.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al ejecutar la evaluación FRIA.');
      }

      setFriaResult(data.fria);
    } catch (err: any) {
      setError(err.message || 'Error en la evaluación FRIA.');
    } finally {
      setFriaLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Niveles de Riesgo & Evaluación de Impacto FRIA (Art. 27)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Clasificación bajo Anexo III del EU AI Act y evaluación de impacto en derechos fundamentales según estándares EDPB.
          </p>
        </div>

        {/* Sub-tab toggle */}
        <div className="flex items-center bg-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setSubTab('tier')}
            className={`px-3 py-1 rounded-md transition cursor-pointer ${
              subTab === 'tier' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Clasificador Anexo III
          </button>
          <button
            onClick={() => setSubTab('fria')}
            className={`px-3 py-1 rounded-md transition cursor-pointer ${
              subTab === 'fria' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Evaluación FRIA (Art. 27)
          </button>
        </div>
      </div>

      {subTab === 'tier' ? (
        <div className="space-y-6">
          {/* Presets */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Cargar caso de uso típico:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {presetExamples.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDescription(p.desc);
                      setSector(p.sector);
                      setTargetUsers(p.users);
                    }}
                    className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-left transition cursor-pointer"
                  >
                    <div className="font-semibold text-xs text-blue-300">{p.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleClassify} className="space-y-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                  Descripción Funcional del Sistema de IA
                </label>
                <textarea
                  rows={3}
                  required
                  disabled={isLoading}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explica qué hace el modelo, qué decisiones toma y qué datos procesa..."
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                    Sector o Ámbito de Aplicación
                  </label>
                  <input
                    type="text"
                    disabled={isLoading}
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="Ej. Salud, Finanzas, Empleo, Educación, etc."
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                    Destinatarios / Sujetos del Sistema
                  </label>
                  <input
                    type="text"
                    disabled={isLoading}
                    value={targetUsers}
                    onChange={(e) => setTargetUsers(e.target.value)}
                    placeholder="Ej. Candidatos laborales, pacientes, consumidores..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !description.trim()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Clasificando con Gemma 4...</span>
                  </>
                ) : (
                  <>
                    <span>Evaluar Categoría de Riesgo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {result && (
            <div className="space-y-4">
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  result.tier === 'Inadmisible'
                    ? 'bg-rose-950/40 border-rose-700 text-rose-300'
                    : result.tier === 'Alto Riesgo'
                    ? 'bg-orange-950/40 border-orange-700 text-orange-300'
                    : result.tier.includes('Transparencia')
                    ? 'bg-blue-950/40 border-blue-700 text-blue-300'
                    : 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    {result.tier === 'Inadmisible' ? (
                      <AlertOctagon className="w-6 h-6 text-rose-400" />
                    ) : (
                      <Scale className="w-6 h-6 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold opacity-75">
                      Clasificación Normativa (EU AI Act):
                    </span>
                    <div className="text-xl font-black uppercase tracking-wide mt-0.5">
                      {result.tier}
                    </div>
                  </div>
                </div>

                <div className="text-xs sm:text-right font-mono text-slate-300">
                  <div className="font-semibold text-white">Base Jurídica:</div>
                  <div>{result.legalBasis}</div>
                  <div className="text-[11px] opacity-75">{result.annexMatch}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2.5">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Obligaciones Legales Obligatorias
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {result.mandatoryRequirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Prácticas Prohibidas (Art. 5)
                    </span>
                    <p className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                      {result.prohibitedPracticesCheck}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Recomendaciones Estratégicas
                    </span>
                    <ul className="space-y-1 text-xs text-slate-400">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Sub-tab: FRIA Evaluator (Art. 27) */
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
              <HeartHandshake className="w-4 h-4" />
              <span>Evaluación de Impacto en Derechos Fundamentales (FRIA - Artículo 27)</span>
            </div>
            <p className="text-xs text-slate-400">
              Obligatoria para entidades públicas y responsables del despliegue de sistemas de alto riesgo antes de su uso operativo.
            </p>

            <form onSubmit={handleRunFria} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                  Descripción del Sistema
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                    Finalidad Prevista
                  </label>
                  <input
                    type="text"
                    value={friaPurpose}
                    onChange={(e) => setFriaPurpose(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                    Colectivos Impactados
                  </label>
                  <input
                    type="text"
                    value={friaImpacted}
                    onChange={(e) => setFriaImpacted(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={friaLoading || !description.trim()}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {friaLoading ? (
                  <span>Evaluando Derechos Fundamentales...</span>
                ) : (
                  <>
                    <span>Generar Informe FRIA (Art. 27)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {friaResult && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Dictamen FRIA: {friaResult.friaRequired ? 'FRIA Obligatoria' : 'FRIA Voluntaria'}
                  </span>
                  <div className="text-xs text-slate-300 mt-1">{friaResult.conclusion}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-purple-300">{friaResult.severityScore}/10</div>
                  <div className="text-[10px] text-slate-400">Severidad de Riesgo</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {friaResult.rightsAtRisk.map((r, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{r.right}</span>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                          r.riskLevel === 'Alto'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : r.riskLevel === 'Medio'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        Riesgo {r.riskLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{r.description}</p>
                    <div className="text-xs text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="font-semibold text-slate-300">Mitigación: </span>
                      {r.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
