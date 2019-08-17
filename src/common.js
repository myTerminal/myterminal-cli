/* global require module __dirname */

const path = require('path'),
    os = require('os'),
    fse = require('fs-extra'),
    defaultConfigFilePath = path.resolve(os.homedir(), 'myterminal-configs.json');

module.exports.copyConfigFileIfNotPresent = () => {
    fse.copySync(
        path.resolve(__dirname, '../examples/configs.json'),
        defaultConfigFilePath, {
            overwrite: false
        });
};
