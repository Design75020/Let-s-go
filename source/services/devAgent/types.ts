
export interface DependencyNode {
  id: string;
  imports: string[];
  exports: string[];
  isEntry: boolean;
  type: 'component' | 'service' | 'hook' | 'api' | 'context';
}

export interface ImpactReport {
  targetFile: string;
  affectedFiles: string[];
  riskScore: number; // 0-100
  criticalPathBreach: boolean;
}

export type Verdict = 'ALLOW' | 'REVIEW' | 'BLOCK';

export interface GuardrailCheck {
  name: string;
  passed: boolean;
  message: string;
  verdict: Verdict;
}

export interface PRAnalysis {
  id: string;
  filesChanged: string[];
  impactReport: ImpactReport;
  checks: GuardrailCheck[];
  finalVerdict: Verdict;
  riskScore: number;
}

export interface RepoEntity {
  name: string;
  type: 'component' | 'service' | 'hook' | 'api' | 'test' | 'context';
  path: string;
  dependencies: string[];
  complexity: number; // 1-10
  node?: DependencyNode;
}

export interface TechnicalDebt {
  id: string;
  category: 'performance' | 'security' | 'maintainability' | 'duplication';
  location: string;
  description: string;
  score: number; // 1-100 (higher means worse debt)
}

export interface SafetyStatus {
  ciPassing: boolean;
  humanOverrideActive: boolean;
  deploymentLocked: boolean;
  rulesVerified: string[];
}

export interface ProposedFeature {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  estimatedEffort: string;
  status: 'proposed' | 'approved' | 'implemented';
}

export interface ArchitectureViolation {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  file: string;
}

export interface DevAgentState {
  isScanning: boolean;
  repoGraph: RepoEntity[];
  proposals: ProposedFeature[];
  violations: ArchitectureViolation[];
}
