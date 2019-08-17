#!/usr/bin/env node

/* global require process */

const path = require('path'),
    os = require('os'),
    yargs = require('yargs').argv;

const suppliedRelativeConfigPath = yargs.config;

const defaultConfigFilePath = path.resolve(os.homedir(), 'myterminal-configs.json');

const absoluteConfigPath = suppliedRelativeConfigPath
    ? path.resolve(process.cwd(), suppliedRelativeConfigPath)
    : defaultConfigFilePath;

const common = require('./common');

const cliCompanion = !yargs.modern && (yargs.legacy || os.platform() === 'win32')
    ? require('./cli-legacy')
    : require('./cli-modern');

common.copyConfigFileIfNotPresent();
cliCompanion.setConfigs(require(absoluteConfigPath));
cliCompanion.init();
