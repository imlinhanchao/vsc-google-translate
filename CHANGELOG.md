# Change Log
All notable changes to the "Google Translate" extension will be documented in this file.

## [1.1.1] - 2020-01-29
- Update extension description.

## [1.1.0] - 2020-01-29
- Added setting interface to configure target translation language, etc.
- Added function name translation feature.
- Prompts support multiple languages(i18n).
- Fix several known bugs.

## [1.0.10] - 2019-11-18
- Update request library to `got`, to avoid some compatibility issues.

## [1.0.9] - 2019-11-14
- Added internal error prompts for user feedback issues.
  
## [1.0.8] - 2019-09-29
- Remove Request and URLEncode dependencies, use native modules instead, and reduce package size.
- Added the option to automatically switch the target language based on the language of the editor. If the text in the current compiler language is selected, it will be automatically translated into English.

## [1.0.7] - 2019-09-25
- Update limited function trigger conditions to avoid conflicts with VSCode shortcuts.

## [1.0.6] - 2019-09-23
- Fixed the problem that only the translation result of the first sentence is displayed when translating a paragraph of text.
  
## [1.0.5] - 2019-09-23
- Added the function of displaying the translation result of the selected text when hovering.

## [1.0.4] - 2019-08-30
- Add the instruction to directly replace the selected text language translation.
- Update Copy to Clipboard and Candidate function, no need to perform after translation.

## [1.0.3] - 2019-08-28
- Add automatic translation into Chinese based on the selected text language.
  
## [1.0.2] - 2019-01-25
- Add Linux notes.
   
## [1.0.1] - 2018-12-19
- Add shortcut key description.
 
## [1.0.0] - 2018-12-18
- Support Google Translate Chinese-English translation.