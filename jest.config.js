const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "node", // Browser биш учир 'node' байвал илүү тохиромжтой
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // Setup файл нэмэх
};

module.exports = createJestConfig(customJestConfig);
