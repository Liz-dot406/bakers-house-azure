import type { Config } from "jest"

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,

    // Ignore K6 performance tests
    testPathIgnorePatterns: [
        "/node_modules/",
        "/__tests__/performanceTesting/"
    ],

    // Coverage Configuration
    collectCoverage: false,
    coverageDirectory: "coverage",
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts'
    ]
}

export default config;
