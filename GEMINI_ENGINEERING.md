
# LetsGoFood: Gemini AI-Native Engineering System

This monorepo is now enhanced with a Gemini-powered AI engineering assistant.

## Available Tools

### 1. Gemini CLI (@google/gemini-cli)
The official Gemini CLI is installed and available via `npx gemini`.
- **Verify Version:** `npx gemini --version`
- **Interactive Mode:** `npx gemini` (Requires `GEMINI_API_KEY`)
- **Non-Interactive Prompt:** `npx gemini -p "Analyze recent changes in /server"`

### 2. Custom AI Engineer Script
A specialized engineering assistant optimized for this codebase.
- **Full Architecture Analysis:** `npm run ai:analyze`
- **Security Vulnerability Scan:** `npm run ai:scan`
- **Ad-hoc Engineer Prompt:** `npm run ai:engineer -- [prompt]`

## CI/CD Integration

The GitHub Actions pipeline (`main.yml`) now includes an **AI Security Scan** step.
This step scans your code for architectural logic leaks and security risks on every Pull Request.

## Key Capabilities

- **Codebase Analysis:** Summarizes complex interactions across the event-driven system.
- **Security Risk Detection:** Scans for RBAC bypasses, update-gaps, and identity spoofing patterns.
- **Performance Validation:** Suggests optimizations for Redis Streams and Prisma queries.
- **Debugging Assistance:** Can be used to pipe logs for root-cause analysis and fix suggestions.

## Configuration

Ensure `GEMINI_API_KEY` is set in your environment:
- **Local:** Add to `.env` file.
- **GitHub:** Add as a Repository Secret named `GEMINI_API_KEY`.

---
*Powered by Gemini 3.1 Pro & @google/gemini-cli*
