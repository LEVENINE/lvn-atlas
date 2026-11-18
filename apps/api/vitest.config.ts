import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Password hashing uses bcrypt cost 12, which is intentionally slow
    testTimeout: 30_000,
    env: {
      NODE_ENV: "test",
      LOG_LEVEL: "silent",
      DATABASE_URL: "postgresql://lvn:lvn@localhost:5432/lvn_atlas_test",
      JWT_SECRET: "test-jwt-secret-value-that-is-at-least-32-characters",
    },
  },
});
