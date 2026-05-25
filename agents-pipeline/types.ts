/**
 * /agents-pipeline/types.ts
 *
 * Formal data models for the AI Software Factory orchestration pipeline.
 */

export interface ProductPrompt {
  prompt: string;
}

export interface ManusServiceDef {
  name: string;
  description: string;
  endpoints: { method: string; path: string; description: string }[];
}

export interface ManusArchitecture {
  architectureStyle: string;
  services: ManusServiceDef[];
  dataPlane: {
    primaryDatabase: string;
    cache: string;
    messageBroker: string;
  };
  deploymentTarget: {
    platform: string;
    healthCheckPath: string;
  };
  constraints: string[];
}

export interface CodexFileGen {
  path: string;
  content: string;
}

export interface CodexOutput {
  status: 'ok' | 'error';
  filesGenerated: CodexFileGen[];
  buildLog?: string;
}

export interface PipelineExecutionState {
  id: string;
  prompt: string;
  status: 'PENDING' | 'MANUS_COMPLETED' | 'CODEX_COMPLETED' | 'GITHUB_PUSHED' | 'DEPLOYING' | 'SUCCESS' | 'FAILED';
  manusOutput?: ManusArchitecture;
  codexOutput?: CodexOutput;
  githubRepo?: string;
  cloudRunUrl?: string;
  errorMessage?: string;
  logs: { timestamp: string; message: string; type: 'info' | 'warn' | 'error' | 'success' }[];
  timestamp: string;
}
