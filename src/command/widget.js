// module.exports.descriptions = '';
const vscode = require('vscode');

/// The method that is called when the command is called
module.exports.excute = async (flutterData, args) => {
    let searchWidget;
    try {
        searchWidget = flutterData.find(
            d => d.name.toLowerCase() === args.toLowerCase() && d.type === 'class'
        );
        module.exports.link = `${searchWidget.name}`;
        return `https://api.flutter.dev/flutter/${searchWidget.href}`;
    } catch (err) {
        if (typeof searchWidget === 'undefined') {
            vscode.window.showErrorMessage('No widget found');
        } else {
            vscode.window.showErrorMessage(err.message);
        }
    }
}


