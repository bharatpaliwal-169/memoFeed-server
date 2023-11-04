const path = require('path');

module.exports = {
  collectCoverageFrom: [
    '../routes/**/*.[tj]s',
  ],
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js'],
  rootDir: '../',
  testEnvironment: 'node',
  testMatch: ['./**/?(*.)+(spec|test).[tj]s'],
  transform: {
    '^.+\\.[tj]s$': 'babel-jest',
  },
};
