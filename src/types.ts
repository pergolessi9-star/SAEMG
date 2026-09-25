export type AuditStatus = 'conforme' | 'parcial' | 'no_conforme' | 'no_verificable';

export interface AuditReport {
  status: AuditStatus;
  reasoning: string;
  gap: string;
  suggested_action: string;
}

export interface CryptographicEvidence {
  sha256Hash: string;
  timestamp: string;
  expertPool: string;
  expertName: string;
  humanOversight: boolean;
  traceability: boolean;
  auditability: boolean;
  agentId?: string;
}

export interface AuditMetadata {
  repo: string;
  repoUrl: string;
  auditRequirement: string;
  filesExamined: string[];
  fetchInfo?: string;
  timestamp: string;
  model: string;
}

export interface AuditResponse {
  report: AuditReport;
  metadata: AuditMetadata;
  evidence?: CryptographicEvidence;
  error?: string;
}

// Matrix multi-article evaluation
export interface MatrixItem {
  articleId: string;
  articleTitle: string;
  status: AuditStatus;
  gap: string;
  reasoning: string;
  suggested_action: string;
}

export interface MatrixReport {
  overallScore: number; // 0 - 100
  overallRiskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  summary: string;
  items: MatrixItem[];
  auditedRepo: string;
  timestamp: string;
}

// Remediation
export interface RemediationReport {
  remediationTitle: string;
  targetFile: string;
  language: string;
  codeSnippet: string;
  implementationSteps: string[];
  complianceNotes: string;
}

// Risk Classifier
export type RiskTier = 'Inadmisible' | 'Alto Riesgo' | 'Riesgo Específico (Transparencia)' | 'Riesgo Mínimo';

export interface RiskClassificationResult {
  tier: RiskTier;
  legalBasis: string;
  annexMatch: string;
  mandatoryRequirements: string[];
  prohibitedPracticesCheck: string;
  recommendations: string[];
}

// Sub-Agent consultation
export interface EdpbSubagentResponse {
  agentName: string;
  opinion: string;
  legalArticlesApplied: string[];
  technicalActionPoints: string[];
  evidenceStatement: string;
}

// FRIA (Fundamental Rights Impact Assessment Art. 27)
export interface FriaReport {
  friaRequired: boolean;
  severityScore: number;
  rightsAtRisk: Array<{
    right: string;
    riskLevel: 'Bajo' | 'Medio' | 'Alto';
    description: string;
    mitigation: string;
  }>;
  humanOversightProtocols: string[];
  conclusion: string;
}

// Hugging Face Public API inspection
export interface HfModelInspection {
  modelId: string;
  pipelineTag?: string;
  license?: string;
  downloads?: number;
  likes?: number;
  hasModelCard: boolean;
  complianceFlags: {
    hasLicense: boolean;
    hasWatermarkNotice: boolean;
    hasDemographicDataNotice: boolean;
  };
}

export type AppModule = 'audit' | 'matrix' | 'agents' | 'evidence' | 'risk' | 'remediation' | 'eurlex';
