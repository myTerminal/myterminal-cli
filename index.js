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

        // State storage

        currentState = [],

        mostRecentlyRunCommand,

        lastRunShellCommand,

        currentCommandInstance,

        // User facing functions

        copyConfigFileIfNotPresent = function () {
            fse.copySync(path.resolve(__dirname, "../examples/configs.json"),
                         defaultConfigFilePath, {
                             overwrite: false
                         });
        },

        setConfigs = function (data) {
            configs = data;
        },

        promptForAction = function () {
            rePrintMenu();
            bindKeyStrokesToNavigate();
        },

        // Display related functions

        rePrintMenu = function () {
            clear();
            printMenuHeader();
            printMenuBreadCrumbs();
            printMenuInstructions();
            printMenuOptions();
        },

        printMenuHeader = function () {
            var centeredTitle = getCenteredText("myterminal-cli v" + version);

            console.log(chalk.inverse.cyan(getSeparator(" ")));
            console.log(chalk.inverse.cyan(centeredTitle));
            console.log(chalk.inverse.cyan(getSeparator(" ")) + "\n");
        },

        printMenuBreadCrumbs = function () {
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

        printMenuInstructions = function () {
            console.log("Press a marked key to perform the respective operation\n");
        },

        printMenuOptions = function () {
            var currentCommandBranch = getCurrentCommandBranch();

            getCurrentCommandOptions().forEach(function (k) {
                console.log(chalk.green("(" + k + ") ")
                            + currentCommandBranch.commands[k]["title"] +
                            (currentCommandBranch.commands[k].commands
                             ? "..."
                             : ""));
            });

            printEmptyLine();

            console.log(chalk.green("(/) ") + "Run a custom command");

            if (lastRunShellCommand) {
                console.log(chalk.green("(.) ") + "Re-run the last command");
            }

            if (mostRecentlyRunCommand) {
                console.log(chalk.green("[space] ") + "Select the last action");
            }

            if (currentCommandBranch !== configs) {
                console.log(chalk.red("\n(q) ") + "Go back..." + "\n");
            } else {
                console.log(chalk.red("\n(q) ") + "Quit" + "\n");
            }
        },

        printCommandLogHeader = function (commandTitle) {
            console.log(chalk.inverse.green(getCenteredText("Command: " + commandTitle)) + "\n");
        },

        printCommandAbortInstructions = function () {
            console.log("You can press ^-C to abort current task\n");
        },

        printEmptyLine = function () {
            console.log("");
        },

        // Display related helpers

        getCenteredText = function (text) {
            var fillerSize = getSeparator(" ").length - text.length;

            return getString(" ", Math.floor(fillerSize / 2))
                + text
                + getString(" ", Math.ceil(fillerSize / 2));
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

        // Command parsing functions

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

        getCommandForOption = function (option) {
            return !currentState.length
                ? configs.commands[option]
                : currentState.reduce(function (a, c) {
                    return a["commands"][c];
                }, configs).commands[option];
        },

        // Keystrokes binding functions

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

        bindEventForAbortingCurrentCommandOnWindows = function () {
            process.on("SIGINT", function () {
                if (currentCommandInstance) {
                    abortCurrentShellCommand();
                } else {
                    process.exit();
                }
            });
        },

        // Keystrokes handlers

        keyStrokeHandlerForNavigation = function (key) {
            unbindKeyStrokesToNavigate();

            if (key === "\u0003") {

                exit();

            } else if (key === "/") {

                rePrintMenu();
                printCommandAbortInstructions();
                promptForCustomCommandAndExecute();

            } else if (key === " ") {

                if (mostRecentlyRunCommand) {
                    rePrintMenu();
                    printCommandAbortInstructions();
                    prepareToExecuteCommandObject(mostRecentlyRunCommand);
                } else {
                    promptForAction();
                }

            } else if (key === ".") {

                if (lastRunShellCommand) {
                    rePrintMenu();
                    printCommandAbortInstructions();
                    printCommandLogHeader("(previously run command)");
                    executeShellCommand(lastRunShellCommand.command, lastRunShellCommand.directory);
                } else {
                    promptForAction();
                }

            } else if (key === "q") {

                if (!currentState.length) {
                    exit();
                }

                currentState.pop();
                promptForAction();

            } else if (getCurrentCommandOptions().indexOf(key) > -1) {

                var selectedCommand = getCommandForOption(key),
                    task = selectedCommand.task;

                if (task) {
                    rePrintMenu();
                    printCommandAbortInstructions();
                    prepareToExecuteCommandObject(selectedCommand);
                } else {
                    currentState.push(key);
                    promptForAction();
                }

            } else {

                promptForAction();

            }
        },

        keyStrokeHandlerForQuittingCurrentCommand = function (key) {
            if (key === "\u0003") {
                abortCurrentShellCommand();
            }
        },

        // Command execution

        gatherParamsAndExecuteCommand = function (command) {
            prompt.start();
            prompt.get(command.params, function(err, result) {
                try {
                    var taskToBeExecuted = [
                        command.task
                    ].concat(command.params.map(function (p, i) {
                        return result[command.params[i]];
                    })).join(" ");

                    executeShellCommand(taskToBeExecuted, command.directory);
                } catch (e) {
                    promptForAction();
                }
            });
        },

        prepareToExecuteCommandObject = function (command) {
            mostRecentlyRunCommand = command;

            printCommandLogHeader(command.title);

            if (!command.params) {
                executeShellCommand(command.task, command.directory);
            } else {
                gatherParamsAndExecuteCommand(command);
            }
        },

        promptForCustomCommandAndExecute = function () {
            prompt.start();
            prompt.get([
                "custom-command",
                "directory"
            ], function(err, result) {
                try {
                    var directory = result["directory"] || ".";

                    printEmptyLine();

                    prepareToExecuteCommandObject({
                        title: result["custom-command"] + " in " + directory,
                        task: result["custom-command"],
                        directory: directory
                    });
                } catch (e) {
                    promptForAction();
                }
            });
        },

        executeShellCommand = function (command, directory) {
            var commandWords = command.split(' '),
                commandName = commandWords[0],
                commandArguments = commandWords.slice(1);

            lastRunShellCommand = {
                command: command,
                directory: directory
            };

            currentCommandInstance = spawn(commandName, commandArguments, {
                cwd: directory,
                stdio: [0, 1, 2],
                shell: true
            });

            currentCommandInstance.on('close', finishUpWithCurrentCommand);
            bindKeyStrokesToQuitCurrentCommand();
        },

        // Command abortion and clean-up

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

        // Exit

        exit = function () {
            clear();
            process.exit();
        };

    bindEventForAbortingCurrentCommandOnWindows();

    return {
        copyConfigFileIfNotPresent: copyConfigFileIfNotPresent,
        setConfigs: setConfigs,
        promptForAction: promptForAction
    };
})();

prompt.message = "Enter the value for ";
prompt.delimiter = "";

var absoluteConfigPath = suppliedRelativeConfigPath
    ? path.resolve(process.cwd(), suppliedRelativeConfigPath)
    : defaultConfigFilePath;

myterminalCliCompanion.copyConfigFileIfNotPresent();
myterminalCliCompanion.setConfigs(require(absoluteConfigPath));
myterminalCliCompanion.promptForAction();
