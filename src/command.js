const vscode = require('vscode');
const clipboardy = require('clipboardy');
const tranlate = require('./tranlate');

let currentWord = {
    text: '',
    word: '',
    candidate: []
};

let message = {

};

let hoverOpen = false;

let barItem = {
    word: vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left),
    candidate: vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left),
}

let context = null;

function selectionText() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return ''; // No open text editor
    }

    let selection = editor.selection;
    return editor.document.getText(selection);
}

async function initSetting(cxt) {
    context = cxt;
    hoverOpen = cxt.globalState.get('hover') || false;
    
    cxt.globalState.update('hover', hoverOpen);
    if (cxt.globalState.get('message')) {
        message = cxt.globalState.get('message');
    } else {
        message.clipboard = (await tranlate(`The translation results have been placed on the clipboard.`)).word;
        message.hoverOn = (await tranlate(`Hover translation is on.`)).word;
        message.hoverOff = (await tranlate(`Hover translation is off.`)).word;
        cxt.globalState.update('message', message);
    }
}

let hoverDisposable = vscode.languages.registerHoverProvider({scheme: 'file'}, {
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

        try {
            let trans = await tranlate(editor.document.getText(selection));
            let word = trans.word    
            let pre = `**[Google Translate](https://translate.google.cn/?sl=auto&tl=${trans.lang.to}&text=${escape(trans.text)})**\n\n`;
            return new vscode.Hover(pre + word);
        } catch (error) {
            return new vscode.Hover('**[Error](https://github.com/imlinhanchao/vsc-google-translate/issues)**\n\n' + error.message);
        }
    }
})

let tranDisposable = vscode.commands.registerCommand('translates.translates', async function () {
    // The code you place here will be executed every time your command is executed
    let text = selectionText();
    if (text == '') return;

    barItem.word.show();
    barItem.word.text = `Waiting...`;

    let word = '翻译失败...';
    let candidate = [];
    try {
        let trans = await tranlate(text);
        word = trans.word
        candidate = trans.candidate
    } catch (error) {
        return vscode.window.showInformationMessage(error.message);
    }

    currentWord = { word, text, candidate };

    // Display a message box to the user
    vscode.window.showInformationMessage(`${text}: ${word}`);

    barItem.word.text = `${text}: ${word}`;
    barItem.word.command = 'translates.clipboard'

    candidate.length ? barItem.candidate.show() : barItem.candidate.hide();
    barItem.candidate.text = `$(triangle-right)`
    barItem.candidate.command = 'translates.candidate'
});

let switchDisposable = vscode.commands.registerCommand('translates.hover', async function () {
    hoverOpen = !hoverOpen;
    context.globalState.update('hover', hoverOpen);
    vscode.window.showInformationMessage(hoverOpen ? message.hoverOn : message.hoverOff);
});

let copyDisposable = vscode.commands.registerCommand('translates.clipboard', async function () {
    let text = selectionText(), word = '';
    if (text == '') return;

    try {
        if (currentWord.text == '') {
            let trans = await tranlate(text);
            word = trans.word;
        } else {
            word = currentWord.word;
        }
        clipboardy.writeSync(word);
        vscode.window.showInformationMessage(message.clipboard);
    } catch (error) {
        return vscode.window.showInformationMessage(error.message);
    }
});

let replaceDisposable = vscode.commands.registerCommand('translates.replace', async function () {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return; // No open text editor
    }
    let selection = editor.selection;
    let text = editor.document.getText(selection), word = '';

    try {
        if (currentWord.text == '' || currentWord.text != text) {
            let trans = await tranlate(text);
            word = trans.word;
        } else {
            word = currentWord.word;
        }

        editor.edit(editBuilder => {
            editBuilder.replace(selection, word);
        })
        
        vscode.window.showInformationMessage(`${text} => ${word}.`);
    } catch (error) {
        return vscode.window.showInformationMessage(error.message);
    }
});

let canDisposable = vscode.commands.registerCommand('translates.candidate', async function () {
    let text = selectionText();
    if (text == '') return;

    try {
        if (currentWord.text == '' || currentWord.text != text) {
            currentWord = await tranlate(text);
        }

        let items = [];
        currentWord.candidate.forEach(c => items.push({ label: c }))
        const chosen = await vscode.window.showQuickPick(items);
        if (chosen) {
            currentWord.word = chosen.label
            clipboardy.writeSync(currentWord.word);
            vscode.window.showInformationMessage(message.clipboard);
            barItem.word.text = `${currentWord.text}: ${currentWord.word}`;
            barItem.candidate.show()
        }
    } catch (error) {
        return vscode.window.showInformationMessage(error.message);
    }
});

module.exports = {
    initSetting,
    hoverDisposable,
    tranDisposable,
    switchDisposable,
    copyDisposable,
    replaceDisposable,
    canDisposable
}