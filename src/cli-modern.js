/* global require module process */

var os = require('os'),
    spawn = require('child_process').spawn,
    blessed = require('blessed'),
    clear = require('clear'),
    version = require('../package.json').version;

module.exports = (function () {

    var configs,

        uiControls = {},

        // Keys

        specialKeys = [
            ';',
            '.',
            '/',
            'q',
            'C-c',
            'C-q'
        ],

        // State storage

        currentState = [],

        mostRecentlyRunCommand,

        lastRunShellCommand,

        currentCommandInstance,

        // User facing functions

        setConfigs = function (data) {
            configs = data;
        },

        init = function () {
            bindEventForAbortingCurrentCommandOnWindows();
            drawControls();
            uiControls.screen.enableKeys();
            promptForAction();
        },

        drawControls = function () {
            uiControls.screen = blessed.screen({
                smartCSR: true,
                title: 'myterminal-cli v' + version,
                dockBorders: true
            });

            uiControls.menuBox = blessed.box({
                parent: uiControls.screen,
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                tags: true,
                style: {
                    bg: '#111'
                }
            });

            uiControls.menuBoxTitle = blessed.text({
                parent: uiControls.menuBox,
                left: 0,
                top: 0,
                width: '100%',
                height: 'shrink',
                content: 'myterminal-cli v' + version,
                tags: true,
                align: 'center',
                padding: 1,
                style: {
                    fg: 'black',
                    bg: '#00FFFF'
                }
            });

            uiControls.menuBoxThreader = blessed.text({
                parent: uiControls.menuBox,
                left: 0,
                top: 3,
                width: '100%',
                height: 'shrink',
                content: 'All',
                tags: true,
                padding: 1,
                style: {
                    bg: '#111'
                }
            });

            uiControls.menuBoxInstructions = blessed.text({
                parent: uiControls.menuBox,
                left: 0,
                top: 6,
                width: '100%',
                height: 'shrink',
                content: 'Press a marked key to perform the respective operation',
                tags: true,
                style: {
                    bg: '#111'
                }
            });

            uiControls.menuBoxTable = blessed.text({
                parent: uiControls.menuBox,
                left: 0,
                top: 7,
                width: '100%',
                height: 'shrink',
                content: '{red-fg}(q){/} Quit',
                tags: true,
                padding: 1,
                style: {
                    bg: '#111'
                }
            });

            uiControls.commandLogBox = blessed.box({
                parent: uiControls.screen,
                left: '50%-1',
                top: 0,
                width: '50%+1',
                height: '100%',
                border: {
                    type: 'bg',
                    top: false,
                    right: false,
                    bottom: false,
                    left: true
                },
                hidden: true,
                scrollable: true,
                alwaysScroll: true,
                tags: true,
                style: {
                    border: {
                        fg: '#339933'
                    }
                }
            });

            uiControls.commandLogBoxTitle = blessed.text({
                parent: uiControls.commandLogBox,
                left: 0,
                top: 0,
                width: '100%',
                height: 'shrink',
                content: '',
                tags: true,
                hidden: true,
                align: 'center',
                style: {
                    bg: 'green'
                }
            });

            uiControls.commandLogBoxSubtitle = blessed.text({
                parent: uiControls.commandLogBox,
                left: 0,
                top: 1,
                width: '100%',
                height: 'shrink',
                content: '',
                tags: true,
                hidden: true,
                align: 'center',
                style: {
                    fg: 'black',
                    bg: 'white'
                }
            });

            uiControls.prompt = blessed.prompt({
                parent: uiControls.screen,
                border: 'line',
                height: 'shrink',
                width: 'half',
                top: 'center',
                left: 'center',
                label: ' {blue-fg}Enter the value for{/blue-fg} ',
                tags: true,
                keys: true,
                vi: true
            });
        },

        promptForAction = function () {
            rePrintMenu();
            bindKeyStrokesToNavigate();
        },

        // Display related functions

        clearLog = function () {
            uiControls.commandLogBox.setContent('');
        },

        rePrintMenu = function () {
            updateThreaderText();
            updateMenuOptions();
            uiControls.screen.render();
        },

        updateThreaderText = function () {
            var threads = currentState.map((s, i) => currentState.slice(0, i + 1))
                .map((s, i) => s.reduce((a, c) => a.commands[c], configs))
                .map(s => s.title);

            var threaderText = [configs.title]
                .concat(threads)
                .map(t => '{#00FFFF-fg}' + t + '{/}')
                .join(' -> ');

            uiControls.menuBoxThreader.setContent(threaderText);
        },

        updateMenuOptions = function () {
            var currentCommandBranch = getCurrentCommandBranch(),
                menuItems = [];

            getCurrentCommandOptions().forEach(k =>
                                               menuItems.push(('{green-fg}(' + k + '){/} ')
                                                              + currentCommandBranch.commands[k]['title'] +
                                                              (currentCommandBranch.commands[k].commands
                                                               ? '...'
                                                               : '')));

            menuItems.push('');

            if (mostRecentlyRunCommand) {
                menuItems.push('{green-fg}(;){/} ' + 'Select the last action');
            }

            if (lastRunShellCommand) {
                menuItems.push('{green-fg}(.){/} ' + 'Re-run the last command');
            }

            menuItems.push('{green-fg}(/){/} ' + 'Run a custom command');

            menuItems.push('');

            if (currentCommandBranch !== configs) {
                menuItems.push('{red-fg}(q){/} ' + 'Go back...');
            } else {
                menuItems.push('{red-fg}(q){/} ' + 'Quit');
            }

            uiControls.menuBoxTable.setContent(menuItems.join('\n'));
        },

        printCommandLogHeader = function (commandObject) {
            clearLog();
            uiControls.commandLogBoxTitle.setContent('{green-bg}Command: ' + (commandObject.title || commandObject.task) + '{/}');
            uiControls.commandLogBoxTitle.show();
            uiControls.commandLogBoxSubtitle.setContent('{white-bg}Directory: ' + getSpecificCommandDirectory(commandObject.directory) + '{/}');
            uiControls.commandLogBoxSubtitle.show();
            uiControls.commandLogBox.insertBottom('');
            uiControls.commandLogBox.insertBottom('');
            uiControls.screen.render();
        },

        printCommandLogFooter = function () {
            uiControls.commandLogBox.insertBottom('{green-bg}Done{/}');
            uiControls.commandLogBox.setScrollPerc(100);
            uiControls.screen.render();
        },

        printCommandAbortInstructions = function () {
            uiControls.menuBoxTable.insertBottom('\nYou can press {yellow-fg}(\\){/} to abort current task');
        },

        // Command parsing functions

        getCurrentCommandBranch = function () {
            return !currentState.length
                ? configs
                : currentState.reduce((a, c) => a['commands'][c], configs);
        },

        getCurrentCommandOptions = function () {
            return Object.keys(getCurrentCommandBranch().commands);
        },

        getCommandForOption = function (option) {
            return !currentState.length
                ? configs.commands[option]
                : currentState.reduce((a, c) => a['commands'][c], configs).commands[option];
        },

        // Keystrokes binding functions

        bindKeyStrokesToNavigate = function () {
            getCurrentCommandOptions()
                .concat(specialKeys)
                .forEach(key => uiControls.screen.key(key, keyStrokeHandlerForNavigation));
        },

        unbindKeyStrokesToNavigate = function () {
            getCurrentCommandOptions()
                .concat(specialKeys)
                .forEach(key => uiControls.screen.unkey(key));
        },

        bindKeyStrokesToQuitCurrentCommand = function () {
            uiControls.screen.key('\\', keyStrokeHandlerForQuittingCurrentCommand);
        },

        unbindKeyStrokesToQuitCurrentCommand = function () {
            uiControls.screen.unkey('\\');
        },

        bindEventForAbortingCurrentCommandOnWindows = function () {
            process.on('SIGINT', function () {
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

            if (key === 'C-c' || key === 'C-q') { // This does not seem to work with blessed

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
            uiControls.commandLogBox.insertBottom('{magenta-bg}Aborted{/}');
            uiControls.commandLogBox.setScrollPerc(100);
            abortCurrentShellCommand();
        },

        // Command execution

        gatherParamsAndExecuteCommand = function (command) {
            promptUserForParametersAndExecuteCommand([], command.params, function (receivedParams) {
                var taskToBeExecuted = [
                    command.task
                ].concat(receivedParams).join(' ');

                executeShellCommand(taskToBeExecuted, command.directory);
            });
        },

        promptUserForParametersAndExecuteCommand = function (receivedParams, paramsToPrompt, onDone) {
            if (receivedParams.length === paramsToPrompt.length) {
                onDone(receivedParams);
            } else {
                uiControls.prompt.input(paramsToPrompt[receivedParams.length], '', function(err, result) {
                    try {
                        promptUserForParametersAndExecuteCommand(receivedParams.concat([result]), paramsToPrompt, onDone);
                    } catch (e) {
                        uiControls.commandLogBox.insertBottom('{red-bg}' + e.toString() + '{/}');
                        uiControls.commandLogBox.setScrollPerc(100);
                        promptForAction();
                    }
                });
            }
        },

        getSpecificCommandDirectory = function (directory) {
            return directory || getCurrentCommandBranch().directory || '.';
        },

        prepareToExecuteCommandObject = function (command) {
            mostRecentlyRunCommand = command;

            uiControls.menuBox.width = '50%';
            uiControls.commandLogBox.show();

            printCommandLogHeader(command);

            if (!command.params) {
                executeShellCommand(command.task, command.directory);
            } else {
                gatherParamsAndExecuteCommand(command);
            }
        },

        promptForCustomCommandAndExecute = function () {
            promptUserForParametersAndExecuteCommand([], [
                'custom-command',
                'directory'
            ], function(receivedParams) {
                var directory = getSpecificCommandDirectory(receivedParams[1]);

                prepareToExecuteCommandObject({
                    title: receivedParams[0],
                    task: receivedParams[0],
                    directory: directory
                });
            });
        },

        executeShellCommand = function (command, directory) {
            var commandWords = command.split(' '),
                commandName = commandWords[0],
                commandArguments = commandWords.slice(1),
                commandDirectory = getSpecificCommandDirectory(directory);

            lastRunShellCommand = {
                task: command,
                directory: commandDirectory
            };

            currentCommandInstance = spawn(commandName, commandArguments, {
                cwd: commandDirectory,
                shell: true
            });

            currentCommandInstance.stdout.on('data', function (data) {
                uiControls.commandLogBox.insertBottom(data.toString());
                uiControls.commandLogBox.setScrollPerc(100);
                uiControls.screen.render();
            });

            currentCommandInstance.stderr.on('data', function (data) {
                uiControls.commandLogBox.insertBottom('{red-bg}Error{/}');
                uiControls.commandLogBox.insertBottom('{red-fg}' + data.toString() + '{/}');
                uiControls.commandLogBox.setScrollPerc(100);
                uiControls.screen.render();
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
            printCommandLogFooter();
            rePrintMenu();

            currentCommandInstance = null;

            unbindKeyStrokesToQuitCurrentCommand();
            bindKeyStrokesToNavigate();
        },

        // Exit

        exit = function () {
            uiControls.screen.destroy();
            clear();
        };

    return {
        setConfigs: setConfigs,
        init: init
    };
})();
