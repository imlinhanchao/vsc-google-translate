const vscode = require('vscode');
const clipboardy = require('clipboardy');
const translate = require('./tranlate');
const locale = require('../i18n')();
const open = require('child_process');

let currentWord = {
    text: '',
    word: '',
    candidate: []
};


let hoverOpen = false;
let usetimes = 0;
let langTo = undefined;

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

function initSetting(cxt) {
    context = cxt;
    hoverOpen = cxt.globalState.get('hover') || false;
    usetimes = cxt.globalState.get('usetimes') || 0;
    
    cxt.globalState.update('hover', hoverOpen);

    barItem.hover.tooltip = !hoverOpen ? locale['on.tooltip'] : locale['off.tooltip'];
    barItem.hover.text = `$(${(hoverOpen ? 'eye-watch' : 'eye-closed')}) ${hoverOpen ? locale['on.text'] : locale['off.text']}`;
    barItem.hover.command = 'translates.hover'
    barItem.hover.show();

    //noticeComment();
}

function noticeComment() {
    let notice = context.globalState.get('notice');
    if (!notice && usetimes > 100) {
        confirm(locale['like.extension'], [locale['like.ok'], locale['like.no'], locale['like.later']])
            .then((option) => {
                switch(option) {
                    case locale['like.ok']:
                        open.exec('start https://marketplace.visualstudio.com/items?itemName=hancel.google-translate');
                        context.globalState.update('notice', true);
                        break;
                    case locale['like.no']:
                        context.globalState.update('notice', true);
                        break;
                    case locale['like.later']:
                        usetimes = 75;
                        context.globalState.update('usetimes', usetimes);
                        context.globalState.update('notice', false);
                        break;
                }
            })
            .catch(e => console.log(e));
    } else if(!notice) {
        context.globalState.update('usetimes', ++usetimes);
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
            let trans = await translate(editor.document.getText(selection), langTo);
            if (!trans) return;
            let word = trans.word    
            let pre = `**[Google Translate](https://translate.google.cn/?sl=auto&tl=${trans.lang.to}&text=${encodeURI(trans.text)})**\n\n`;
            noticeComment();
            return new vscode.Hover(pre + word.replace(/\r\n/g, '  \r\n'));
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
    barItem.word.text = `$(pulse) ${locale['wait.message']}...`;

    let word = `${locale['failed.message']}...`;
    let candidate = [];
    try {
        let trans = await translate(text, langTo);
        if (!trans) return;
        word = trans.word
        candidate = trans.candidate
        noticeComment();
    } catch (error) {
        return vscode.window.showInformationMessage(error.message);
    }

    currentWord = { word, text, candidate };

    vscode.window.showInformationMessage(`${text.trim().slice(0, 100).trim() + '... '}: ${word.trim().slice(0, 100).trim() + '... '}`);

    barItem.word.tooltip = word;
    if(text.length > 10) text = text.trim().slice(0, 10).trim() + '... '
    if(word.length > 10) word = word.trim().slice(0, 10).trim() + '...'
    barItem.word.text = `${text.trim()}: ${word.trim()}`;
    barItem.word.command = 'translates.clipboard'

    candidate.length ? barItem.candidate.show() : barItem.candidate.hide();
    barItem.candidate.text = `$(ellipsis)`
    barItem.candidate.command = 'translates.candidate'
});

let switchDisposable = vscode.commands.registerCommand('translates.hover', async function () {
    hoverOpen = !hoverOpen;
    context.globalState.update('hover', hoverOpen);
    barItem.hover.tooltip = !hoverOpen ? locale['on.tooltip'] : locale['off.tooltip'];
    barItem.hover.text = `$(${(hoverOpen ? 'eye-watch' : 'eye-closed')}) ${hoverOpen ? locale['on.text'] : locale['off.text']}`;
    vscode.window.showInformationMessage(hoverOpen ? locale["hoverOn.message"] : locale["hoverOff.message"]);
});

let settingsDisposable = vscode.commands.registerCommand('translates.settings', async function () {
    vscode.commands.executeCommand('workbench.action.openSettings', 'google-translate' );
});

let switchLangDisposable = vscode.commands.registerCommand('translates.switch', async function () {
    prompt(locale['switch.message'], langTo || vscode.workspace.getConfiguration().get('google-translate.firstLanguage'))
        .then(val => {
            if (!val) return;
            langTo = val;
            vscode.window.showInformationMessage(locale['switch.success'] + val);
        });
});

let copyDisposable = vscode.commands.registerCommand('translates.clipboard', async function () {
    let text = selectionText(), word = '';
    if (text == '') return;

    try {
        if (currentWord.text == '') {
            barItem.candidate.hide();
            barItem.word.show();
            barItem.word.text = `$(pulse) ${locale['wait.message']}...`;        
            let trans = await translate(text, langTo);
            if (!trans) return;
            barItem.word.hide();
            word = trans.word;
            noticeComment();
        } else {
            word = currentWord.word;
        }
        clipboardy.writeSync(word);
        vscode.window.showInformationMessage(locale["clipboard.message"]);
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
            barItem.candidate.hide();
            barItem.word.show();
            barItem.word.text = `$(pulse) ${locale['wait.message']}...`;        
            let trans = await translate(text, langTo);
            if (!trans) return;
            barItem.word.hide();
            word = trans.word;
            noticeComment();
        } else {
            word = currentWord.word;
        }

        editor.edit(editBuilder => {
            editBuilder.replace(selection, word);
        })
        
        vscode.window.showInformationMessage(`${text.trim().slice(0, 100).trim() + '... '} => ${word.trim().slice(0, 100).trim()}`);
    } catch (error) {
        return vscode.window.showInformationMessage(error.message);
    }
});

let canDisposable = vscode.commands.registerCommand('translates.candidate', async function () {
    let text = selectionText();
    if (text == '' && !currentWord.text) return;

    try {
        if (currentWord.text == '' || (currentWord.text != text && text != '')) {
            barItem.candidate.hide();
            barItem.word.show();
            barItem.word.text = `$(pulse) ${locale['wait.message']}...`;        
            currentWord = await translate(text, langTo);
            if (!currentWord) return;
            barItem.word.hide();
            noticeComment();
        }

        let items = [];
        currentWord.candidate.forEach(c => items.push({ label: c }))
        const chosen = await vscode.window.showQuickPick(items);
        if (chosen) {
            currentWord.word = chosen.label
            clipboardy.writeSync(currentWord.word);
            vscode.window.showInformationMessage(locale["clipboard.message"]);
            barItem.word.text = `${currentWord.text}: ${currentWord.word}`;
            barItem.candidate.show()
        }
    } catch (error) {
        return vscode.window.showInformationMessage(error.message);
    }
});

vscode.workspace.onDidChangeConfiguration(function(event) {
    if(event.affectsConfiguration('google-translate.firstLanguage')) {
        langTo = undefined;
    }
});

function confirm(message, options) {
    return new Promise((resolve, reject) => {
        return vscode.window.showInformationMessage(message, ...options).then(resolve);
    });
}

function prompt(message, defaultVal = '') {
    return new Promise((resolve, reject) => {
        return vscode.window.showInputBox({
            value: defaultVal,
            prompt: message
        }).then(resolve);
    });
}

module.exports = {
    initSetting,
    hoverDisposable,
    tranDisposable,
    switchDisposable,
    copyDisposable,
    replaceDisposable,
    canDisposable,
    switchLangDisposable,
    settingsDisposable
}