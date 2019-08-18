/* global require module */

const blessed = require('blessed');

const drawScreen = version =>
    blessed.screen({
        smartCSR: true,
        title: `myterminal-cli v${version}`,
        dockBorders: true
    });

const drawMenuBox = screen =>
    blessed.box({
        parent: screen,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        tags: true,
        style: {
            bg: '#111'
        }
    });

const drawMenuBoxTitle = (menuBox, version) =>
    blessed.text({
        parent: menuBox,
        left: 0,
        top: 0,
        width: '100%',
        height: 'shrink',
        content: `myterminal-cli v${version}`,
        tags: true,
        align: 'center',
        padding: 1,
        style: {
            fg: 'black',
            bg: '#00FFFF'
        }
    });

const drawMenuBoxThreader = menuBox =>
    blessed.text({
        parent: menuBox,
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

const drawMenuBoxInstructions = menuBox =>
    blessed.text({
        parent: menuBox,
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

const drawMenuBoxTable = menuBox =>
    blessed.text({
        parent: menuBox,
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

const drawCommandLogBox = screen =>
    blessed.box({
        parent: screen,
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

const drawCommandLogBoxTitle = commandLogBox =>
    blessed.text({
        parent: commandLogBox,
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

const drawCommandLogBoxSubtitle = commandLogBox =>
    blessed.text({
        parent: commandLogBox,
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

const drawPromptControl = screen =>
    blessed.prompt({
        parent: screen,
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

module.exports.drawControls = packageDetails => {
    const uiControls = {},
        { version } = packageDetails;

    uiControls.screen = drawScreen(version);

    uiControls.menuBox = drawMenuBox(uiControls.screen);
    uiControls.menuBoxTitle = drawMenuBoxTitle(uiControls.menuBox, version);
    uiControls.menuBoxThreader = drawMenuBoxThreader(uiControls.menuBox);
    uiControls.menuBoxInstructions = drawMenuBoxInstructions(uiControls.menuBox);
    uiControls.menuBoxTable = drawMenuBoxTable(uiControls.menuBox);

    uiControls.commandLogBox = drawCommandLogBox(uiControls.screen);
    uiControls.commandLogBoxTitle = drawCommandLogBoxTitle(uiControls.commandLogBox);
    uiControls.commandLogBoxSubtitle = drawCommandLogBoxSubtitle(uiControls.commandLogBox);

    uiControls.prompt = drawPromptControl(uiControls.screen);

    return uiControls;
};
