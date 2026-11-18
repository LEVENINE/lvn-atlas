import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import app from "../src/app.js";
import { signAccessToken } from "../src/utils/token.js";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    userProfile: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("../src/lib/prisma.js", () => ({ prisma: prismaMock }));

const currentUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "owner@example.com",
};

const otherUser = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "stranger@example.com",
};

const currentProfile = {
  id: "33333333-3333-4333-8333-333333333333",
  userId: currentUser.id,
  firstName: "Owner",
  lastName: "Example",
};

const otherProfile = {
  id: "44444444-4444-4444-8444-444444444444",
  userId: otherUser.id,
  firstName: "Stranger",
  lastName: "Example",
};

const token = signAccessToken({
  sub: currentUser.id,
  email: currentUser.email,
});

function authorized(method: "get" | "patch" | "delete" | "post", url: string) {
  return request(app)[method](url).set("Authorization", `Bearer ${token}`);
}

describe("per-user authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("users", () => {
    it("returns the authenticated user's own record", async () => {
      prismaMock.user.findUnique.mockResolvedValue(currentUser);

      const response = await authorized(
        "get",
        `/api/v1/users/${currentUser.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(currentUser.id);
    });

    it("rejects reading another user's record", async () => {
      const response = await authorized("get", `/api/v1/users/${otherUser.id}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it("rejects updating another user's record", async () => {
      const response = await authorized(
        "patch",
        `/api/v1/users/${otherUser.id}`,
      ).send({ email: "hijacked@example.com" });

      expect(response.status).toBe(403);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it("allows updating the authenticated user's own record", async () => {
      prismaMock.user.findUnique.mockResolvedValue(currentUser);
      prismaMock.user.update.mockResolvedValue({
        ...currentUser,
        email: "renamed@example.com",
      });

      const response = await authorized(
        "patch",
        `/api/v1/users/${currentUser.id}`,
      ).send({ email: "renamed@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.email).toBe("renamed@example.com");
    });

    it("does not let a user delete another account", async () => {
      const response = await authorized(
        "delete",
        `/api/v1/users/${otherUser.id}`,
      );

      expect(response.status).toBe(403);
      expect(prismaMock.user.delete).not.toHaveBeenCalled();
    });

    it("allows deleting the authenticated user's own record", async () => {
      prismaMock.user.findUnique.mockResolvedValue(currentUser);
      prismaMock.user.delete.mockResolvedValue(currentUser);

      const response = await authorized(
        "delete",
        `/api/v1/users/${currentUser.id}`,
      );

      expect(response.status).toBe(204);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: currentUser.id },
      });
    });

    it("requires authentication", async () => {
      const response = await request(app).get(
        `/api/v1/users/${currentUser.id}`,
      );

      expect(response.status).toBe(401);
    });
  });

  describe("profiles", () => {
    it("returns the authenticated user's own profile", async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue(currentProfile);

      const response = await authorized(
        "get",
        `/api/v1/profiles/${currentProfile.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(currentUser.id);
    });

    it("rejects reading another user's profile", async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue(otherProfile);

      const response = await authorized(
        "get",
        `/api/v1/profiles/${otherProfile.id}`,
      );

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
    });

    it("rejects reading another user's profile through the user route", async () => {
      const response = await authorized(
        "get",
        `/api/v1/users/${otherUser.id}/profile`,
      );

      expect(response.status).toBe(403);
      expect(prismaMock.userProfile.findUnique).not.toHaveBeenCalled();
    });

    it("rejects updating another user's profile", async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue(otherProfile);

      const response = await authorized(
        "patch",
        `/api/v1/profiles/${otherProfile.id}`,
      ).send({ firstName: "Hijacked" });

      expect(response.status).toBe(403);
      expect(prismaMock.userProfile.update).not.toHaveBeenCalled();
    });

    it("allows updating the authenticated user's own profile", async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue(currentProfile);
      prismaMock.userProfile.update.mockResolvedValue({
        ...currentProfile,
        firstName: "Updated",
      });

      const response = await authorized(
        "patch",
        `/api/v1/profiles/${currentProfile.id}`,
      ).send({ firstName: "Updated" });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe("Updated");
    });

    it("does not let a user delete another user's profile", async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue(otherProfile);

      const response = await authorized(
        "delete",
        `/api/v1/profiles/${otherProfile.id}`,
      );

      expect(response.status).toBe(403);
      expect(prismaMock.userProfile.delete).not.toHaveBeenCalled();
    });

    it("allows deleting the authenticated user's own profile", async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue(currentProfile);
      prismaMock.userProfile.delete.mockResolvedValue(currentProfile);

      const response = await authorized(
        "delete",
        `/api/v1/profiles/${currentProfile.id}`,
      );

      expect(response.status).toBe(204);
      expect(prismaMock.userProfile.delete).toHaveBeenCalledWith({
        where: { id: currentProfile.id },
      });
    });

    it("returns 404 for an unknown profile", async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue(null);

      const response = await authorized(
        "get",
        `/api/v1/profiles/${otherProfile.id}`,
      );

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("PROFILE_NOT_FOUND");
    });
  });

  describe("retired endpoints", () => {
    it.each([
      ["get", "/api/v1/users"],
      ["post", "/api/v1/users"],
      ["get", "/api/v1/profiles"],
      ["post", "/api/v1/profiles"],
    ] as const)("no longer serves %s %s", async (method, url) => {
      const response = await authorized(method, url);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("ROUTE_NOT_FOUND");
    });
  });
});
