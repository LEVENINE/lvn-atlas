import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import app from "../src/app.js";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    city: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../src/lib/prisma.js", () => ({ prisma: prismaMock }));

const portland = {
  id: "0b6f3f0e-3f1a-4f0f-9f4a-1f2b3c4d5e6f",
  name: "Portland",
  state: "Oregon",
  country: "United States",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("cities endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists cities", async () => {
    prismaMock.city.findMany.mockResolvedValue([portland]);

    const response = await request(app).get("/api/v1/cities");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe("Portland");
  });

  it("returns a single city", async () => {
    prismaMock.city.findUnique.mockResolvedValue(portland);

    const response = await request(app).get(`/api/v1/cities/${portland.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(portland.id);
  });

  it("returns 404 for a missing city", async () => {
    prismaMock.city.findUnique.mockResolvedValue(null);

    const response = await request(app).get(`/api/v1/cities/${portland.id}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("CITY_NOT_FOUND");
  });
});
