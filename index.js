#!/usr/bin/env node

/* global require module process */

var path = require("path"),
    os = require("os"),
    stdin = process.stdin,
    spawn = require('child_process').spawn,
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

        mostRecentlyRunCommand,

        currentCommandInstance,

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
            bindKeyStrokesToNavigate();
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
                if (currentCommandBranch.commands[k].command) {
                    console.log(chalk.yellow(k + ": " + "[" + currentCommandBranch.commands[k]["title"] + "]"));
                } else {
                    console.log(chalk.yellow(k + ": " + currentCommandBranch.commands[k]["title"]));
                }
            });

            console.log(chalk.yellow("\nPress '/' to run a custom command"));

            if (mostRecentlyRunCommand) {
                console.log(chalk.yellow("Press [space] to re-run the last command"));
            }

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

        bindKeyStrokesToNavigate = function () {
            listenToKeyStrokes();
            stdin.on("data", keyStrokeHandlerForNavigation);
        },

        unbindKeyStrokesToNavigate = function () {
            stdin.removeListener("data", keyStrokeHandlerForNavigation);
        },

        bindKeyStrokesToQuitCurrentCommand = function () {
            listenToKeyStrokes();
            stdin.on("data", keyStrokeHandlerForQuittingCurrentCommand);
        },

        unbindKeyStrokesToQuitCurrentCommand = function () {
            stdin.removeListener("data", keyStrokeHandlerForQuittingCurrentCommand);
        },

        listenToKeyStrokes = function () {
            stdin.setRawMode(true);
            stdin.resume();
            stdin.setEncoding("utf8");
        },

        keyStrokeHandlerForNavigation = function (key) {
            unbindKeyStrokesToNavigate();

            if (key === "\u0003") {
                exit();
            } else if (key === "/") {
                showOptions();
                promptForCustomCommandAndExecute();
            } else if (key === " ") {
                if (mostRecentlyRunCommand) {
                    showOptions();
                    prepareToExecuteCommandObject(mostRecentlyRunCommand);
                } else {
                    showNextScreen();
                }
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
                    prepareToExecuteCommandObject(selectedCommand);
                } else {
                    currentState.push(key);
                    showNextScreen();
                }
            } else {
                showNextScreen();
            }
        },

        keyStrokeHandlerForQuittingCurrentCommand = function (key) {
            if (key === "\u0003") {
                abortCurrentShellCommand();
            }
        },

        getCommandForOption = function (option) {
            return !currentState.length
                ? configs.commands[option]
                : currentState.reduce(function (a, c) {
                    return a["commands"][c];
                }, configs).commands[option];
        },

        promptForCustomCommandAndExecute = function () {
            prompt.start();
            prompt.get([
                "custom-command",
                "directory"
            ], function(err, result) {
                prepareToExecuteCommandObject({
                    title: result["custom-command"] + " in " + result["directory"],
                    task: result["custom-command"],
                    directory: result["directory"]
                });
            });
        },

        prepareToExecuteCommandObject = function (command) {
            mostRecentlyRunCommand = command;

            console.log(chalk.inverse.green(getCenteredText("Command: " + command.title)) + "\n");

            if (!command.params) {
                executeShellCommand(command.task, command.directory);
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

        executeShellCommand = function (command, directory) {
            var commandWords = command.split(' '),
                commandName = commandWords[0],
                commandArguments = commandWords.slice(1);

            currentCommandInstance = spawn(commandName, commandArguments, {
                cwd: directory,
                stdio: [0, 1, 2],
                shell: true
            });

            currentCommandInstance.on('close', finishUpWithCurrentCommand);
            bindKeyStrokesToQuitCurrentCommand();
        },

        abortCurrentShellCommand = function () {
            currentCommandInstance.kill();
            currentCommandInstance = null;
        },

        finishUpWithCurrentCommand = function () {
            console.log("\n" + chalk.green(getSeparator("-")));

            currentCommandInstance = null;

            unbindKeyStrokesToQuitCurrentCommand();
            bindKeyStrokesToNavigate();
        },

        gatherParamsAndExecuteCommand = function (command) {
            prompt.start();
            prompt.get(command.params, function(err, result) {
                var taskToBeExecuted = [
                    command.task
                ].concat(command.params.map(function (p, i) {
                    return result[command.params[i]];
                })).join(" ");

                executeShellCommand(taskToBeExecuted, command.directory);
            });
        },

        bindEventForAbortingCurrentCommandOnWindows = function () {
            process.on("SIGINT", function () {
                if (currentCommandInstance) {
                    abortCurrentShellCommand();
                } else {
                    process.exit();
                }
            });
        },

        exit = function () {
            clear();
            process.exit();
        };

    bindEventForAbortingCurrentCommandOnWindows();

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
