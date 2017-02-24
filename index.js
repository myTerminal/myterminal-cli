#!/usr/bin/env node

/* global require module process */

var path = require("path"),
    os = require("os"),
    stdin = process.stdin,
    execSync = require("child_process").execSync,
    clear = require("clear"),
    prompt = require("prompt"),
    args = process.argv,
    suppliedRelativeConfigPath = args[2];

var myterminalCliCompanion = (function () {
    var configs,

        currentState = [],

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
            clear();
            console.log("** myterminal-cli **\n");
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

            console.log([configs.title].concat(breadCrumbs).join(" -> ") + "\n");
        },

        printCurrentOptions = function () {
            var currentCommandBranch = getCurrentCommandBranch();

            getCurrentCommandOptions().forEach(function (k) {
                console.log(k + ": " + currentCommandBranch.commands[k]["title"]);
            });

            if (currentCommandBranch !== configs) {
                console.log("\nq" + ": " + "Go back...\n");
            } else {
                console.log("\nq" + ": " + "Quit\n");
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
            console.log("Executing command:", command.title, "\n");
            console.log("---------------------------------------")

            if (!command.params) {
                executeShellCommand(command.task);
            } else {
                gatherParamsAndExecuteCommand(command);
            }
        },

        executeShellCommand = function (command) {
            try {
                execSync(command, {
                    stdio: [0, 1, 2]
                });
            } catch (e) {
                // Do not need to do anything particular
            }

            console.log("---------------------------------------\n")
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
        setConfigs: setConfigs,
        showNextScreen: showNextScreen
    };
})();

prompt.message = "Enter the value for ";
prompt.delimiter = "";

var absoluteConfigPath = suppliedRelativeConfigPath
    ? path.resolve(process.cwd(), suppliedRelativeConfigPath)
    : path.resolve(os.homedir(), "myterminal-configs.json");

myterminalCliCompanion.setConfigs(require(absoluteConfigPath));
myterminalCliCompanion.showNextScreen();
