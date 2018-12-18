// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const clipboardy = require('clipboardy');
const tran = require('./tran');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    let __currentWord = {
        text: '',
        word: '',
        candidate: []
    };

    let __wordBarItem = null;
    let __candidateBarItem = null;

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "google-translate" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('translates.translates', async function () {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        let selection = editor.selection;
        let text = editor.document.getText(selection);

        let trans = await tran(text);

        let word = trans.word

        let candidate = trans.candidate

        __currentWord = { word, text, candidate };

        // Display a message box to the user
        vscode.window.showInformationMessage(`${text}: ${word}`);

        __wordBarItem =  __wordBarItem || vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        __wordBarItem.show();
        __wordBarItem.text = `${text}: ${word}`;
        __wordBarItem.command = 'translates.clipboard'

        __candidateBarItem =  __candidateBarItem || vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        candidate.length ? __candidateBarItem.show() : __candidateBarItem.hide()
        __candidateBarItem.text = `$(triangle-right)`
        __candidateBarItem.command = 'translates.candidate'

   });

    context.subscriptions.push(disposable);

    let copyDisposable = vscode.commands.registerCommand('translates.clipboard', function () {
        clipboardy.writeSync(__currentWord.word);
        vscode.window.showInformationMessage(`${__currentWord.word} was copy in clipboard.`);
    })
    context.subscriptions.push(copyDisposable);

    let canDisposable = vscode.commands.registerCommand('translates.candidate', async function () {
        let items = [];
        __currentWord.candidate.forEach(c => items.push({label: c}))
        const chosen = await vscode.window.showQuickPick(items);
        if (chosen) {
            __currentWord.word = chosen.label
            clipboardy.writeSync(__currentWord.word);
            vscode.window.showInformationMessage(`${__currentWord.word} was copy in clipboard.`);
            __wordBarItem.text = `${__currentWord.text}: ${__currentWord.word}`;
            __candidateBarItem.show()
        }
    })

    context.subscriptions.push(canDisposable);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;