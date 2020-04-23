# Google Translate Extension

Based on [Google Translate](https://translate.google.cn). No API Key translation extension required.

## Features

1. Language translation `Ctrl + Shift + T`.  
   ![Language translation](./asserts/translates.gif)
2. Translate and copy results to clipboard `Alt + T`.  
   ![Translate and copy results to clipboard](./asserts/clipboard.gif)
3. Expand the translation result candidate word selection box `Shift + Alt + T`.  
   ![Expand the translation result candidate word selection box](./asserts/candidate.gif)   
4. Translate and replace `Ctrl + Alt + T`.  
   ![Translate and replace](./asserts/replace.gif)
5. Hover to translate selected text.  
   ![Hover to translate](./asserts/hover.gif)
6. The target language of translation can be set through the setting.
   ![setting](./asserts/setting.jpg)
   

> Tips: Shortcuts can be modified by going to VSCode's Keyboard Shortcuts (`Ctrl + K Ctrl + S`)

## Notice

Linux systems must have **xsel** installed to support the copy result to clipboard. (Thanks [hawk hu](https://github.com/hawkhu)）

Ubuntu：
```bash
sudo apt install xsel
```

CentOS
```bash
sudo yum install epel-release.noarch
sudo yum install xsel
```

## Release Notes

### 1.1.2
1. Fix the operation and display problems of a large number of text translations.

### 1.1.1
1. Update extension description.

### 1.1.0
1. Added setting interface to configure target translation language, etc.
2. Added function name translation feature.
3. Prompts support multiple languages(i18n).
4. Fix several known bugs.

### 1.0.10
1. Update request library to `got`, to avoid some compatibility issues.

### 1.0.9
1. Added internal error prompts for user feedback issues.

### 1.0.8
1. Remove Request and URLEncode dependencies, use native modules instead, and reduce package size.
2. Added the option to automatically switch the target language based on the language of the editor. If the text in the current compiler language is selected, it will be automatically translated into English.

### 1.0.7
1. Update limited function trigger conditions to avoid conflicts with VSCode shortcuts.

### 1.0.6
1. Fixed the problem that only the translation result of the first sentence is displayed when translating a paragraph of text.

### 1.0.5
1. Added the function of displaying the translation result of the selected text when hovering.

### 1.0.4
1. Add the instruction to directly replace the selected text language translation.
2. Update Copy to Clipboard and Candidate function, no need to perform after translation.

### 1.0.3
1. Add automatic translation into Chinese based on the selected text language.
  
### 1.0.2
1. Add Linux notes.
   
### 1.0.1
1. Add shortcut key description.

### 1.0.0
1. Support Google Translate Chinese-English translation.

---

## For more information

* [GitHub](https://github.com/imlinhanchao/vsc-google-translate)
* [VSCode Market](https://marketplace.visualstudio.com/items?itemName=hancel.google-translate)
* Icon made by [Pixel perfect](https://www.flaticon.com/authors/pixel-perfect) from www.flaticon.com 
* Icon made by <a href="https://www.flaticon.com/authors/google" title="Google">Google</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>

**Enjoy!**
