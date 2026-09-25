import React, { useState } from 'react';
import {
  Github,
  BookOpen,
  Sparkles,
  ArrowRight,
  Code2,
  FileCode,
  Info,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Columns2,
  Wrench,
  Download,
  Copy,
  Check,
  FileJson,
  Layers,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { AI_ACT_PRESETS, SAMPLE_REPOS, RequirementPreset, SampleRepo } from '../constants/aiActPresets';
import { AuditReport, AuditMetadata, CryptographicEvidence } from '../types';
import { JsonViewer } from './JsonViewer';
import { AuditResult } from './AuditResult';

interface AuditModuleProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  auditRequirement: string;
  setAuditRequirement: (req: string) => void;
  manualCode: string;
  setManualCode: (code: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  loadingStep?: string;
  report: AuditReport | null;
  metadata: AuditMetadata | null;
  evidence?: CryptographicEvidence;
  onSendToRemediation?: (gap: string, action: string, requirement: string) => void;
}

export const AuditModule: React.FC<AuditModuleProps> = ({
  repoUrl,
  setRepoUrl,
  auditRequirement,
  setAuditRequirement,
  manualCode,
  setManualCode,
  isLoading,
  onSubmit,
  loadingStep,
  report,
  metadata,
  evidence,
  onSendToRemediation,
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>('art-10');
  const [showManualCode, setShowManualCode] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<'stacked' | 'split'>('stacked');

  const handleSelectPreset = (preset: RequirementPreset) => {
    setSelectedArticleId(preset.id);
    setAuditRequirement(preset.requirementText);
  };

  const handleSelectSampleRepo = (sample: SampleRepo) => {
    setRepoUrl(sample.url);
    const matchingPreset = AI_ACT_PRESETS.find((p) => p.id === sample.recommendedArticleId);
    if (matchingPreset) {
      setSelectedArticleId(matchingPreset.id);
      setAuditRequirement(matchingPreset.requirementText);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Sub-Header & Layout Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Auditoría de Cumplimiento de Repositorio (Código & Artefactos)
          </h2>
          <p className="text-xs text-slate-400">
            Inspecciona repositorios de GitHub con Gemma 4 y genera el reporte JSON con los cuatro campos normativos.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <span className="text-slate-400 hidden md:inline">Distribución:</span>
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
            <button
              type="button"
              onClick={() => setLayoutMode('stacked')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                layoutMode === 'stacked'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista Apilada: Formulario arriba, resultado JSON abajo"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Arriba / Abajo</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                layoutMode === 'split'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista Dividida: Formulario a la izquierda, JSON a la derecha"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Dividida (50/50)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Split or Stacked */}
      <div className={layoutMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-start' : 'space-y-6'}>
        {/* =========================================
            FORMULARIO SUPERIOR / PANEL IZQUIERDO
            ========================================= */}
        <div className="bg-slate-900/90 rounded-2xl shadow-xl border border-slate-800 p-5 sm:p-6 space-y-5">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Campo 1: URL de GitHub */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="repo-url"
                  className="text-xs font-semibold text-slate-200 flex items-center gap-2 uppercase tracking-wider"
                >
                  <Github className="w-4 h-4 text-blue-400" />
                  <span>1. URL del Repositorio de GitHub</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Público o preconfigurado</span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Github className="w-4 h-4" />
                </div>
                <input
                  id="repo-url"
                  type="text"
                  required
                  disabled={isLoading}
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/usuario/nombre-del-repo"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-xs font-mono"
                />
              </div>

              {/* Presets de Repositorios */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Ejemplos listos:
                </span>
                {SAMPLE_REPOS.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectSampleRepo(sample)}
                    className={`px-2 py-0.5 rounded-md border text-[11px] font-medium transition cursor-pointer ${
                      repoUrl === sample.url
                        ? 'bg-blue-950 border-blue-500 text-blue-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                    title={sample.description}
                  >
                    <span>{sample.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Campo 2: Requisito de Auditoría */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="audit-req"
                  className="text-xs font-semibold text-slate-200 flex items-center gap-2 uppercase tracking-wider"
                >
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>2. Requisito de Auditoría (EU AI Act)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Reglamento (UE) 2024/1689</span>
              </div>

              {/* Botones de Artículos Clave */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
                {AI_ACT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-lg text-left border transition cursor-pointer flex flex-col justify-between ${
                      selectedArticleId === preset.id && auditRequirement === preset.requirementText
                        ? 'bg-blue-600/90 text-white border-blue-500 shadow-sm'
                        : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-bold text-xs">{preset.article}</span>
                    <span className="text-[10px] text-slate-400 truncate mt-0.5" title={preset.title}>
                      {preset.title}
                    </span>
                  </button>
                ))}
              </div>

              <textarea
                id="audit-req"
                required
                rows={layoutMode === 'split' ? 5 : 4}
                disabled={isLoading}
                value={auditRequirement}
                onChange={(e) => setAuditRequirement(e.target.value)}
                placeholder="Especifica el requisito normativo de auditoría..."
                className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs leading-relaxed"
              />
            </div>

            {/* Código Manual Opcional */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <button
                type="button"
                onClick={() => setShowManualCode(!showManualCode)}
                className="w-full px-3.5 py-2 flex items-center justify-between text-left text-xs font-medium text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Adjuntar código fuente o script local adicional (Opcional)</span>
                </span>
                {showManualCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showManualCode && (
                <div className="p-3 border-t border-slate-800 space-y-2">
                  <textarea
                    rows={4}
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="# Pega aquí código Python, YAML o Dockerfile para inspección directa..."
                    className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Botón de Enviar */}
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>
                  Evaluado mediante <strong>Gemma 4</strong> con esquema JSON estricto.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || !repoUrl.trim() || !auditRequirement.trim()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-3.5 w-3.5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>{loadingStep || 'Analizando con Gemma 4...'}</span>
                  </>
                ) : (
                  <>
                    <span>Auditar con Gemma 4</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* =========================================
            RESULTADO EN JSON (INFERIOR O PANEL DERECHO)
            ========================================= */}
        <div className="space-y-4">
          {report ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <FileJson className="w-4 h-4 text-emerald-400" />
                    <span>Informe de Auditoría en Formato JSON</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    4 campos normativos emitidos por Gemma 4: status, reasoning, gap, suggested_action.
                  </p>
                </div>

                {onSendToRemediation && report.gap && report.gap !== 'Ninguna brecha relevante identificada' && (
                  <button
                    type="button"
                    onClick={() =>
                      onSendToRemediation(report.gap, report.suggested_action, auditRequirement)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-medium transition cursor-pointer"
                    title="Generar parche de código para corregir esta brecha"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Generar Parche</span>
                  </button>
                )}
              </div>

              {/* Visual Result & JSON Component */}
              <AuditResult report={report} metadata={metadata || undefined} evidence={evidence} />
            </div>
          ) : (
            <div className="h-full min-h-[320px] rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-950/60 text-blue-400 border border-blue-800/60 flex items-center justify-center">
                <FileCode className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300">
                Resultado de Auditoría en JSON
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Introduce la URL del repositorio y el requisito en el formulario, luego pulsa en "Auditar con Gemma 4". El informe estructurado aparecerá inmediatamente aquí.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
