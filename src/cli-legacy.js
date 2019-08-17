/* global require module process */

const { spawn } = require('child_process'),
    { stdin } = process,
    prompt = require('prompt'),
    chalk = require('chalk'),
    clear = require('clear'),
    { version } = require('../package.json');

module.exports = (() => {
    var configs,

        // State storage

        currentState = [],

        mostRecentlyRunCommand,

        lastRunShellCommand,

        currentCommandInstance,

        // User facing functions

        setConfigs = data => {
            configs = data;
        },

        init = () => {
            bindEventForAbortingCurrentCommandOnWindows();
            promptForAction();
        },

        promptForAction = () => {
            rePrintMenu();
            bindKeyStrokesToNavigate();
        },

        // Display related functions

        rePrintMenu = () => {
            clear();
            printMenuHeader();
            printMenuBreadCrumbs();
            printMenuInstructions();
            printMenuOptions();
        },

        printMenuHeader = () => {
            const centeredTitle = getCenteredText(`myterminal-cli v${version}`);

            console.log(chalk.inverse.cyan(getSeparator(' ')));
            console.log(chalk.inverse.cyan(centeredTitle));
            console.log(`${chalk.inverse.cyan(getSeparator(' '))}\n`);
        },

        printMenuBreadCrumbs = () => {
            const breadCrumbs = currentState
                .map((s, i) => currentState.slice(0, i + 1))
                .map((s) => s.reduce((a, c) => a.commands[c], configs))
                .map(s => s.title);

            console.log(chalk.cyan(`${[configs.title].concat(breadCrumbs).join(' -> ')}'\n'`));
        },

        printMenuInstructions = () => {
            console.log('Press a marked key to perform the respective operation\n');
        },

        printMenuOptions = () => {
            const currentCommandBranch = getCurrentCommandBranch();

            getCurrentCommandOptions().forEach(
                k => {
                    console.log(
                        chalk.green(`(${k}) ${currentCommandBranch.commands[k].title}`)
                            + (currentCommandBranch.commands[k].commands
                                ? '...'
                                : '')
                    );
                }
            );

            printEmptyLine();

            if (mostRecentlyRunCommand) {
                console.log(`${chalk.green('(;) ')}Select the last action`);
            }

            if (lastRunShellCommand) {
                console.log(`${chalk.green('(.) ')}Re-run the last command`);
            }

            console.log(`${chalk.green('(/) ')}Run a custom command`);

            if (currentCommandBranch !== configs) {
                console.log(`${chalk.red('\n(q) ')}Go back...\n`);
            } else {
                console.log(`${chalk.red('\n(q) ')}Quit\n`);
            }
        },

        printCommandLogHeader = commandObject => {
            console.log(chalk.inverse.green(getCenteredText(`Command: ${(commandObject.title || commandObject.task)}`)));
            console.log(chalk.inverse.white(getCenteredText(`Directory: ${getSpecificCommandDirectory(commandObject.directory)}`)));
            printEmptyLine();
        },

        printCommandAbortInstructions = () => {
            console.log('You can press ^-C to abort current task\n');
        },

        printEmptyLine = () => {
            console.log('');
        },

        // Display related helpers

        getCenteredText = text => {
            const fillerSize = getSeparator(' ').length - text.length;

            return getString(' ', Math.floor(fillerSize / 2))
                + text
                + getString(' ', Math.ceil(fillerSize / 2));
        },

        getSeparator = char =>
            new Array(process.stdout.columns - 1)
                .join(',')
                .split(',')
                .map(() => char)
                .join(''),

        getString = (char, size) =>
            new Array(size)
                .join(',')
                .split(',')
                .map(() => char)
                .join(''),

        // Command parsing functions

        getCurrentCommandBranch = () => {
            if (!currentState.length) {
                return configs;
            } else {
                return currentState.reduce((a, c) => a.commands[c], configs);
            }
        },

        getCurrentCommandOptions = () =>
            Object.keys(getCurrentCommandBranch().commands),

        getCommandForOption = option => {
            if (!currentState.length) {
                return configs.commands[option];
            } else {
                return currentState.reduce((a, c) => a.commands[c], configs).commands[option];
            }
        },

        // Keystrokes binding functions

        bindKeyStrokesToNavigate = () => {
            listenToKeyStrokes();
            stdin.on('data', keyStrokeHandlerForNavigation);
        },

        unbindKeyStrokesToNavigate = () => {
            stdin.removeListener('data', keyStrokeHandlerForNavigation);
        },

        bindKeyStrokesToQuitCurrentCommand = () => {
            listenToKeyStrokes();
            stdin.on('data', keyStrokeHandlerForQuittingCurrentCommand);
        },

        unbindKeyStrokesToQuitCurrentCommand = () => {
            stdin.removeListener('data', keyStrokeHandlerForQuittingCurrentCommand);
        },

        listenToKeyStrokes = () => {
            stdin.setRawMode(true);
            stdin.resume();
            stdin.setEncoding('utf8');
        },

        bindEventForAbortingCurrentCommandOnWindows = () => {
            process.on(
                'SIGINT',
                () => {
                    if (currentCommandInstance) {
                        abortCurrentShellCommand();
                    } else {
                        process.exit();
                    }
                }
            );
        },

        // Keystrokes handlers

        keyStrokeHandlerForNavigation = key => {
            unbindKeyStrokesToNavigate();

            if (key === '\u0003') {
                exit();
            } else if (key === '/') {
                rePrintMenu();
                printCommandAbortInstructions();
                promptForCustomCommandAndExecute();
            } else if (key === ';') {
                if (mostRecentlyRunCommand) {
                    rePrintMenu();
                    printCommandAbortInstructions();
                    prepareToExecuteCommandObject(mostRecentlyRunCommand);
                } else {
                    promptForAction();
                }
            } else if (key === '.') {
                if (lastRunShellCommand) {
                    rePrintMenu();
                    printCommandAbortInstructions();
                    printCommandLogHeader(lastRunShellCommand);
                    executeShellCommand(lastRunShellCommand.task, lastRunShellCommand.directory);
                } else {
                    promptForAction();
                }
            } else if (key === 'q') {
                if (!currentState.length) {
                    exit();
                }

                currentState.pop();
                promptForAction();
            } else if (getCurrentCommandOptions().indexOf(key) > -1) {
                const selectedCommand = getCommandForOption(key),
                    { task } = selectedCommand;

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

        keyStrokeHandlerForQuittingCurrentCommand = key => {
            if (key === '\u0003') {
                abortCurrentShellCommand();
            }
        },

        // Command execution

        gatherParamsAndExecuteCommand = command => {
            prompt.start();
            prompt.get(
                command.params,
                (err, result) => {
                    try {
                        const taskToBeExecuted = [
                            command.task
                        ].concat(
                            command.params.map(
                                (p, i) => result[command.params[i]]
                            )
                        ).join(' ');

                        executeShellCommand(taskToBeExecuted, command.directory);
                    } catch (e) {
                        promptForAction();
                    }
                }
            );
        },

        getSpecificCommandDirectory = directory =>
            directory || getCurrentCommandBranch().directory || '.',

        prepareToExecuteCommandObject = command => {
            mostRecentlyRunCommand = command;

            printCommandLogHeader(command);

            if (!command.params) {
                executeShellCommand(command.task, command.directory);
            } else {
                gatherParamsAndExecuteCommand(command);
            }
        },

        promptForCustomCommandAndExecute = () => {
            prompt.start();
            prompt.get(
                [
                    'custom-command',
                    'directory'
                ],
                (err, result) => {
                    try {
                        const directory = getSpecificCommandDirectory(result.directory);

                        printEmptyLine();

                        prepareToExecuteCommandObject({
                            title: result['custom-command'],
                            task: result['custom-command'],
                            directory: directory
                        });
                    } catch (e) {
                        promptForAction();
                    }
                }
            );
        },

        executeShellCommand = (command, directory) => {
            const commandWords = command.split(' '),
                commandName = commandWords[0],
                commandArguments = commandWords.slice(1),
                commandDirectory = getSpecificCommandDirectory(directory);

            lastRunShellCommand = {
                task: command,
                directory: commandDirectory
            };

            currentCommandInstance = spawn(
                commandName,
                commandArguments,
                {
                    cwd: commandDirectory,
                    stdio: [0, 1, 2],
                    shell: true
                }
            );

            currentCommandInstance.on('close', finishUpWithCurrentCommand);
            bindKeyStrokesToQuitCurrentCommand();
        },

        // Command abortion and clean-up

        abortCurrentShellCommand = () => {
            currentCommandInstance.kill();
            currentCommandInstance = null;
        },

        finishUpWithCurrentCommand = () => {
            console.log(`\n${chalk.green(getSeparator('-'))}`);

            currentCommandInstance = null;

            unbindKeyStrokesToQuitCurrentCommand();
            bindKeyStrokesToNavigate();
        },

        // Exit

        exit = () => {
            clear();
            process.exit();
        };

    return {
        setConfigs: setConfigs,
        init: init
    };
})();
