// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const command = require('./command')

function activate(context) {
    console.log('Congratulations, your extension "vsc-google-translate" is now active!');

    command.initSetting(context);

    context.subscriptions.push(command.hoverDisposable);
    context.subscriptions.push(command.tranDisposable);
    context.subscriptions.push(command.switchDisposable);
    context.subscriptions.push(command.copyDisposable);
    context.subscriptions.push(command.replaceDisposable);
    context.subscriptions.push(command.canDisposable);
    context.subscriptions.push(command.switchLangDisposable);
    context.subscriptions.push(command.settingsDisposable);
}

exports.activate = activate;


function deactivate() {
}

exports.deactivate = deactivate;