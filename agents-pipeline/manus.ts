/**
 * /agents-pipeline/manus.ts
 *
 * Manus (Architect & Planner) Agent module.
 * Formulates structured high-performance MVP architecture designs based on user requirements.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { ManusArchitecture } from "./types";
import { getAI } from "../server/ai";

export class ManusAgent {
  /**
   * Run the architecture planning phase.
   */
  public static async designSystem(productPrompt: string): Promise<ManusArchitecture> {
    const ai: GoogleGenAI | null = getAI();
    
    // In case AI is not configured locally, fallback to a robust structural layout
    if (!ai) {
      console.warn("ManusAgent: GEMINI_API_KEY is not defined. Falling back to default architecture design.");
      return this.getDefaultArchitecture(productPrompt);
    }

    const systemInstruction = `
      You are Manus, the Lead Principal Architect agent for LETSGOFOOD V15, designing high-scale, production-ready Distributed Systems.
      Your responsibility is to take a product prompt and output an elegant, minimalist, stateless MVP system architecture.
      
      CRITICAL SYSTEM REQUIREMENTS:
      - Clean single-responsibility micro-services (api, orders, dispatch, payments, websocket).
      - Core backend: Node.js, Express, TypeScript.
      - Core persistence: PostgreSQL (SSoT) + Redis (caches & distributed locking).
      - Target cloud platform: Google Cloud Run (stateless containers).
      - Must contain an active /health check endpoint.
      - No microservice overengineering or unnecessary networking layers.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Design a scalable production-grade system architecture for the following product prompt: "${productPrompt}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              architectureStyle: { 
                type: Type.STRING,
                description: "Name or description of the architectural design pattern (e.g. event-driven architectural state-less flow)"
              },
              services: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the service (e.g., api, orders, dispatch, payments)" },
                    description: { type: Type.STRING, description: "Focus of this service" },
                    endpoints: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          method: { type: Type.STRING, description: "HTTP verb" },
                          path: { type: Type.STRING, description: "Relative express path" },
                          description: { type: Type.STRING, description: "Functional role" }
                        },
                        required: ["method", "path", "description"]
                      }
                    }
                  },
                  required: ["name", "description", "endpoints"]
                }
              },
              dataPlane: {
                type: Type.OBJECT,
                properties: {
                  primaryDatabase: { type: Type.STRING },
                  cache: { type: Type.STRING },
                  messageBroker: { type: Type.STRING }
                },
                required: ["primaryDatabase", "cache", "messageBroker"]
              },
              deploymentTarget: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING },
                  healthCheckPath: { type: Type.STRING }
                },
                required: ["platform", "healthCheckPath"]
              },
              constraints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["architectureStyle", "services", "dataPlane", "deploymentTarget", "constraints"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Empty model response received from Manus");
      }

      const parsed: ManusArchitecture = JSON.parse(response.text);
      return parsed;

    } catch (error: any) {
      console.error("ManusAgent error during LLM generation:", error);
      return this.getDefaultArchitecture(productPrompt);
    }
  }

  private static getDefaultArchitecture(prompt: string): ManusArchitecture {
    return {
      architectureStyle: "Stateless Event-Driven Microservices Layer",
      services: [
        {
          name: "api",
          description: "Gateway handling user requests and streaming notifications.",
          endpoints: [
            { method: "GET", path: "/health", description: "Standard liveness and readiness checker" },
            { method: "POST", path: "/api/orders", description: "Submit state transition requests" }
          ]
        },
        {
          name: "dispatch",
          description: "Matcher pairing incoming deliveries to closest logistics agents.",
          endpoints: [
            { method: "GET", path: "/health", description: "Liveness and availability dashboard" },
            { method: "POST", path: "/api/dispatch/claim", description: "Claim and assign orders" }
          ]
        }
      ],
      dataPlane: {
        primaryDatabase: "PostgreSQL (Prisma client wrapper)",
        cache: "Redis clusters (100k+ IOPS)",
        messageBroker: "In-memory Event Bus / Kafka"
      },
      deploymentTarget: {
        platform: "Google Cloud Run Stateless Nodes",
        healthCheckPath: "/health"
      },
      constraints: [
        "Services must maintain zero-state logic",
        "Every transaction must be mathematically idempotent",
        "Continuous SLO threshold metrics tracking"
      ]
    };
  }
}
