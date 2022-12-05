/// The method that is called when the command is called
const { default: fetch } = require('node-fetch-commonjs');
const vscode = require('vscode');

module.exports.run = async (args) => {
    const pubDocsAPI = 'https://pub.dev/documentation/' + args + '/latest/index.json';
    try {
        const pubData = await fetch(pubDocsAPI).then(response => response.json());
        return await action(args, pubData);
    }
    catch (err) {
        vscode.window.showErrorMessage(err.message);
    }
}


async function action(args, data) {
    var link = '';
    var packageHref = '' 
    for (let i = 0; i < data.length; i++) {
        const packageName = data[i].name;
        packageHref = data[i].href;
        if (args == packageName) {
            link = 'https://pub.dev/documentation/' + packageName + '/latest/';
        }
    }
    return link;
}

