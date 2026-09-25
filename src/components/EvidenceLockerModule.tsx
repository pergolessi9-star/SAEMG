import React, { useState } from 'react';
import {
  Fingerprint,
  ShieldCheck,
  Download,
  Copy,
  Check,
  ExternalLink,
  Search,
  Scale,
  Calendar,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { CryptographicEvidence, AuditReport } from '../types';

export interface SavedEvidence {
  id: string;
  sha256Hash: string;
  repo: string;
  auditRequirement: string;
  status: 'conforme' | 'parcial' | 'no_conforme' | 'no_verificable';
  timestamp: string;
  report: AuditReport;
  expertName: string;
  expertPool: string;
}

interface EvidenceLockerModuleProps {
  evidences: SavedEvidence[];
  onClearEvidences?: () => void;
}

export const EvidenceLockerModule: React.FC<EvidenceLockerModuleProps> = ({
  evidences,
  onClearEvidences,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = evidences.filter(
    (e) =>
      e.repo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.auditRequirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.sha256Hash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadAll = () => {
    const bundle = {
      title: 'EDPB-SUPER-ECOSYSTEM AI Act Audit Evidences Bundle',
      exportedAt: new Date().toISOString(),
      expert: 'Manuel Gago Fernández | EDPB Support Pool of Experts 2025-2030 (EDPB-SPE-2025-2030)',
      totalEvidences: evidences.length,
      evidences,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edpb-ai-act-evidences-chain-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'conforme':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'parcial':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'no_conforme':
        return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-emerald-400" />
            <span>Bóveda de Evidencias Criptográficas SHA-256 (Evidence Locker)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Registro inmutable de auditorías forenses con hash SHA-256 y trazabilidad legal exigida por el Art. 12 del EU AI Act.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {evidences.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadAll}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Cadena Completa JSON</span>
            </button>
          )}
          {onClearEvidences && evidences.length > 0 && (
            <button
              type="button"
              onClick={onClearEvidences}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 transition cursor-pointer"
              title="Limpiar historial de la sesión"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por repositorio, artículo o hash SHA-256..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Evidences List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-md space-y-3 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="font-bold text-xs text-white">{item.repo}</span>
                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'conforme'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : item.status === 'parcial'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : item.status === 'no_conforme'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-purple-950 text-purple-400 border border-purple-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900 text-[10px]">
                    {item.expertPool}
                  </span>
                </div>
              </div>

              {/* SHA-256 Hash Box */}
              <div className="flex items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
                <div className="truncate text-emerald-300">
                  <span className="text-slate-500 uppercase font-semibold text-[10px] mr-2">SHA-256:</span>
                  <span>{item.sha256Hash}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyHash(item.id, item.sha256Hash)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === item.id ? 'Copiado' : 'Copiar Hash'}</span>
                </button>
              </div>

              {/* Details */}
              <div className="text-xs text-slate-300 space-y-1">
                <div>
                  <span className="text-slate-500 font-semibold">Requisito Auditado: </span>
                  <span className="text-slate-300">{item.auditRequirement}</span>
                </div>
                {item.report.gap && item.report.gap !== 'Ninguna brecha relevante identificada' && (
                  <div className="font-mono text-[11px] text-rose-300/90 bg-rose-950/20 p-2 rounded border border-rose-900/30">
                    <span className="text-rose-400 font-semibold">Gap detectado: </span>
                    {item.report.gap}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-center space-y-2">
          <Fingerprint className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-xs font-semibold text-slate-400">Bóveda de Evidencias Vacía</h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Cada vez que ejecutes una auditoría en el módulo principal o consultes un sub-agente, se generará y registrará automáticamente aquí una evidencia con hash SHA-256.
          </p>
        </div>
      )}
    </div>
  );
};
