import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";

describe("CORS", () => {
  it("allows the configured web origin", async () => {
    const response = await request(app)
      .get("/api/v1/does-not-exist")
      .set("Origin", "http://localhost:5173");

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });

  it("does not allow an unconfigured origin", async () => {
    const response = await request(app)
      .get("/api/v1/does-not-exist")
      .set("Origin", "https://example.invalid");

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("answers preflight requests for authenticated routes", async () => {
    const response = await request(app)
      .options("/api/v1/blueprints")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "authorization,content-type");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-headers"]).toContain(
      "Authorization",
    );
  });
});
