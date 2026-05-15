
import { RepoEntity, ArchitectureViolation, TechnicalDebt, ImpactReport } from './types';
import { AstScanner, CoreGraphEngine } from './graphEngine';

export class RepoIntelligence {
  static async scan(): Promise<{ 
    graph: RepoEntity[]; 
    violations: ArchitectureViolation[];
    debt: TechnicalDebt[];
  }> {
    // Simulate deep code analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const baseEntities: RepoEntity[] = [
      { name: 'App.tsx', type: 'component', path: '/source/App.tsx', dependencies: ['ClientStore', 'MerchantPortal', 'AdminPortal', 'DriverApp', 'DevAgentDashboard', 'AuthContext'], complexity: 8 },
      { name: 'ClientStore.tsx', type: 'component', path: '/source/components/ClientStore.tsx', dependencies: ['firebase', 'motion', 'lucide-react'], complexity: 8 },
      { name: 'MerchantPortal.tsx', type: 'component', path: '/source/components/MerchantPortal.tsx', dependencies: ['firebase', 'aiService', 'AuthContext'], complexity: 9 },
      { name: 'AdminPortal.tsx', type: 'component', path: '/source/components/AdminPortal.tsx', dependencies: ['firebase', 'AuthContext'], complexity: 7 },
      { name: 'DriverApp.tsx', type: 'component', path: '/source/components/DriverApp.tsx', dependencies: ['firebase', 'AuthContext', 'motion'], complexity: 7 },
      { name: 'DevAgentDashboard.tsx', type: 'component', path: '/source/components/DevAgentDashboard.tsx', dependencies: ['repoIntelligence', 'graphEngine', 'guardrailEngine', 'motion'], complexity: 9 },
      { name: 'firebase.ts', type: 'service', path: '/source/lib/firebase.ts', dependencies: [], complexity: 3 },
      { name: 'AuthContext.tsx', type: 'context', path: '/source/context/AuthContext.tsx', dependencies: ['firebase'], complexity: 5 },
      { name: 'aiService.ts', type: 'service', path: '/source/services/aiService.ts', dependencies: ['genai'], complexity: 4 },
    ];

    // Enrichment via AST Scanning Simulation
    const graph = await Promise.all(baseEntities.map(async (e) => ({
      ...e,
      node: await AstScanner.parseFile(e.path)
    })));

    const violations: ArchitectureViolation[] = [
      { id: 'V1', severity: 'medium', file: 'MerchantPortal.tsx', message: 'Direct use of setDoc instead of using a service layer abstraction.' },
      { id: 'V2', severity: 'low', file: 'ClientStore.tsx', message: 'High cyclomatic complexity in render function (split sub-components).' },
    ];

    const debt: TechnicalDebt[] = [
      { id: 'D1', category: 'performance', location: 'ClientStore.tsx', description: 'Inefficient useEffect dependency array causing unnecessary re-renders in cart logic.', score: 45 },
      { id: 'D2', category: 'duplication', location: 'AdminPortal.tsx / MerchantPortal.tsx', description: 'Duplicated table rendering logic detected. Suggest creating a shared DataGrid component.', score: 60 },
      { id: 'D3', category: 'security', location: 'auth.ts', description: 'JWT expiration handled on client-side; move validation to middleware layer.', score: 30 }
    ];

    return { graph, violations, debt };
  }

  static performImpactAnalysis(targetFile: string, graph: RepoEntity[]): ImpactReport {
    return CoreGraphEngine.analyzeImpact(targetFile, graph);
  }

  static generateDependencyGraph(entities: RepoEntity[]) {
    // Logic to build a visualizable graph structure
    return entities.map(e => ({
      id: e.name,
      links: e.dependencies
    }));
  }
}
