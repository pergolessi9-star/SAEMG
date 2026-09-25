import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  FileJson,
  Layers,
  FileCode,
  Shield,
  Lightbulb,
  AlertCircle,
  Info,
  Calendar,
  Fingerprint,
  Copy,
  Check,
  Scale,
  UserCheck,
  Download,
} from 'lucide-react';
import { AuditReport, AuditMetadata, AuditStatus, CryptographicEvidence } from '../types';
import { JsonViewer } from './JsonViewer';

interface AuditResultProps {
  report: AuditReport;
  metadata?: AuditMetadata;
  evidence?: CryptographicEvidence;
}

export const AuditResult: React.FC<AuditResultProps> = ({ report, metadata, evidence }) => {
  const [activeTab, setActiveTab] = useState<'json' | 'cards' | 'evidence'>('json');
  const [hashCopied, setHashCopied] = useState(false);

  const getStatusConfig = (status: AuditStatus) => {
    switch (status) {
      case 'conforme':
        return {
          label: 'Conforme',
          description: 'El sistema cumple satisfactoriamente con el requisito del EU AI Act.',
          bgColor: 'bg-emerald-950/30',
          borderColor: 'border-emerald-700/60',
          textColor: 'text-emerald-300',
          badgeBg: 'bg-emerald-500 text-white font-bold',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        };
      case 'parcial':
        return {
          label: 'Parcial',
          description: 'Cumplimiento incompleto. Se detectan indicios positivos pero existen brechas técnicas.',
          bgColor: 'bg-amber-950/30',
          borderColor: 'border-amber-700/60',
          textColor: 'text-amber-300',
          badgeBg: 'bg-amber-500 text-slate-950 font-bold',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        };
      case 'no_conforme':
        return {
          label: 'No Conforme',
          description: 'Incumplimiento directo o ausencia de salvaguardas obligatorias del EU AI Act.',
          bgColor: 'bg-rose-950/30',
          borderColor: 'border-rose-700/60',
          textColor: 'text-rose-300',
          badgeBg: 'bg-rose-600 text-white font-bold',
          icon: <XCircle className="w-5 h-5 text-rose-400" />,
        };
      case 'no_verificable':
      default:
        return {
          label: 'No Verificable',
          description: 'No se encontraron evidencias técnicas suficientes en los archivos inspeccionados.',
          bgColor: 'bg-purple-950/30',
          borderColor: 'border-purple-700/60',
          textColor: 'text-purple-300',
          badgeBg: 'bg-purple-600 text-white font-bold',
          icon: <HelpCircle className="w-5 h-5 text-purple-400" />,
        };
    }
  };

  const statusConfig = getStatusConfig(report.status);

  // Exact JSON output as required: status, reasoning, gap, suggested_action
  const pureReportJson = {
    status: report.status,
    reasoning: report.reasoning,
    gap: report.gap,
    suggested_action: report.suggested_action,
  };

  const handleCopyHash = () => {
    if (!evidence?.sha256Hash) return;
    navigator.clipboard.writeText(evidence.sha256Hash);
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
  };

  const handleDownloadFullEvidence = () => {
    const fullAuditRecord = {
      report: pureReportJson,
      metadata,
      evidence,
      expertAuthority: 'Manuel Gago Fernández | EDPB Support Pool of Experts 2025-2030 (EDPB-SPE-2025-2030)',
      legalFramework: 'Reglamento (UE) 2024/1689 (EU AI Act) & RGPD',
    };
    const blob = new Blob([JSON.stringify(fullAuditRecord, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edpb-ai-act-evidence-${evidence?.sha256Hash.slice(0, 10) || 'report'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Banner de Estado General */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border ${statusConfig.borderColor} ${statusConfig.bgColor} transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2 rounded-xl bg-slate-900 shadow-sm border border-slate-800">
            {statusConfig.icon}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Dictamen de Auditoría:
              </span>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${statusConfig.badgeBg}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-1 text-slate-300 font-medium">
              {statusConfig.description}
            </p>
          </div>
        </div>

        {/* Selector de Pestaña: JSON Puro vs Ficha vs Evidencia Criptográfica */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium self-end sm:self-auto shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'json'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Formato JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Desglose</span>
          </button>

          {evidence && (
            <button
              type="button"
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'evidence'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Evidencia SHA-256</span>
            </button>
          )}
        </div>
      </div>

      {/* SHA-256 Quick Banner */}
      {evidence && activeTab !== 'evidence' && (
        <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-mono text-[11px] truncate max-w-xl text-slate-400">
            <Fingerprint className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="text-slate-500 uppercase font-semibold">SHA-256:</span>
            <span className="text-emerald-300 font-mono truncate">{evidence.sha256Hash}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyHash}
              className="text-[11px] text-slate-300 hover:text-white font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 flex items-center gap-1 cursor-pointer"
            >
              {hashCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{hashCopied ? 'Hash Copiado' : 'Copiar Hash'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadFullEvidence}
              className="text-[11px] text-blue-300 hover:text-blue-200 font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Descargar Evidencia</span>
            </button>
          </div>
        </div>
      )}

      {/* Contenido Principal: JSON, Tarjetas o Evidencia Criptográfica */}
      {activeTab === 'json' ? (
        <JsonViewer
          data={pureReportJson}
          filename={`auditoria-eu-ai-act-${report.status}.json`}
        />
      ) : activeTab === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo 1: status */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>1. status</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider ${statusConfig.badgeBg}`}
              >
                {report.status}
              </span>
            </div>
          </div>

          {/* Campo 3: gap */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span>3. gap (Brecha identificada)</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-mono text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-rose-300/90">
              {report.gap}
            </p>
          </div>

          {/* Campo 2: reasoning */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 shadow-sm md:col-span-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
              <Info className="w-4 h-4" />
              <span>2. reasoning (Justificación técnica y jurídica)</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {report.reasoning}
            </p>
          </div>

          {/* Campo 4: suggested_action */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 shadow-sm md:col-span-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
              <Lightbulb className="w-4 h-4" />
              <span>4. suggested_action (Acción correctiva técnica)</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed bg-emerald-950/20 p-3 rounded-lg border border-emerald-800/40 text-emerald-200">
              {report.suggested_action}
            </p>
          </div>
        </div>
      ) : (
        /* Pestaña: Evidencia Criptográfica EDPB */
        evidence && (
          <div className="p-5 rounded-2xl border border-emerald-800/60 bg-slate-900/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700/60">
                  <Fingerprint className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Certificado de Evidencia Forense Digital</h4>
                  <p className="text-[11px] text-slate-400">
                    Garantía de inmutabilidad y trazabilidad regulatoria según el Artículo 12 del EU AI Act.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-mono">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>{evidence.expertPool}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Hash Criptográfico SHA-256 de la Evidencia
              </label>
              <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 break-all select-all">
                <span>{evidence.sha256Hash}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Experto Auditor EDPB:</span>
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{evidence.expertName}</span>
                </div>
                <div className="text-[10px] text-slate-400">Support Pool of Experts (2025-2030)</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Garantías Regulatorias:</span>
                <div className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Human Oversight: Vinculante</span>
                </div>
                <div className="text-[10px] text-slate-400">Auditability: 100% • Trazable</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Marca Temporal UTC:</span>
                <div className="text-slate-200 font-mono text-[11px]">{new Date(evidence.timestamp).toISOString()}</div>
                <div className="text-[10px] text-slate-400">Inmutable y verificable</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleDownloadFullEvidence}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Certificado de Evidencia para Autoridad (AEPD / EDPB)</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* Metadata técnica de la auditoría */}
      {metadata && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-200">
              Repo: {metadata.repo}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              {metadata.filesExamined?.length || 0} archivos examinados
              {metadata.filesExamined?.length > 0 && (
                <span className="text-[11px] font-mono text-slate-400">
                  ({metadata.filesExamined.slice(0, 4).join(', ')}
                  {metadata.filesExamined.length > 4 ? '...' : ''})
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3 text-slate-400" />
              {new Date(metadata.timestamp).toLocaleTimeString()}
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-semibold border border-blue-800">
              {metadata.model}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
