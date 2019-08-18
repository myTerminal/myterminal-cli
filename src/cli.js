/* global require module process */

const { spawn } = require('child_process');

const packageDetails = require('../package.json');
const { drawControls } = require('./interface');
const {
    updateThreaderText,
    updateMenuOptions,
    printCommandLogHeader,
    printCommandLogFooter,
    bindCommandLog,
    exit
} = require('./interface-actions');

let configs,
    mostRecentlyRunCommand,
    lastRunShellCommand,
    currentCommandInstance,
    uiControls = {};

const specialKeys = [';', '.', '/', 'q', 'C-c', 'C-q'],
    currentState = [];

const bindEventForAbortingCurrentCommandOnWindows = () => {
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
};

const getCurrentCommandBranch = () =>
    (!currentState.length ? configs : currentState.reduce((a, c) => a.commands[c], configs));

const getCurrentCommandOptions = () => Object.keys(getCurrentCommandBranch().commands);

const rePrintMenu = () => {
    updateThreaderText(uiControls, currentState, configs);
    updateMenuOptions(
        uiControls,
        getCurrentCommandBranch(),
        getCurrentCommandOptions(),
        mostRecentlyRunCommand,
        lastRunShellCommand,
        configs
    );
    uiControls.screen.render();
};

const unbindKeyStrokesToNavigate = () => {
    getCurrentCommandOptions()
        .concat(specialKeys)
        .forEach(key => uiControls.screen.unkey(key));
};

const printCommandAbortInstructions = () => {
    uiControls.menuBoxTable.insertBottom('\nYou can press {yellow-fg}(\\){/} to abort current task');
};

const promptForAction = () => {
    rePrintMenu();
    bindKeyStrokesToNavigate();
};

const promptUserForParametersAndExecuteCommand = (receivedParams, paramsToPrompt, onDone) => {
    if (receivedParams.length === paramsToPrompt.length) {
        onDone(receivedParams);
    } else {
        uiControls.prompt.input(
            paramsToPrompt[receivedParams.length],
            '',
            (err, result) => {
                try {
                    promptUserForParametersAndExecuteCommand(
                        receivedParams.concat([result]),
                        paramsToPrompt,
                        onDone
                    );
                } catch (e) {
                    uiControls.commandLogBox.insertBottom(`{red-bg}${e.toString()}{/}`);
                    uiControls.commandLogBox.setScrollPerc(100);
                    promptForAction();
                }
            }
        );
    }
};

const getSpecificCommandDirectory = directory =>
    directory || getCurrentCommandBranch().directory || '.';

const unbindKeyStrokesToQuitCurrentCommand = () => {
    uiControls.screen.unkey('\\');
};

const finishUpWithCurrentCommand = () => {
    printCommandLogFooter(uiControls);
    rePrintMenu();
    currentCommandInstance = null;
    unbindKeyStrokesToQuitCurrentCommand();
    bindKeyStrokesToNavigate();
};

const abortCurrentShellCommand = () => {
    currentCommandInstance.kill();
    currentCommandInstance = null;
};

const keyStrokeHandlerForQuittingCurrentCommand = () => {
    uiControls.commandLogBox.insertBottom('{magenta-bg}Aborted{/}');
    uiControls.commandLogBox.setScrollPerc(100);
    abortCurrentShellCommand();
};

const bindKeyStrokesToQuitCurrentCommand = () => {
    uiControls.screen.key('\\', keyStrokeHandlerForQuittingCurrentCommand);
};

const executeShellCommand = (command, directory) => {
    const commandWords = command.split(' '),
        commandDirectory = getSpecificCommandDirectory(directory);

    lastRunShellCommand = {
        task: command,
        directory: commandDirectory
    };

    currentCommandInstance = spawn(
        commandWords[0],
        commandWords.slice(1),
        { cwd: commandDirectory, shell: true }
    );

    bindCommandLog(uiControls, currentCommandInstance);
    currentCommandInstance.on('close', finishUpWithCurrentCommand);
    bindKeyStrokesToQuitCurrentCommand();
};

const gatherParamsAndExecuteCommand = ({ task, params, directory }) => {
    promptUserForParametersAndExecuteCommand(
        [],
        params,
        args => { executeShellCommand([task].concat(args).join(' '), directory); }
    );
};

const prepareToExecuteCommandObject = command => {
    mostRecentlyRunCommand = command;
    uiControls.menuBox.width = '50%';
    uiControls.commandLogBox.show();
    printCommandLogHeader(uiControls, command, getSpecificCommandDirectory(command.directory));

    if (!command.params) {
        executeShellCommand(command.task, command.directory);
    } else {
        gatherParamsAndExecuteCommand(command);
    }
};

const promptForCustomCommandAndExecute = () => {
    promptUserForParametersAndExecuteCommand(
        [],
        ['custom-command', 'directory'],
        receivedParams => {
            prepareToExecuteCommandObject({
                title: receivedParams[0],
                task: receivedParams[0],
                directory: getSpecificCommandDirectory(receivedParams[1])
            });
        }
    );
};

const getCommandForOption = option =>
    (!currentState.length
        ? configs.commands[option]
        : currentState.reduce((a, c) => a.commands[c], configs).commands[option]);

const keyStrokeHandlerForNavigation = key => {
    unbindKeyStrokesToNavigate();

    if (key === 'C-c' || key === 'C-q') { // This does not seem to work with blessed
        exit(uiControls);
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
            printCommandLogHeader(
                uiControls,
                lastRunShellCommand,
                getSpecificCommandDirectory(lastRunShellCommand.directory)
            );
            executeShellCommand(lastRunShellCommand.task, lastRunShellCommand.directory);
        } else {
            promptForAction();
        }
    } else if (key === 'q') {
        if (!currentState.length) {
            exit(uiControls);
        }

        currentState.pop();
        promptForAction();
    } else if (getCurrentCommandOptions().indexOf(key) > -1) {
        const selectedCommand = getCommandForOption(key);

        if (selectedCommand.task) {
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
};

const bindKeyStrokesToNavigate = () => {
    getCurrentCommandOptions().concat(specialKeys)
        .forEach(key => uiControls.screen.key(key, keyStrokeHandlerForNavigation));
};

module.exports.start = data => {
    configs = data;
    bindEventForAbortingCurrentCommandOnWindows();
    uiControls = drawControls(packageDetails);
    uiControls.screen.enableKeys();
    promptForAction();
};
