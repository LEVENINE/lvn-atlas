import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";

describe("health endpoints", () => {
  it("returns the API health payload", async () => {
    const response = await request(app).get("/api/v1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("LVN Atlas API is running");
    expect(response.body.environment).toBe("test");
  });

  it("returns a 404 payload for unknown routes", async () => {
    const response = await request(app).get("/api/v1/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});
