import type { Config } from "jest"

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,

    testPathIgnorePatterns: [
        "/node_modules/",
        "/__tests__/performanceTesting/"
    ],

   
    collectCoverage: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts'
    ]
}

export default config;
