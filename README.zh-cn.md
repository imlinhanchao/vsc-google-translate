[English Readme](README.md) / 简体中文说明 / [繁體中文說明](README.zh-tw.md)

# Google Translate Extension

基于 [Google 翻译(cn)](https://translate.google.cn)，无需科学上网，无需 API Key 的翻译扩展。

❤ [Sponsor me](https://www.paypal.me/imlinhanchao) / [赞助开发者](http://sponsor.hancel.org/)

## Features

包含以下功能：

1. 自动语言互译 `Ctrl + Shift + T`；  
   ![自动中英互译](./asserts/translates.gif)
2. 翻译并复制结果到剪贴板 `Alt + T`；  
   ![翻译并复制结果到剪贴板](./asserts/clipboard.gif)
3. 展开候选词选择 `Shift + Alt + T`；  
   ![展开候选词选择](./asserts/candidate.gif)   
4. 翻译并替换 `Ctrl + Alt + T`；  
   ![翻译并替换](./asserts/replace.gif)
5. 悬停翻译选中文字；  
   ![悬停翻译选中文字](./asserts/hover.gif)
6. 设置界面，可设置翻译的目标语言
   ![设置界面](./asserts/setting.jpg)
7. 暂时切换到其他翻译语言，直到关闭工作空间或修改配置。 `google-translate.switch`
   
> Tips: 快捷键修改可以到 VSCode 的键盘快捷方式 ( `Ctrl + K Ctrl + S` ) 修改。

## Notice

Linux 用户须安装 xsel，用于支援剪贴板功能。（感谢 [hawk hu](https://github.com/hawkhu) 的提醒）

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

### 1.2.3
1. 更新剪贴板使用 VSCode Clipboard API。

### 1.2.2
1. 添加一个可选项，减少消息框提示。

### 1.2.1
1. 更新切换目标更改语言以保存设置。
2. 添加了检测语言设置命令。
3. 添加交换第一和第二语言命令。
4. 添加目标语言和检测语言设置状态栏。

### 1.1.6
1. 加入替换翻译与悬停翻译支持多选区功能。

### 1.1.5
1. 修复了无法自动在 MacOS 和 Linux 上启动扩展名主页的问题。

### 1.1.4
1. 添加设置项目 `maxSizeOfResult` 设置状态栏和消息框翻译内容与结果的最大显示字符。

### 1.1.3
1. 修复第一语言非中文时，翻译结果为空的问题。
2. 加入可临时切换翻译语言的功能。

### 1.1.2
1. 修复一些大量文本翻译的操作与显示问题。

### 1.1.1
1. 更新扩展描述；

### 1.1.0
1. 新增设置界面，可配置目标翻译语言等；
2. 新增函数名翻译功能；
3. 提示语支持多语言；
4. 修正若干已知 Bug；

### 1.0.10
1. 更新请求库为 got, 避免一些兼容性问题。

### 1.0.9
1. 加入内部错误提示，方便用户反馈 Issue。

### 1.0.8
1. 移除 Request 和 URLEncode 依赖，改用原生模块，减少包大小。
2. 加入自动根据编辑器语言切换目标语言，若选中为当前编译器语言的文字，则自动改为将其翻译为英文。

### 1.0.7
1. 更新限定功能触发条件，避免与 VSCode 的快捷键冲突。

### 1.0.6
1. 修复翻译一段文字时，只显示第一句的翻译结果的问题。

### 1.0.5
1. 加入悬停显示选中文本翻译结果功能。

### 1.0.4
1. 加入将所选文字语言翻译直接替换的指令。
2. 更新复制到剪切板和候选词功能，无需在翻译后才能执行。

### 1.0.3
1. 加入根据所选文字语言自动翻译为中文；
  
### 1.0.2
1. 加入 Linux 注意事项说明；
   
### 1.0.1
1. 加入快捷键说明；

### 1.0.0
1. 支援 Google 翻译中英互译；

---

## For more information

* [GitHub](https://github.com/imlinhanchao/vsc-google-translate)
* [VSCode Market](https://marketplace.visualstudio.com/items?itemName=hancel.google-translate)
* Icon made by [Pixel perfect](https://www.flaticon.com/authors/pixel-perfect) from www.flaticon.com 
* Icons made by <a href="https://www.flaticon.com/authors/google" title="Google">Google</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>

**Enjoy!**
