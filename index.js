#!/usr/bin/env node

/* global require module process */

var path = require("path"),
    os = require("os"),
    stdin = process.stdin,
    execSync = require("child_process").execSync,
    version = require("../package.json").version,
    prompt = require("prompt"),
    clear = require("clear"),
    chalk = require("chalk"),
    fse = require("fs-extra"),
    args = process.argv,
    suppliedRelativeConfigPath = args[2],
    defaultConfigFilePath = path.resolve(os.homedir(), "myterminal-configs.json");

var myterminalCliCompanion = (function () {
    var configs,

        currentState = [],

        copyConfigFileIfNotPresent = function () {
            fse.copySync(path.resolve(__dirname, "../examples/configs.json"),
                         defaultConfigFilePath, {
                             overwrite: false
                         });
        },

        setConfigs = function (data) {
            configs = data;
        },

        showNextScreen = function () {
            showOptions();
            bindKeyStrokes();
        },

        showOptions = function () {
            printHeader();
            printBreadCrumbs();
            printCurrentOptions();
        },

        printHeader = function () {
            var centeredTitle = getCenteredText("myterminal-cli v" + version);

            clear();
            console.log(chalk.inverse.cyan(getSeparator(" ")));
            console.log(chalk.inverse.cyan(centeredTitle));
            console.log(chalk.inverse.cyan(getSeparator(" ")) + "\n");
        },

        getCenteredText = function (text) {
            var fillerSize = getSeparator(" ").length - text.length;

            return getString(" ", Math.floor(fillerSize / 2))
                + text
                + getString(" ", Math.ceil(fillerSize / 2));
        },

        printBreadCrumbs = function () {
            var breadCrumbs = currentState.map(function (s, i) {
                return currentState.slice(0, i + 1);
            }).map(function (s, i) {
                return s.reduce(function (a, c) {
                    return a.commands[c];
                }, configs);
            }).map(function (s) {
                return s.title;
            });

            console.log(chalk.cyan([configs.title].concat(breadCrumbs).join(" -> ") + "\n"));
        },

        printCurrentOptions = function () {
            var currentCommandBranch = getCurrentCommandBranch();

            getCurrentCommandOptions().forEach(function (k) {
                console.log(chalk.yellow(k + ": " + currentCommandBranch.commands[k]["title"]));
            });

            if (currentCommandBranch !== configs) {
                console.log(chalk.red("\nq" + ": " + "Go back...") + "\n");
            } else {
                console.log(chalk.red("\nq" + ": " + "Quit") + "\n");
            }
        },

        getCurrentCommandBranch = function () {
            return !currentState.length
                ? configs
                : currentState.reduce(function (a, c) {
                    return a["commands"][c];
                }, configs);
        },

        getCurrentCommandOptions = function () {
            return Object.keys(getCurrentCommandBranch().commands);
        },

        bindKeyStrokes = function () {
            listenToKeyStrokes();
            stdin.on("data", keyStrokeHandler);
        },

        unbindKeyStrokes = function () {
            stdin.removeListener("data", keyStrokeHandler);
        },

        listenToKeyStrokes = function () {
            stdin.setRawMode(true);
            stdin.resume();
            stdin.setEncoding("utf8");
        },

        keyStrokeHandler = function (key) {
            unbindKeyStrokes();

            if (key === "\u0003") {
                exit();
            } else if (key === "q") {
                if (!currentState.length) {
                    exit();
                }

                currentState.pop();
                showNextScreen();
            } else if (getCurrentCommandOptions().indexOf(key) > -1) {
                var selectedCommand = getCommandForOption(key),
                    task = selectedCommand.task;

                if (task) {
                    showOptions();
                    executeCommand(selectedCommand);
                } else {
                    currentState.push(key);
                    showNextScreen();
                }
            } else {
                showNextScreen();
            }
        },

        getCommandForOption = function (option) {
            return !currentState.length
                ? configs.commands[option]
                : currentState.reduce(function (a, c) {
                    return a["commands"][c];
                }, configs).commands[option];
        },

        executeCommand = function (command) {
            console.log(chalk.inverse.green(getCenteredText("Command: " + command.title)) + "\n");

            if (!command.params) {
                executeShellCommand(command.task);
            } else {
                gatherParamsAndExecuteCommand(command);
            }
        },

        getSeparator = function (char) {
            return new Array(process.stdout.columns - 1)
                .join(",")
                .split(",")
                .map(function () {
                    return char;
                })
                .join("");
        },

        getString = function (char, size) {
            return new Array(size)
                .join(",")
                .split(",")
                .map(function () {
                    return char;
                })
                .join("");
        },

        executeShellCommand = function (command) {
            try {
                execSync(command, {
                    stdio: [0, 1, 2]
                });
            } catch (e) {
                // Do not need to do anything particular
            }

            console.log("\n" + chalk.green(getSeparator("-")));
            bindKeyStrokes();
        },

        gatherParamsAndExecuteCommand = function (command) {
            prompt.start();
            prompt.get(command.params, function(err, result) {
                var taskToBeExecuted = [
                    command.task
                ].concat(command.params.map(function (p, i) {
                    return result[command.params[i]];
                })).join(" ");

                executeShellCommand(taskToBeExecuted);
            });
        },

        exit = function () {
            clear();
            process.exit();
        };

    return {
        copyConfigFileIfNotPresent: copyConfigFileIfNotPresent,
        setConfigs: setConfigs,
        showNextScreen: showNextScreen
    };
})();

prompt.message = "Enter the value for ";
prompt.delimiter = "";

var absoluteConfigPath = suppliedRelativeConfigPath
    ? path.resolve(process.cwd(), suppliedRelativeConfigPath)
    : defaultConfigFilePath;

myterminalCliCompanion.copyConfigFileIfNotPresent();
myterminalCliCompanion.setConfigs(require(absoluteConfigPath));
myterminalCliCompanion.showNextScreen();
