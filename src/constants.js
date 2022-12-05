// import { env, workspace } from 'vscode';
const vscode = require('vscode'); // initializing vscode

const isWindows = () => Boolean(vscode.env.appRoot && vscode.env.appRoot[0] !== "/");
const hotkeyConfigProperty = () => {
    if (isWindows()) {
        return 'hotkey.windows';
    }
    return 'hotkey.mac';
};
const KEYBINDING_DISPLAY = () => {
    const hotkeyConfig = vscode.workspace.getConfiguration('Insider').get(hotkeyConfigProperty());
    switch (hotkeyConfig) {
        case '⌘ + .':
            return '⌘ + .';
        case '⌥ + .':
            return '⌥.';
        case 'Ctrl + .':
            return 'Ctrl+.';
        case 'Alt + .':
            return 'Alt+.';
        default:
            return 'Ctrl + .';
    }
};

module.exports = {
    KEYBINDING_DISPLAY,
    hotkeyConfigProperty,
    isWindows,
}