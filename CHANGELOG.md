# Change Log
All notable changes to the "Google Translate" extension will be documented in this file.

## [1.2.1] - 2021-05-07
- Update switch target change language to save in setting.
- Added detect language setting command.
- Added swap first and second language command.
- Added target and detect language setting status bar.

## [1.1.6] - 2020-11-01
- Add replace translation and hover translation support multi-selection feature.

## [1.1.5] - 2020-07-13
- Fixed launch extension home page failed at MacOS and Linux.

## [1.1.4] - 2020-06-27
- Add a setting item `maxSizeOfResult` to set the maximum display characters for the translated content and results of the status bar and message box.

## [1.1.3] - 2020-05-13
- Fix issue that the translation result is empty when the first language is not Chinese.
- Add the function of temporarily switching the translation language.
   
## [1.1.2] - 2020-04-23
- Fix the operation and display problems of a large number of text translations.

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