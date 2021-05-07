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

let maxSize = vscode.workspace.getConfiguration().get('google-translate.maxSizeOfResult');
let langFrom;
let hoverOpen = false;
let usetimes = 0;
let langTo = undefined;

let barItem = {
    word: vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left),
    candidate: vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left),
    hover: vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right),
    switchFrom: vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right),
    switchHr: vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right),
    switchTo: vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right),
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
    langFrom = cxt.globalState.get('fromLang') || 'auto'
    
    cxt.globalState.update('hover', hoverOpen);

    barItem.switchTo.tooltip = locale['switch.tip'];
    barItem.switchTo.text = vscode.workspace.getConfiguration().get('google-translate.firstLanguage');
    barItem.switchTo.command = 'translates.switch'
    barItem.switchTo.show();

    barItem.switchHr.tooltip = locale['swap.tip'];
    barItem.switchHr.text = '$(arrow-right)';
    barItem.switchHr.command = 'translates.swap';
    barItem.switchHr.show();

    barItem.switchFrom.tooltip = locale['from.tip'];
    barItem.switchFrom.text = langFrom;
    barItem.switchFrom.command = 'translates.detect'
    barItem.switchFrom.show();

    barItem.hover.tooltip = !hoverOpen ? locale['on.tooltip'] : locale['off.tooltip'];
    barItem.hover.text = `$(${(hoverOpen ? 'eye-watch' : 'eye-closed')}) ${hoverOpen ? locale['on.text'] : locale['off.text']}`;
    barItem.hover.command = 'translates.hover'
    barItem.hover.show();

    //noticeComment();
}

function getExecCommand() {
    let cmd = 'start';
    if (process.platform == 'win32') {
        cmd = 'start';
    } else if (process.platform == 'linux') {
        cmd = 'xdg-open';
    } else if (process.platform == 'darwin') {
        cmd = 'open';
    }
    
    return `${cmd} https://marketplace.visualstudio.com/items?itemName=hancel.google-translate`
}

function noticeComment() {
    let notice = context.globalState.get('notice');
    if (!notice && usetimes > 100) {
        confirm(locale['like.extension'], [locale['like.ok'], locale['like.no'], locale['like.later']])
            .then((option) => {
                switch(option) {
                    case locale['like.ok']:
                        open.exec(getExecCommand());
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
            let trans = await translate(editor.document.getText(selection), langTo, langFrom);
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
        let trans = await translate(text, langTo, langFrom);
        if (!trans) return;
        word = trans.word
        candidate = trans.candidate
        noticeComment();
    } catch (error) {
        return vscode.window.showInformationMessage(error.message);
    }

    currentWord = { word, text, candidate };

    barItem.word.tooltip = word;
    if(text.length > maxSize) text = text.trim().slice(0, maxSize).trim() + '... '
    if(word.length > maxSize) word = word.trim().slice(0, maxSize).trim() + '...'
    barItem.word.text = `${text.trim()}: ${word.trim()}`;
    barItem.word.command = 'translates.clipboard'
    
    vscode.window.showInformationMessage(`${text}: ${word}`);
    
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
            if (val === undefined) return;
            langTo = val;
            currentWord = {
                text: '',
                word: '',
                candidate: []
            };
            barItem.switchTo.text = langTo;
            vscode.workspace.getConfiguration().update('google-translate.firstLanguage', langTo, true)
            vscode.window.showInformationMessage(locale['switch.success'] + (val || vscode.workspace.getConfiguration().get('google-translate.firstLanguage')));
        });
});

let fromLangDisposable = vscode.commands.registerCommand('translates.detect', async function () {
    prompt(locale['from.message'], langFrom)
        .then(val => {
            if (val === undefined) return;
            langFrom = val;
            currentWord = {
                text: '',
                word: '',
                candidate: []
            };
            context.globalState.update('fromLang', langFrom);
            barItem.switchFrom.text = langFrom;
            vscode.window.showInformationMessage(locale['from.success'] + langFrom);
        });
});

let swapLangDisposable = vscode.commands.registerCommand('translates.swap', async function () {
    let firstLang = vscode.workspace.getConfiguration().get('google-translate.firstLanguage');
    let secondLang = vscode.workspace.getConfiguration().get('google-translate.secondLanguage');
    barItem.switchTo.text = secondLang;
    vscode.workspace.getConfiguration().update('google-translate.firstLanguage', secondLang, true)
    vscode.workspace.getConfiguration().update('google-translate.secondLanguage', firstLang, true)
    vscode.window.showInformationMessage(locale['swap.success']);
});

let copyDisposable = vscode.commands.registerCommand('translates.clipboard', async function () {
    let text = selectionText(), word = '';
    if (text == '') return;

    try {
        if (currentWord.text == '') {
            barItem.candidate.hide();
            barItem.word.show();
            barItem.word.text = `$(pulse) ${locale['wait.message']}...`;
            let trans = await translate(text, langTo, langFrom);
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
    let length = editor.selections.length;
    let offsets = {};
    for (let i = 0; i < length; i++) {
        let selection = editor.selections[i];
        let text = editor.document.getText(selection), word = '';
    
        try {
            if (currentWord.text == '' || currentWord.text != text) {
                barItem.candidate.hide();
                barItem.word.show();
                barItem.word.text = `$(pulse) ${locale['wait.message']}...`;        
                let trans = await translate(text, langTo, langFrom);
                if (!trans) return;
                barItem.word.hide();
                word = trans.word;
                noticeComment();
            } else {
                word = currentWord.word;
            }

            if(offsets[selection.start.line]) {
                selection.anchor._character += offsets[selection.start.line];
                selection.active._character += offsets[selection.start.line];
            }

            offsets[selection.start.line] = (offsets[selection.start.line] || 0) + word.length - text.length;
            
            editor.edit(editBuilder => {
                editBuilder.replace(selection, word);
            })
            
        } catch (error) {
            return vscode.window.showInformationMessage(error.message);
        }
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
            currentWord = await translate(text, langTo, langFrom);
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
        barItem.switchTo.text = vscode.workspace.getConfiguration().get('google-translate.firstLanguage');
    }
    if (event.affectsConfiguration('google-translate.maxSizeOfResult')) {
        maxSize = vscode.workspace.getConfiguration().get('google-translate.maxSizeOfResult');
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
    fromLangDisposable,
    swapLangDisposable,
    settingsDisposable
}