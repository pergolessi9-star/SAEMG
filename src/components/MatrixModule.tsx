import React, { useState } from 'react';
import {
  TableProperties,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
  FileJson,
  Download,
  Copy,
  Check,
  Sparkles,
  Info,
  ChevronRight,
  Github,
} from 'lucide-react';
import { MatrixReport, AuditStatus } from '../types';
import { SAMPLE_REPOS } from '../constants/aiActPresets';
import { JsonViewer } from './JsonViewer';

export const MatrixModule: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>(SAMPLE_REPOS[0].url);
  const [manualCode, setManualCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixReport | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'json'>('matrix');

  const handleRunMatrix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/audit-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim(), manualCode: manualCode.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al generar la matriz de cumplimiento.');
      }

      setMatrixData(data.matrix);
    } catch (err: any) {
      setError(err.message || 'Error en la matriz.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: AuditStatus) => {
    switch (status) {
      case 'conforme':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Conforme</span>
          </span>
        );
      case 'parcial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Parcial</span>
          </span>
        );
      case 'no_conforme':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>No Conforme</span>
          </span>
        );
      case 'no_verificable':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>No Verificable</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <TableProperties className="w-4 h-4 text-blue-400" />
            <span>Matriz Holística de Cumplimiento Multi-Artículo (EU AI Act)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Evaluación masiva del repositorio frente a los Artículos 10, 12, 13, 14, 15 y 50 en un solo escaneo.
          </p>
        </div>

        {matrixData && (
          <div className="flex items-center bg-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                activeTab === 'matrix' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vista Tabla
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                activeTab === 'json' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              JSON Completo
            </button>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
        <form onSubmit={handleRunMatrix} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Github className="w-4 h-4 text-blue-400" />
              <span>Repositorio de GitHub a escanear en lote</span>
            </label>
            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              <span className="text-slate-400 text-[11px]">Probar con:</span>
              {SAMPLE_REPOS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => setRepoUrl(sample.url)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 cursor-pointer"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              disabled={isLoading}
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/usuario/repositorio"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading || !repoUrl.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Evaluando 6 Artículos...</span>
                </>
              ) : (
                <>
                  <span>Ejecutar Escaneo Multi-Artículo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Results */}
      {matrixData && (
        <div className="space-y-4">
          {/* Executive Scorecard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Puntuación de Cumplimiento
                </span>
                <div className="text-2xl font-extrabold text-white mt-0.5">
                  {matrixData.overallScore} / 100
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold border ${
                  matrixData.overallScore >= 75
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                    : matrixData.overallScore >= 45
                    ? 'bg-amber-950 text-amber-400 border-amber-700'
                    : 'bg-rose-950 text-rose-400 border-rose-700'
                }`}
              >
                {matrixData.overallScore}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Nivel de Riesgo Regulatorio
              </span>
              <div
                className={`text-lg font-bold mt-1 uppercase tracking-wide ${
                  matrixData.overallRiskLevel === 'Bajo'
                    ? 'text-emerald-400'
                    : matrixData.overallRiskLevel === 'Medio'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                Riesgo {matrixData.overallRiskLevel}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Repositorio & Fecha
              </span>
              <div className="text-xs font-mono text-slate-200 mt-1 truncate">
                {matrixData.auditedRepo}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {new Date(matrixData.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-blue-300 block mb-1">Dictamen Ejecutivo Global:</span>
            {matrixData.summary}
          </div>

          {/* Main Matrix Content */}
          {activeTab === 'matrix' ? (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Artículo</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Brecha Detectada (Gap)</th>
                    <th className="py-3 px-4">Acción Correctiva Sugerida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {matrixData.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-200 whitespace-nowrap align-top">
                        <div className="font-bold text-blue-400">{item.articleId}</div>
                        <div className="text-[11px] text-slate-400">{item.articleTitle}</div>
                      </td>
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 align-top max-w-xs">
                        <p className="line-clamp-3 hover:line-clamp-none font-mono text-[11px] text-rose-300/90">
                          {item.gap}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 align-top max-w-sm">
                        <p className="line-clamp-3 hover:line-clamp-none text-emerald-300/90">
                          {item.suggested_action}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <JsonViewer data={matrixData} filename="matriz-cumplimiento-eu-ai-act.json" />
          )}
        </div>
      )}
    </div>
  );
};
