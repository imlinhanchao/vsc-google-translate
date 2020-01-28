const vscode = require('vscode');
let locale = require('./locale.json');

module.exports = () => {
    let lang = vscode.env.language;
    let langLocale = null;

    try {
        langLocale = require(`./locale.${lang}.json`);
    } catch (error) { 
        lang = lang.split('.')[0];
    }
    
    try {
        langLocale = require(`./locale.${lang}.json`);
    } catch (error) { }
    
    if (langLocale) locale = langLocale;

    return locale;
}