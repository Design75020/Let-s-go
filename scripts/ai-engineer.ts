
import { EngineeringAssistant } from "../server/services/ai-engineer/EngineeringAssistant";
import { logger } from "../server/services/infrastructure/Observability";

async function main() {
  const args = process.argv.slice(2);
  const assistant = new EngineeringAssistant();

  if (args.includes("--analyze")) {
    const report = await assistant.analyzeCodebase(["./server", "./src"]);
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (args.includes("--scan")) {
     // Security scan specialized prompt
     const report = await assistant.analyzeCodebase(["./server/middleware", "./server/services/infrastructure"]);
     console.log("SECURE SCAN RESULTS:");
     console.log(report.securityRisks.join("\n"));
     process.exit(0);
  }

  console.log("Usage: tsx scripts/ai-engineer.ts [--analyze | --scan]");
  process.exit(1);
}

main().catch(err => {
  console.error("AI Engineering Assistant failed:", err);
  process.exit(1);
});
