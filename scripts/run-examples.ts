#!/usr/bin/env node
/**
 * Command-line script for running examples
 * Usage: npm run example
 */

// Using require instead of import to avoid ESM/CJS compatibility issues
require('ts-node').register();
const { runAllExamples } = require('../src/examples/nested-fields');

// Run all examples
runAllExamples();
