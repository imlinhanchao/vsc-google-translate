const vscode = require('vscode');
const clipboardy = require('clipboardy');
const tranlate = require('./tranlate');

let currentWord = {
    text: '',
    word: '',
    candidate: []
};

let message = {
    wait: 'Waiting',
    failed: 'Translate Failed',
    clipboard: 'The translation results have been placed on the clipboard.',
    hoverOn: 'Hover translation is on.',
    hoverOff: 'Hover translation is off.'
};

let hoverOpen = false;

let barItem = {
    word: vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left),
    candidate: vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left),
    hover: vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right),
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
    let messageKey = 'messages.0.' + vscode.env.language;
    
    cxt.globalState.update('hover', hoverOpen);

    barItem.hover.tooltip = !hoverOpen ? 'Turn On Hover Translate' : 'Turn Off Hover Translate';
    barItem.hover.text = `$(${(hoverOpen ? 'eye-watch' : 'eye-closed')}) ${hoverOpen ? 'On' : 'Off'}`;
    barItem.hover.command = 'translates.hover'
    barItem.hover.show();

    if (cxt.globalState.get(messageKey)) {
        message = cxt.globalState.get(messageKey);
    } else {
        message.wait = (await tranlate(`稍等`, vscode.env.language)).word;
        message.failed = (await tranlate(`翻译失败`, vscode.env.language)).word;
        message.clipboard = (await tranlate(`翻译结果已放置在剪贴板上。`, vscode.env.language)).word;
        message.hoverOn = (await tranlate(`悬停翻译已开启。`, vscode.env.language)).word;
        message.hoverOff = (await tranlate(`悬停翻译已关闭。`, vscode.env.language)).word;
        cxt.globalState.update(messageKey, message);
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
    barItem.word.text = `$(pulse) ${message.wait}...`;

    let word = `${message.failed}...`;
    let candidate = [];
    try {
        let trans = await tranlate(text);
        word = trans.word
        candidate = trans.candidate
    } catch (error) {
        return vscode.window.showInformationMessage(error.message);
    }

    currentWord = { word, text, candidate };

    vscode.window.showInformationMessage(`${text}: ${word}`);

    barItem.word.tooltip = word;
    if(text.length > 10) text = text.slice(0, 10) + '... '
    if(word.length > 10) word = word.slice(0, 10) + '...'
    barItem.word.text = `${text}: ${word}`;
    barItem.word.command = 'translates.clipboard'

    candidate.length ? barItem.candidate.show() : barItem.candidate.hide();
    barItem.candidate.text = `$(ellipsis)`
    barItem.candidate.command = 'translates.candidate'
});

let switchDisposable = vscode.commands.registerCommand('translates.hover', async function () {
    hoverOpen = !hoverOpen;
    context.globalState.update('hover', hoverOpen);
    barItem.hover.title = !hoverOpen ? 'Hover Translate On' : 'Hover Translate Off';
    barItem.hover.text = `$(${(hoverOpen ? 'eye-watch' : 'eye-closed')}) ${hoverOpen ? 'On' : 'Off'}`
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