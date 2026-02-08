const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    // Cloudflare-ийн санг mock файл руу чиглүүлэх
    "^@cloudflare/next-on-pages$": "<rootDir>/__mocks__/cloudflare.ts",
  },
};

module.exports = createJestConfig(customJestConfig);
