import React, { useState, useEffect } from 'react';
import {
  Globe2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calendar,
  AlertOctagon,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { HfModelInspection } from '../types';

export const EurlexModule: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [hfModelId, setHfModelId] = useState<string>('google/gemma-2-2b-it');
  const [hfResult, setHfResult] = useState<HfModelInspection | null>(null);
  const [hfLoading, setHfLoading] = useState<boolean>(false);
  const [hfError, setHfError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/eurlex')
      .then((res) => res.json())
      .then((data) => {
        if (data.articles) setArticles(data.articles);
      })
      .catch((err) => console.error('Error fetching EUR-Lex data:', err));
  }, []);

  const handleInspectHf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hfModelId.trim()) return;

    setHfLoading(true);
    setHfError(null);

    try {
      const res = await fetch(`/api/hf-inspect?modelId=${encodeURIComponent(hfModelId.trim())}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'No se pudo consultar el modelo en Hugging Face.');
      }
      setHfResult(data);
    } catch (err: any) {
      setHfError(err.message || 'Error al consultar la API de Hugging Face.');
    } finally {
      setHfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-cyan-400" />
            <span>APIs Abiertas & Base Regulatoria Oficial EUR-Lex (UE 2024/1689)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Consulta los plazos de aplicación, régimen sancionador y valida modelos de IA públicos en Hugging Face Hub sin coste.
          </p>
        </div>

        <a
          href="https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32024R1689"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
        >
          <span>EUR-Lex Oficial</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Submódulo API Gratuita: Hugging Face Model Card Inspector */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span className="p-1 rounded bg-yellow-500/20 text-yellow-400">🤗</span>
              <span>API Hugging Face Hub (Inspección de Model Cards & Licencias - Art. 53)</span>
            </h3>
            <span className="text-[11px] text-emerald-400 font-mono">API Pública Gratuita</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Los modelos de IA de uso general (GPAI) deben contar con documentación técnica accesible (Model Card) y licencia según el Art. 53.
          </p>
        </div>

        <form onSubmit={handleInspectHf} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={hfModelId}
            disabled={hfLoading}
            onChange={(e) => setHfModelId(e.target.value)}
            placeholder="google/gemma-2-2b-it o meta-llama/Llama-3-8B"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={hfLoading || !hfModelId.trim()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            {hfLoading ? (
              <span>Consultando HF Hub...</span>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Verificar Modelo en HF</span>
              </>
            )}
          </button>
        </form>

        {hfError && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            {hfError}
          </div>
        )}

        {hfResult && (
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-xs font-bold text-white font-mono">{hfResult.modelId}</span>
                <span className="text-xs text-slate-400 ml-2">({hfResult.pipelineTag})</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Licencia: <strong className="text-white">{hfResult.license}</strong>
                </span>
                <span className="text-slate-400">Descargas: {(hfResult.downloads || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div
                className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                  hfResult.hasModelCard
                    ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-800 text-rose-300'
                }`}
              >
                {hfResult.hasModelCard ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
                <span>Model Card Disponible (Art. 53)</span>
              </div>

              <div
                className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                  hfResult.complianceFlags.hasLicense
                    ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-800 text-amber-300'
                }`}
              >
                {hfResult.complianceFlags.hasLicense ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
                <span>Licencia Técnica Declarada</span>
              </div>

              <div
                className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                  hfResult.complianceFlags.hasDemographicDataNotice
                    ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Mención de Auditoría de Sesgos</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Directorio de Artículos EUR-Lex */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400" />
          <span>Calendario de Aplicación y Régimen Sancionador Oficial (EU AI Act)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {articles.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-md space-y-2 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-blue-400">{item.article}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                  {item.entryIntoForce}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-white">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.scope}</p>
              <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
                <AlertOctagon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Sanción máx.: {item.maxFine}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
