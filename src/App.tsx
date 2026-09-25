/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { AuditModule } from './components/AuditModule';
import { MatrixModule } from './components/MatrixModule';
import { RiskClassifierModule } from './components/RiskClassifierModule';
import { RemediationModule } from './components/RemediationModule';
import { EurlexModule } from './components/EurlexModule';
import { EdpbAgentsModule } from './components/EdpbAgentsModule';
import { EvidenceLockerModule, SavedEvidence } from './components/EvidenceLockerModule';
import {
  AuditReport,
  AuditMetadata,
  AuditResponse,
  AppModule,
  CryptographicEvidence,
} from './types';
import { AI_ACT_PRESETS, SAMPLE_REPOS } from './constants/aiActPresets';

export default function App() {
  const [currentModule, setCurrentModule] = useState<AppModule>('audit');

  // Audit state
  const [repoUrl, setRepoUrl] = useState<string>(SAMPLE_REPOS[0].url);
  const [auditRequirement, setAuditRequirement] = useState<string>(AI_ACT_PRESETS[0].requirementText);
  const [manualCode, setManualCode] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [report, setReport] = useState<AuditReport | null>(null);
  const [metadata, setMetadata] = useState<AuditMetadata | null>(null);
  const [evidence, setEvidence] = useState<CryptographicEvidence | null>(null);

  // Evidence Locker state (EDPB-SUPER-ECOSYSTEM Evidence Chain)
  const [evidences, setEvidences] = useState<SavedEvidence[]>([
    {
      id: 'init-evidence-1',
      sha256Hash: 'a7c938d2f01bf890e54cd794b15c6d3fa9e51c8109bf17b88e7b1730dcf23901',
      repo: 'medai/diagnostic-vision',
      auditRequirement: 'Artículo 10: Gobernanza de datos, representatividad y mitigación de sesgos',
      status: 'no_conforme',
      timestamp: '2026-09-24T17:10:14.442Z',
      report: {
        status: 'no_conforme',
        reasoning:
          'El archivo data_loader.py confirma que el dataset procede de un único centro hospitalario sin desagregación demográfica ni validación de sesgos.',
        gap: 'Ausencia de representatividad demográfica y de pipeline de detección de sesgos algorítmicos.',
        suggested_action: 'Implementar auditoría con Fairlearn y documentación técnica conforme al Anexo IV.',
      },
      expertName: 'Manuel Gago Fernández',
      expertPool: 'EDPB-SPE-2025-2030',
    },
  ]);

  // Remediation pre-fill state
  const [remediationGap, setRemediationGap] = useState<string>('');
  const [remediationAction, setRemediationAction] = useState<string>('');
  const [remediationArticle, setRemediationArticle] = useState<string>('');

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim() || !auditRequirement.trim()) return;

    setIsLoading(true);
    setLoadingStep('Accediendo al repositorio de GitHub...');

    const timer1 = setTimeout(() => {
      setLoadingStep('Inspeccionando archivos de código y model cards...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setLoadingStep('Evaluando directivas con Gemma 4 Auditor...');
    }, 2800);

    const timer3 = setTimeout(() => {
      setLoadingStep('Generando evidencia criptográfica SHA-256 e informe JSON...');
    }, 4500);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          auditRequirement: auditRequirement.trim(),
          manualCode: manualCode.trim() || undefined,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      const data: AuditResponse = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al procesar la auditoría con Gemma 4.');
      }

      setReport(data.report);
      setMetadata(data.metadata);

      if (data.evidence) {
        setEvidence(data.evidence);

        // Add to evidence locker
        const newEvidence: SavedEvidence = {
          id: `evidence-${Date.now()}`,
          sha256Hash: data.evidence.sha256Hash,
          repo: data.metadata.repo,
          auditRequirement: data.metadata.auditRequirement,
          status: data.report.status,
          timestamp: data.evidence.timestamp,
          report: data.report,
          expertName: data.evidence.expertName || 'Manuel Gago Fernández',
          expertPool: data.evidence.expertPool || 'EDPB-SPE-2025-2030',
        };

        setEvidences((prev) => [newEvidence, ...prev]);
      }
    } catch (err: any) {
      console.error('Audit failed:', err);
      alert(err.message || 'Error durante la auditoría.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleSendToRemediation = (gap: string, action: string, requirement: string) => {
    setRemediationGap(gap);
    setRemediationAction(action);
    setRemediationArticle(requirement);
    setCurrentModule('remediation');
  };

  const handleClearEvidences = () => {
    if (confirm('¿Deseas reiniciar la bóveda de evidencias de la sesión?')) {
      setEvidences([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        evidenceCount={evidences.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {currentModule === 'audit' && (
          <AuditModule
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            auditRequirement={auditRequirement}
            setAuditRequirement={setAuditRequirement}
            manualCode={manualCode}
            setManualCode={setManualCode}
            isLoading={isLoading}
            onSubmit={handleAuditSubmit}
            loadingStep={loadingStep}
            report={report}
            metadata={metadata}
            evidence={evidence || undefined}
            onSendToRemediation={handleSendToRemediation}
          />
        )}

        {currentModule === 'agents' && <EdpbAgentsModule />}

        {currentModule === 'matrix' && <MatrixModule />}

        {currentModule === 'evidence' && (
          <EvidenceLockerModule
            evidences={evidences}
            onClearEvidences={handleClearEvidences}
          />
        )}

        {currentModule === 'risk' && <RiskClassifierModule />}

        {currentModule === 'remediation' && (
          <RemediationModule
            initialGap={remediationGap}
            initialSuggestedAction={remediationAction}
            initialArticle={remediationArticle}
          />
        )}

        {currentModule === 'eurlex' && <EurlexModule />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>EDPB-SUPER-ECOSYSTEM • Manuel Gago Fernández (EDPB-SPE-2025-2030)</span>
          </div>
          <p className="text-slate-400">
            EU AI Act (UE 2024/1689) • RGPD • Trazabilidad Forense SHA-256 • Motor Gemma 4
          </p>
        </div>
      </footer>
    </div>
  );
}
