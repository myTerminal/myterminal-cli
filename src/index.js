#!/usr/bin/env node

/* global require process */

const path = require('path'),
    os = require('os'),
    yargs = require('yargs').argv,
    cliCompanion = require('./cli-modern');

const common = require('./common');

// Get the supplied arguments
const suppliedRelativeConfigPath = yargs.config;

// Determine the config file path to use
const absoluteConfigPath = suppliedRelativeConfigPath
    ? path.resolve(process.cwd(), suppliedRelativeConfigPath)
    : path.resolve(os.homedir(), 'myterminal-configs.json');

// Create a config file if it does not exist
common.copyConfigFileIfNotPresent();

// Use configs and start the CLI
cliCompanion.setConfigs(require(absoluteConfigPath));
cliCompanion.init();
