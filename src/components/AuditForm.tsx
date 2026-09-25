import React, { useState } from 'react';
import {
  Github,
  BookOpen,
  Sparkles,
  ArrowRight,
  Code2,
  FileCode,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AI_ACT_PRESETS, SAMPLE_REPOS, RequirementPreset, SampleRepo } from '../constants/aiActPresets';

interface AuditFormProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  auditRequirement: string;
  setAuditRequirement: (req: string) => void;
  manualCode: string;
  setManualCode: (code: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  loadingStep?: string;
}

export const AuditForm: React.FC<AuditFormProps> = ({
  repoUrl,
  setRepoUrl,
  auditRequirement,
  setAuditRequirement,
  manualCode,
  setManualCode,
  isLoading,
  onSubmit,
  loadingStep,
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>('art-10');
  const [showManualCode, setShowManualCode] = useState<boolean>(false);

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
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-5 sm:p-7 transition-all">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Campo 1: URL del Repositorio de GitHub */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="repo-url"
              className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"
            >
              <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>1. URL del Repositorio de GitHub</span>
              <span className="text-xs font-normal text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-400">Público o repositorio de muestra</span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Github className="w-5 h-5" />
            </div>
            <input
              id="repo-url"
              type="text"
              required
              disabled={isLoading}
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/usuario/nombre-del-repositorio"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm font-mono"
            />
          </div>

          {/* Quick Sample Repositories */}
          <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Probar repositorios de ejemplo:
            </span>
            {SAMPLE_REPOS.map((sample) => (
              <button
                key={sample.name}
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectSampleRepo(sample)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  repoUrl === sample.url
                    ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-400 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={sample.description}
              >
                <span>{sample.name}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">({sample.tag})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Campo 2: Requisito de Auditoría */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="audit-requirement"
              className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>2. Requisito de Auditoría (EU AI Act)</span>
              <span className="text-xs font-normal text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-400">Selecciona un artículo o edita el texto</span>
          </div>

          {/* Selector de Artículos Clave del EU AI Act */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 mb-2.5">
            {AI_ACT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectPreset(preset)}
                className={`p-2 rounded-lg text-left border transition cursor-pointer flex flex-col justify-between ${
                  selectedArticleId === preset.id && auditRequirement === preset.requirementText
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-semibold text-xs leading-tight">{preset.article}</div>
                <div
                  className={`text-[11px] truncate mt-0.5 ${
                    selectedArticleId === preset.id && auditRequirement === preset.requirementText
                      ? 'text-blue-100'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                  title={preset.title}
                >
                  {preset.title}
                </div>
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              id="audit-requirement"
              required
              rows={4}
              disabled={isLoading}
              value={auditRequirement}
              onChange={(e) => setAuditRequirement(e.target.value)}
              placeholder="Especifica el requisito normativo de auditoría (por ejemplo, directrices del Artículo 10 sobre mitigación de sesgos o Artículo 14 sobre supervisión humana)..."
              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Acordeón Opcional: Fragmento de Código Manual o Adicional */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/30">
          <button
            type="button"
            onClick={() => setShowManualCode(!showManualCode)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Añadir código fuente o script específico adicional (Opcional)</span>
            </span>
            {showManualCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showManualCode && (
            <div className="p-4 pt-1 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pega aquí un fragmento de código relevante (ej. <code>pipeline.py</code>, filtros de guardrails, logging o configuración) si deseas auditar un archivo concreto junto al repositorio.
              </p>
              <textarea
                rows={4}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="# Pega aquí código Python, YAML o configuración técnica..."
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Botón de Enviar Auditoría */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>
              El modelo <strong>Gemma 4</strong> evaluará el código e inspeccionará brechas y emitirá el informe JSON normativo.
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !repoUrl.trim() || !auditRequirement.trim()}
            className="w-full sm:w-auto min-w-[220px] px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>{loadingStep || 'Analizando con Gemma 4...'}</span>
              </>
            ) : (
              <>
                <span>Auditar Código con Gemma 4</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
