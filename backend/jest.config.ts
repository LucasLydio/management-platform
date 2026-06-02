import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/api/http/server.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  preset: "ts-jest",
  rootDir: ".",
  setupFilesAfterEnv: [],
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/tests/**/*.test.ts"],
};

export default config;
