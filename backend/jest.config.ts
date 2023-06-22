import type { Config } from 'jest'

const config: Config = {
  verbose: true,
  testMatch: ['**/?(*.)+(spec|test).ts'],
  testEnvironment: 'node'
}

export default config
