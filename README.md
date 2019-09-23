# Google Translate Extension

基于 [Google 翻译(cn)](https://translate.google.cn)，无需科学上网，无需 API Key 的翻译扩展。

## Features

包含以下功能：

1. 自动中英互译 `Ctrl + Shift + T`；
2. 翻译并复制结果到剪贴板 `Alt + T`；
3. 展开候选词选择 `Shift + Alt + T`；
3. 翻译并替换 `Ctrl + Alt + T`；

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

### For more information

* [GitHub](https://github.com/imlinhanchao/vsc-google-translate)
* [VSCode Market](https://marketplace.visualstudio.com/items?itemName=hancel.google-translate)
* Icon made by [Pixel perfect](https://www.flaticon.com/authors/pixel-perfect) from www.flaticon.com 

**Enjoy!**
