import React from 'react';
import {
  ShieldCheck,
  Scale,
  ExternalLink,
  FileCode2,
  TableProperties,
  Flame,
  Wrench,
  Globe2,
  Bot,
  Fingerprint,
  Cpu,
  UserCheck,
} from 'lucide-react';
import { AppModule } from '../types';

interface HeaderProps {
  currentModule: AppModule;
  onSelectModule: (module: AppModule) => void;
  evidenceCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ currentModule, onSelectModule, evidenceCount = 0 }) => {
  const modules: Array<{ id: AppModule; label: string; icon: React.ReactNode; badge?: string }> = [
    {
      id: 'audit',
      label: 'Auditoría de Código',
      icon: <FileCode2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'agents',
      label: 'Sub-Agentes EDPB',
      icon: <Bot className="w-3.5 h-3.5" />,
      badge: '5 Expertos',
    },
    {
      id: 'matrix',
      label: 'Matriz Multi-Requisito',
      icon: <TableProperties className="w-3.5 h-3.5" />,
      badge: 'Batch',
    },
    {
      id: 'evidence',
      label: 'Bóveda Evidencias SHA-256',
      icon: <Fingerprint className="w-3.5 h-3.5" />,
      badge: evidenceCount > 0 ? `${evidenceCount}` : undefined,
    },
    {
      id: 'risk',
      label: 'Riesgo & FRIA (Art. 27)',
      icon: <Flame className="w-3.5 h-3.5" />,
      badge: 'Anexo III',
    },
    {
      id: 'remediation',
      label: 'Generador de Parches',
      icon: <Wrench className="w-3.5 h-3.5" />,
    },
    {
      id: 'eurlex',
      label: 'EUR-Lex & HF Hub',
      icon: <Globe2 className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40 text-slate-100">
      {/* Top Banner: EDPB-SUPER-ECOSYSTEM Bar */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-blue-900/40 px-4 py-1 text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 font-mono">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
              <Scale className="w-3 h-3" />
              <span>EDPB-SUPER-ECOSYSTEM</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-200">Manuel Gago Fernández</span>
            <span className="text-slate-500">•</span>
            <span className="text-blue-300">EDPB Support Pool of Experts 2025-2030 (EDPB-SPE-2025-2030)</span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SHA-256 Evidence Engine Active
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300">
              <UserCheck className="w-3 h-3 text-cyan-400" />
              Human Oversight: BINDING
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-900/30 ring-1 ring-blue-400/30">
            <Scale className="w-5 h-5 text-amber-300" />
            <div className="absolute -bottom-1 -right-1 p-0.5 bg-slate-950 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>EU AI Act</span>
                <span className="text-blue-400 font-semibold">Auditor Pro</span>
              </h1>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/80">
                <Cpu className="w-3 h-3 text-blue-400" />
                <span>Gemma 4 Compliance Engine</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Auditoría estricta de repositorios y evidencias criptográficas conforme al Reglamento (UE) 2024/1689
            </p>
          </div>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-2 text-xs">
          <a
            href="https://edpb.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/70 hover:bg-blue-900 border border-blue-800 text-blue-200 transition text-[11px] font-medium cursor-pointer"
          >
            <span>Ver Ecosistema EDPB</span>
            <ExternalLink className="w-3 h-3 text-blue-400" />
          </a>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-slate-900 overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-1 py-1.5" aria-label="Módulos EDPB">
          {modules.map((m) => {
            const isActive = currentModule === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectModule(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
                {m.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive ? 'bg-blue-900/90 text-blue-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
