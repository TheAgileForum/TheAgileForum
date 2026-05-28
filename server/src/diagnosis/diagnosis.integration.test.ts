import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const hasDb = Boolean(process.env.DATABASE_URL);
const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe.skipIf(!hasDb)("diagnosis integration (IT-01 subset)", () => {
  const app = createApp();

  beforeAll(() => {
    execSync("npx tsx prisma/seed.ts", {
      cwd: serverRoot,
      stdio: "inherit",
      env: process.env,
    });
  });

  it("runs anonymous diagnosis happy path through result", async () => {
    const sessionRes = await request(app)
      .post("/api/v1/diagnosis/session")
      .send({ campaignId: "it-01" });
    expect(sessionRes.status).toBe(201);
    const sessionId = sessionRes.body.diagnosisSessionId as string;

    await request(app)
      .put(`/api/v1/diagnosis/session/${sessionId}/intent`)
      .send({
        targetRole: "Product Owner",
        timeline: "6 months",
        currentStatus: "Team lead",
        consentAck: true,
        policyVersion: "diagnosis-v1",
      })
      .expect(200);

    await request(app)
      .post(`/api/v1/diagnosis/session/${sessionId}/resume`)
      .send({
        fileName: "resume.pdf",
        mimeType: "application/pdf",
        sizeBytes: 2048,
      })
      .expect(201);

    const analyzeRes = await request(app)
      .post(`/api/v1/diagnosis/session/${sessionId}/analyze`)
      .send({ runReason: "integration" });
    expect(analyzeRes.status).toBe(202);
    const runId = analyzeRes.body.analysisRunId as string;

    let completed = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const statusRes = await request(app).get(`/api/v1/diagnosis/runs/${runId}`);
      if (statusRes.body.status === "completed") {
        completed = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    expect(completed).toBe(true);

    const resultRes = await request(app).get(`/api/v1/diagnosis/runs/${runId}/result`);
    expect(resultRes.status).toBe(200);
    expect(resultRes.body.readinessScore).toBeGreaterThan(0);
    expect(resultRes.body.primaryAction).toBeDefined();
    expect(resultRes.body.primaryAction.label).toBeTruthy();

    const journeyRes = await request(app).get(`/api/v1/journey-state/${sessionId}`);
    expect(journeyRes.status).toBe(200);
    expect(journeyRes.body.currentFlow).toBe("diagnosis");
  });

  it("IT-02: blocks analyze without consent", async () => {
    const sessionRes = await request(app).post("/api/v1/diagnosis/session").send({});
    const sessionId = sessionRes.body.diagnosisSessionId as string;

    await request(app)
      .post(`/api/v1/diagnosis/session/${sessionId}/resume`)
      .send({
        fileName: "resume.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024,
      })
      .expect(201);

    const analyzeRes = await request(app)
      .post(`/api/v1/diagnosis/session/${sessionId}/analyze`)
      .send({});
    expect(analyzeRes.status).toBe(400);
    expect(analyzeRes.body.error.code).toBe("CONSENT_REQUIRED");
  });

  it("IT-03: resumes journey at step 2 after intent saved", async () => {
    const sessionRes = await request(app).post("/api/v1/diagnosis/session").send({});
    const sessionId = sessionRes.body.diagnosisSessionId as string;

    await request(app)
      .put(`/api/v1/diagnosis/session/${sessionId}/intent`)
      .send({
        targetRole: "Scrum Master",
        timeline: "3 months",
        currentStatus: "Developer",
        consentAck: true,
        policyVersion: "diagnosis-v1",
      })
      .expect(200);

    const journeyRes = await request(app).get(`/api/v1/journey-state/${sessionId}`);
    expect(journeyRes.status).toBe(200);
    expect(journeyRes.body.currentStep).toBe("step_2");
    expect(journeyRes.body.resumePayload.targetRole).toBe("Scrum Master");
  });

  it("IT-04: rejects unsupported resume mime type", async () => {
    const sessionRes = await request(app).post("/api/v1/diagnosis/session").send({});
    const sessionId = sessionRes.body.diagnosisSessionId as string;

    const res = await request(app)
      .post(`/api/v1/diagnosis/session/${sessionId}/resume`)
      .send({
        fileName: "resume.exe",
        mimeType: "application/octet-stream",
        sizeBytes: 1024,
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("UNSUPPORTED_MIME");
    expect(res.body.error.retryable).toBe(true);
  });

  it("IT-09: returns exactly one primary action in result", async () => {
    const sessionRes = await request(app).post("/api/v1/diagnosis/session").send({});
    const sessionId = sessionRes.body.diagnosisSessionId as string;

    await request(app)
      .put(`/api/v1/diagnosis/session/${sessionId}/intent`)
      .send({
        targetRole: "Agile Coach",
        timeline: "6 months",
        currentStatus: "SM",
        consentAck: true,
        policyVersion: "diagnosis-v1",
      });

    await request(app)
      .post(`/api/v1/diagnosis/session/${sessionId}/resume`)
      .send({
        fileName: "resume.pdf",
        mimeType: "application/pdf",
        sizeBytes: 2048,
      });

    const analyzeRes = await request(app)
      .post(`/api/v1/diagnosis/session/${sessionId}/analyze`)
      .send({});
    const runId = analyzeRes.body.analysisRunId as string;

    for (let i = 0; i < 40; i += 1) {
      const status = await request(app).get(`/api/v1/diagnosis/runs/${runId}`);
      if (status.body.status === "completed") break;
      await new Promise((r) => setTimeout(r, 250));
    }

    const resultRes = await request(app).get(`/api/v1/diagnosis/runs/${runId}/result`);
    expect(resultRes.body.primaryAction).toBeDefined();
    expect(typeof resultRes.body.primaryAction.label).toBe("string");
    expect(resultRes.body.recommendation.primaryAction.label).toBe(
      resultRes.body.primaryAction.label,
    );
  });
});
