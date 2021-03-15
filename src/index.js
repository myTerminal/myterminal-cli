#!/usr/bin/env node

/* global require process */

const path = require('path'),
    os = require('os'),
    yargs = require('yargs').argv,
    cli = require('./cli');

const common = require('./common');

// Get the supplied arguments
const suppliedRelativeConfigPath = yargs.config;

// Determine the config file path to use
const absoluteConfigPath = suppliedRelativeConfigPath
    ? path.resolve(process.cwd(), suppliedRelativeConfigPath)
    : path.resolve(os.homedir(), 'myterminal-cli-configs.json');

// Create a config file if it does not exist
common.copyConfigFileIfNotPresent();

// Use configs and start the CLI
cli.start(require(absoluteConfigPath));
