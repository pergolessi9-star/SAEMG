import React, { useState } from 'react';
import {
  Wrench,
  Code2,
  ArrowRight,
  Copy,
  Check,
  Download,
  FileCode,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';
import { RemediationReport } from '../types';

interface RemediationModuleProps {
  initialGap?: string;
  initialSuggestedAction?: string;
  initialArticle?: string;
}

export const RemediationModule: React.FC<RemediationModuleProps> = ({
  initialGap = '',
  initialSuggestedAction = '',
  initialArticle = 'Artículo 10: Gobernanza de datos y mitigación de sesgos',
}) => {
  const [gap, setGap] = useState<string>(
    initialGap ||
      'Dataset procedente de un único centro hospitalario sin desagregación demográfica ni auditoría de sesgo algorítmico.'
  );
  const [suggestedAction, setSuggestedAction] = useState<string>(
    initialSuggestedAction ||
      'Implementar un pipeline de auditoría de sesgos con Fairlearn/AIF360 y documentar metadatos demográficos conforme al Anexo IV.'
  );
  const [article, setArticle] = useState<string>(initialArticle);
  const [codeContext, setCodeContext] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [remediation, setRemediation] = useState<RemediationReport | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const sampleRemediations = [
    {
      title: 'Mitigación de Sesgo y Métricas Fairlearn (Art. 10)',
      gap: 'Ausencia de comprobación de paridad demográfica en dataset de selección.',
      action: 'Crear script de cálculo de disparate impact ratio y selección con umbral equitativo.',
      article: 'Artículo 10: Gobernanza de datos',
    },
    {
      title: 'Logging Inmutable y Trazabilidad (Art. 12)',
      gap: 'Registro en texto plano sin correlation ID ni control de integridad.',
      action: 'Implementar logger estructurado JSON con trace_id, versionado y hashing SHA-256.',
      article: 'Artículo 12: Mantenimiento de registros',
    },
    {
      title: 'Botón de Parada Médica Kill-Switch (Art. 14)',
      gap: 'Inferencia directa que emite diagnóstico médico sin supervisión ni parada.',
      action: 'Implementar decorador de autorización médica previa e interruptor de emergencia.',
      article: 'Artículo 14: Supervisión humana',
    },
    {
      title: 'Marcado Digital C2PA en Medios Sintéticos (Art. 50)',
      gap: 'Imágenes generadas sin marcas de agua criptográficas ni manifiestos legibles por máquina.',
      action: 'Inyectar manifiesto C2PA en los metadatos EXIF/JUMBF del archivo generado.',
      article: 'Artículo 50: Marcado de contenido de IA',
    },
  ];

  const handleGenerateRemediation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gap.trim() || !suggestedAction.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/remediation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gap: gap.trim(),
          suggestedAction: suggestedAction.trim(),
          article: article.trim(),
          codeSnippet: codeContext.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al generar la solución de remediation.');
      }

      setRemediation(data.remediation);
    } catch (err: any) {
      setError(err.message || 'Error en remediation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!remediation) return;
    navigator.clipboard.writeText(remediation.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPatch = () => {
    if (!remediation) return;
    const blob = new Blob([remediation.codeSnippet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = remediation.targetFile || 'remediation_patch.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span>Generador de Parches y Remediation Técnica (Gemma 4)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Transforma automáticamente las brechas identificadas (gap) en código fuente correctivo y funcional.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
        {/* Presets */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Cargar caso de solución técnica predefinido:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {sampleRemediations.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setGap(s.gap);
                  setSuggestedAction(s.action);
                  setArticle(s.article);
                }}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-left transition cursor-pointer"
              >
                <div className="font-semibold text-xs text-emerald-300">{s.title}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{s.gap}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleGenerateRemediation} className="space-y-4 pt-2 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                Brecha Técnica Identificada (Gap)
              </label>
              <textarea
                rows={3}
                required
                disabled={isLoading}
                value={gap}
                onChange={(e) => setGap(e.target.value)}
                placeholder="Describe la brecha o copia el campo 'gap' del informe de auditoría..."
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                Acción Correctiva Sugerida (Suggested Action)
              </label>
              <textarea
                rows={3}
                required
                disabled={isLoading}
                value={suggestedAction}
                onChange={(e) => setSuggestedAction(e.target.value)}
                placeholder="Acción correctiva propuesta por el informe..."
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                Artículo del EU AI Act de Referencia
              </label>
              <input
                type="text"
                disabled={isLoading}
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                placeholder="Ej. Artículo 10: Gobernanza de datos"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                Fragmento de Código Base (Opcional)
              </label>
              <input
                type="text"
                disabled={isLoading}
                value={codeContext}
                onChange={(e) => setCodeContext(e.target.value)}
                placeholder="Ej. def load_data(): df = pd.read_csv('patients.csv')"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !gap.trim() || !suggestedAction.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Generando Parche con Gemma 4...</span>
              </>
            ) : (
              <>
                <span>Generar Código de Remediation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Resultado de Remediation */}
      {remediation && (
        <div className="space-y-4">
          {/* Header del Parche */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Solución Técnica:
                </span>
                <h3 className="text-sm font-bold text-white">{remediation.remediationTitle}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Archivo objetivo:{' '}
                <code className="text-xs font-mono text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded">
                  {remediation.targetFile}
                </code>{' '}
                • Lenguaje: <span className="uppercase text-slate-300 font-semibold">{remediation.language}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Parche'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPatch}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs border border-emerald-700/60 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </button>
            </div>
          </div>

          {/* Bloque de Código */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{remediation.targetFile}</span>
              <span className="text-emerald-400">Gemma 4 Verified Patch</span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[420px]">
              <code>{remediation.codeSnippet}</code>
            </pre>
          </div>

          {/* Pasos de Implementación y Notas Normativas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Pasos para Aplicar la Solución
              </span>
              <ol className="space-y-1.5 text-xs text-slate-300">
                {remediation.implementationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                    <span className="font-bold text-emerald-400">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Fundamentación del Cumplimiento (EU AI Act)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                {remediation.complianceNotes}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
