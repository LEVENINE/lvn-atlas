import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import app from "../src/app.js";
import { Prisma } from "../src/generated/prisma/client.js";
import { signAccessToken } from "../src/utils/token.js";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    migrationBlueprint: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("../src/lib/prisma.js", () => ({ prisma: prismaMock }));

const currentUser = {
  id: "55555555-5555-4555-8555-555555555555",
  email: "planner@example.com",
};

const token = signAccessToken({
  sub: currentUser.id,
  email: currentUser.email,
});

const mumbai = {
  id: "66666666-6666-4666-8666-666666666666",
  name: "Mumbai",
  state: "Maharashtra",
  country: "India",
};

const pune = {
  id: "77777777-7777-4777-8777-777777777777",
  name: "Pune",
  state: "Maharashtra",
  country: "India",
};

const blueprintId = "88888888-8888-4888-8888-888888888888";

const blueprint = {
  id: blueprintId,
  userId: currentUser.id,
  originCityId: mumbai.id,
  destinationCityId: pune.id,
  sourceJourneyId: null,
  expectedMonthlyIncome: new Prisma.Decimal("250000.00"),
  plannedRelocationDate: null,
  relocatingHouseholdSize: 2,
  createdAt: new Date("2026-02-01T00:00:00.000Z"),
  updatedAt: new Date("2026-02-01T00:00:00.000Z"),
  originCity: mumbai,
  destinationCity: pune,
};

function authorized(method: "get" | "post" | "patch" | "delete", url: string) {
  return request(app)[method](url).set("Authorization", `Bearer ${token}`);
}

const validPayload = {
  originCityId: mumbai.id,
  destinationCityId: pune.id,
  expectedMonthlyIncome: 250000,
  relocatingHouseholdSize: 2,
};

describe("blueprints endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires authentication", async () => {
    const response = await request(app).get("/api/v1/blueprints");

    expect(response.status).toBe(401);
  });

  it("lists only the authenticated user's blueprints", async () => {
    prismaMock.migrationBlueprint.findMany.mockResolvedValue([blueprint]);

    const response = await authorized("get", "/api/v1/blueprints");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].expectedMonthlyIncome).toBe("250000.00");
    expect(prismaMock.migrationBlueprint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: currentUser.id } }),
    );
  });

  it("creates a blueprint owned by the authenticated user", async () => {
    prismaMock.migrationBlueprint.create.mockResolvedValue(blueprint);

    const response = await authorized("post", "/api/v1/blueprints").send(
      validPayload,
    );

    expect(response.status).toBe(201);
    expect(response.body.id).toBe(blueprintId);
    expect(prismaMock.migrationBlueprint.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: currentUser.id }),
      }),
    );
  });

  it("rejects a blueprint that starts and ends in the same city", async () => {
    const response = await authorized("post", "/api/v1/blueprints").send({
      ...validPayload,
      destinationCityId: mumbai.id,
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(prismaMock.migrationBlueprint.create).not.toHaveBeenCalled();
  });

  it("returns 404 when a referenced city does not exist", async () => {
    prismaMock.migrationBlueprint.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        "Foreign key constraint failed",
        {
          code: "P2003",
          clientVersion: "test",
        },
      ),
    );

    const response = await authorized("post", "/api/v1/blueprints").send(
      validPayload,
    );

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("CITY_NOT_FOUND");
  });

  it("returns 404 for a blueprint the user does not own", async () => {
    prismaMock.migrationBlueprint.findFirst.mockResolvedValue(null);

    const response = await authorized(
      "get",
      `/api/v1/blueprints/${blueprintId}`,
    );

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("BLUEPRINT_NOT_FOUND");
    expect(prismaMock.migrationBlueprint.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: blueprintId, userId: currentUser.id },
      }),
    );
  });

  it("returns a blueprint the user owns", async () => {
    prismaMock.migrationBlueprint.findFirst.mockResolvedValue(blueprint);

    const response = await authorized(
      "get",
      `/api/v1/blueprints/${blueprintId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.destinationCity.name).toBe("Pune");
  });

  it("updates a blueprint the user owns", async () => {
    prismaMock.migrationBlueprint.findFirst.mockResolvedValue(blueprint);
    prismaMock.migrationBlueprint.update.mockResolvedValue({
      ...blueprint,
      expectedMonthlyIncome: new Prisma.Decimal("300000.00"),
    });

    const response = await authorized(
      "patch",
      `/api/v1/blueprints/${blueprintId}`,
    ).send({ expectedMonthlyIncome: 300000 });

    expect(response.status).toBe(200);
    expect(response.body.expectedMonthlyIncome).toBe("300000.00");
  });

  it("rejects an update that makes both cities the same", async () => {
    prismaMock.migrationBlueprint.findFirst.mockResolvedValue(blueprint);

    const response = await authorized(
      "patch",
      `/api/v1/blueprints/${blueprintId}`,
    ).send({ destinationCityId: mumbai.id });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(prismaMock.migrationBlueprint.update).not.toHaveBeenCalled();
  });

  it("deletes a blueprint the user owns", async () => {
    prismaMock.migrationBlueprint.findFirst.mockResolvedValue(blueprint);
    prismaMock.migrationBlueprint.delete.mockResolvedValue(blueprint);

    const response = await authorized(
      "delete",
      `/api/v1/blueprints/${blueprintId}`,
    );

    expect(response.status).toBe(204);
    expect(prismaMock.migrationBlueprint.delete).toHaveBeenCalledWith({
      where: { id: blueprintId },
    });
  });

  it("does not delete a blueprint the user does not own", async () => {
    prismaMock.migrationBlueprint.findFirst.mockResolvedValue(null);

    const response = await authorized(
      "delete",
      `/api/v1/blueprints/${blueprintId}`,
    );

    expect(response.status).toBe(404);
    expect(prismaMock.migrationBlueprint.delete).not.toHaveBeenCalled();
  });
});
