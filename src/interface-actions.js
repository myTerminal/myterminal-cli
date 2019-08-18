/* global require module */

const clear = require('clear');

module.exports.updateThreaderText = (uiControls, currentState, configs) => {
    const threads = currentState
        .map((s, i) => currentState.slice(0, i + 1))
        .map(
            s =>
                s.reduce((a, c) => a.commands[c], configs)
        )
        .map(s => s.title);

    const threaderText = [configs.title]
        .concat(threads)
        .map(t => `{#00FFFF-fg}${t}{/}`)
        .join(' -> ');

    uiControls.menuBoxThreader.setContent(threaderText);
};

module.exports.updateMenuOptions = (
    uiControls,
    currentCommandBranch,
    currentCommandOptions,
    mostRecentlyRunCommand,
    lastRunShellCommand,
    configs
) => {
    const menuItems = [];

    currentCommandOptions.forEach(
        k => {
            menuItems.push(
                `{green-fg}(${k}){/} ${currentCommandBranch.commands[k].title}${(currentCommandBranch.commands[k].commands ? '...' : '')}`
            );
        }
    );

    menuItems.push('');

    if (mostRecentlyRunCommand) {
        menuItems.push('{green-fg}(;){/} Select the last action');
    }

    if (lastRunShellCommand) {
        menuItems.push('{green-fg}(.){/} Re-run the last command');
    }

    menuItems.push('{green-fg}(/){/} Run a custom command');
    menuItems.push('');

    if (currentCommandBranch !== configs) {
        menuItems.push('{red-fg}(q){/} Go back...');
    } else {
        menuItems.push('{red-fg}(q){/} Quit');
    }

    uiControls.menuBoxTable.setContent(menuItems.join('\n'));
};

const clearLog = uiControls => {
    uiControls.commandLogBox.setContent('');
};

module.exports.printCommandLogHeader = (uiControls, commandObject, commandDirectory) => {
    clearLog(uiControls);
    uiControls.commandLogBoxTitle.setContent(`{green-bg}Command: ${(commandObject.title || commandObject.task)}{/}`);
    uiControls.commandLogBoxTitle.show();
    uiControls.commandLogBoxSubtitle.setContent(`{white-bg}Directory: ${commandDirectory}{/}`);
    uiControls.commandLogBoxSubtitle.show();
    uiControls.commandLogBox.insertBottom('');
    uiControls.commandLogBox.insertBottom('');
    uiControls.screen.render();
};

module.exports.printCommandLogFooter = uiControls => {
    uiControls.commandLogBox.insertBottom('{green-bg}Done{/}');
    uiControls.commandLogBox.setScrollPerc(100);
    uiControls.screen.render();
};

module.exports.bindCommandLog = (uiControls, commandInstance) => {
    commandInstance.stdout.on(
        'data',
        data => {
            uiControls.commandLogBox.insertBottom(data.toString());
            uiControls.commandLogBox.setScrollPerc(100);
            uiControls.screen.render();
        }
    );

    commandInstance.stderr.on(
        'data',
        data => {
            uiControls.commandLogBox.insertBottom('{red-bg}Error{/}');
            uiControls.commandLogBox.insertBottom(`{red-fg}${data.toString()}{/}`);
            uiControls.commandLogBox.setScrollPerc(100);
            uiControls.screen.render();
        }
    );
};

module.exports.exit = uiControls => {
    uiControls.screen.destroy();
    clear();
};
