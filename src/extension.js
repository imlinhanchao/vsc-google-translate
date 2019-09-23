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
    let __hoverBarItem = null;

    let selectionText = () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return ''; // No open text editor
        }

        let selection = editor.selection;
        return editor.document.getText(selection);
    }

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vsc-google-translate" is now active!');

    let hoverRegister = false;
    let hoverOpen = false;

    let registerHover = () => {
        if (hoverRegister) return;
        hoverRegister = true;
        context.subscriptions.push(vscode.languages.registerHoverProvider({scheme: 'file'}, {
            provideHover: async (document, position, token) => {
                let editor = vscode.window.activeTextEditor;
                if (!editor || !hoverOpen) {
                    return; // No open text editor
                }
        
                let selection = editor.selection;

                let line = { 
                    begin: Math.min(selection.anchor.line, selection.active.line),
                    end: Math.max(selection.anchor.line, selection.active.line)
                }, character = {
                    begin: Math.min(selection.anchor.character, selection.active.character),
                    end: Math.max(selection.anchor.character, selection.active.character)
                };
    
                if (line.begin > position.line || character.begin > position.character) return;
                if (line.end < position.line || character.end < position.character) return;
    
                let trans = await tran(editor.document.getText(selection));
                let word = trans.word    
                let pre = `**[Google Translate](https://translate.google.cn/?sl=auto&tl=${trans.lang.to}&text=${escape(trans.text)})**\n\n`;
                return new vscode.Hover(pre + word);
            }
        }));
        
        __hoverBarItem =  __hoverBarItem || vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        __hoverBarItem.show();
        __hoverBarItem.text = hoverOpen ? `悬停翻译 : 开启` : `悬停翻译 : 关闭`;
        __hoverBarItem.command = 'translates.hover';
    };

    registerHover();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('translates.translates', async function () {
        // The code you place here will be executed every time your command is executed
        let text = selectionText();
        if (text == '') return;

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
        candidate.length ? __candidateBarItem.show() : __candidateBarItem.hide();
        __candidateBarItem.text = `$(triangle-right)`
        __candidateBarItem.command = 'translates.candidate'
   });

    context.subscriptions.push(disposable);

    let hoverDisposable = vscode.commands.registerCommand('translates.hover', function () {
        hoverOpen = !hoverOpen;
        __hoverBarItem.text = hoverOpen ? `悬停翻译 : 开启` : `悬停翻译 : 关闭`;
    });

    context.subscriptions.push(hoverDisposable);

    let copyDisposable = vscode.commands.registerCommand('translates.clipboard', async function () {
        let text = selectionText(), word = '';
        if (text == '') return;

        if (__currentWord.text == '') {
            let trans = await tran(text);
            word = trans.word;
        } else {
            word = __currentWord.word;
        }
        
        clipboardy.writeSync(word);
        vscode.window.showInformationMessage((await tran(`The translation results have been placed on the clipboard.`)).word);
    })
    context.subscriptions.push(copyDisposable);
    
    let replaceDisposable = vscode.commands.registerCommand('translates.replace', async function () {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }
        let selection = editor.selection;
        let text = editor.document.getText(selection), word = '';

        if (__currentWord.text == '' || __currentWord.text != text) {
            let trans = await tran(text);
            word = trans.word;
        } else {
            word = __currentWord.word;
        }

        editor.edit(editBuilder => {
            editBuilder.replace(selection, word);
        })
        
        vscode.window.showInformationMessage(`${text} => ${word}.`);
    })
    context.subscriptions.push(replaceDisposable);

    let canDisposable = vscode.commands.registerCommand('translates.candidate', async function () {
        let text = selectionText();
        if (text == '') return;

        if (__currentWord.text == '' || __currentWord.text != text) {
            __currentWord = await tran(text);
        }

        let items = [];
        __currentWord.candidate.forEach(c => items.push({label: c}))
        const chosen = await vscode.window.showQuickPick(items);
        if (chosen) {
            __currentWord.word = chosen.label
            clipboardy.writeSync(__currentWord.word);
            vscode.window.showInformationMessage((await tran(`The translation results have been placed on the clipboard.`)).word);
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