#!/usr/bin/env node

/* global require process */

var path = require('path'),
    os = require('os'),
    args = process.argv,
    suppliedRelativeConfigPath = args[2],
    defaultConfigFilePath = path.resolve(os.homedir(), 'myterminal-configs.json');

var absoluteConfigPath = suppliedRelativeConfigPath
    ? path.resolve(process.cwd(), suppliedRelativeConfigPath)
    : defaultConfigFilePath,
    cliCompanion = os.platform() === 'win32'
    ? require('./cli-legacy')
    : require('./cli-modern');

cliCompanion.copyConfigFileIfNotPresent();
cliCompanion.setConfigs(require(absoluteConfigPath));
cliCompanion.promptForAction();
