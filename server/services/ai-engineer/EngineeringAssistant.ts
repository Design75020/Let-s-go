
import { GoogleGenAI, Type } from "@google/genai";
import { logger } from "../infrastructure/Observability";
import fs from "fs/promises";
import path from "path";

export interface AnalysisReport {
  summary: string;
  securityRisks: string[];
  performanceSuggestions: string[];
  testSuggestions: string[];
}

export class EngineeringAssistant {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required for EngineeringAssistant");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  public async analyzeCodebase(directories: string[]): Promise<AnalysisReport> {
    logger.info({ directories }, "AI Engineer: Starting codebase analysis...");
    
    // 1. Gather file contents (limited to relevant files to avoid context overflow)
    const context = await this.gatherContext(directories);
    
    // 2. Query Gemini
    const prompt = `
      You are an elite Senior Staff Engineer and Security Architect.
      Analyze the following codebase context and provide a comprehensive report.
      
      CODEBASE CONTEXT:
      ${context}
      
      REPORT REQUIREMENTS:
      - Summary: High-level overview of the architecture and recent patterns.
      - Security Risks: Identify potential vulnerabilities (OWASP Top 10, logic leaks, RBAC bypasses).
      - Performance: Identify bottlenecks (N+1 queries, heavy loops, memory leaks).
      - Testing: Suggest critical test cases (Unit, Integration, E2E).
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              securityRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
              performanceSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              testSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["summary", "securityRisks", "performanceSuggestions", "testSuggestions"]
          }
        }
      });

      const report: AnalysisReport = JSON.parse(response.text || '{}');
      logger.info("AI Engineer: Analysis complete.");
      return report;
    } catch (error) {
      logger.error({ error }, "AI Engineer: Analysis failed");
      throw error;
    }
  }

  private async gatherContext(directories: string[]): Promise<string> {
    let context = "";
    for (const dir of directories) {
      const files = await this.scanDirectory(dir);
      for (const file of files) {
        if (this.isRelevantFile(file)) {
          const content = await fs.readFile(file, "utf-8");
          context += `\n--- FILE: ${file} ---\n${content}\n`;
        }
      }
    }
    return context.slice(0, 30000); // Limit context size for stability
  }

  private async scanDirectory(dir: string): Promise<string[]> {
    const results: string[] = [];
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const file of list) {
      const res = path.resolve(dir, file.name);
      if (file.isDirectory()) {
        if (file.name !== "node_modules" && file.name !== "dist" && !file.name.startsWith(".")) {
          results.push(...(await this.scanDirectory(res)));
        }
      } else {
        results.push(res);
      }
    }
    return results;
  }

  private isRelevantFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    const relevantExtensions = [".ts", ".tsx", ".js", ".jsx", ".json", ".sql", ".rules"];
    return relevantExtensions.includes(ext) && !filePath.includes(".test.") && !filePath.includes(".spec.");
  }

  public async suggestFix(errorLog: string, codeContext: string): Promise<string> {
    const prompt = `
      ERROR LOG:
      ${errorLog}

      RELEVANT CODE:
      ${codeContext}

      Suggest a minimal, stable fix for this error. Explain the root cause briefly.
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt
    });

    return response.text || "No suggestion provided.";
  }
}
