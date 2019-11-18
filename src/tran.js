const vscode = require('vscode');
const got = require('got');

let tkk = '429175.1243284773';

// Get Tkk value
(async () => {
    let url = 'https://translate.google.cn/';
    let req = await got.get(url);
    let body = req.body;
    let tkkMat = body.match && body.match(/tkk:'([\d.]+)'/);
    tkk = tkkMat ? tkkMat[1] : tkk;
})()

// translate_m_zh-CN.js:formatted Line 8084
function Ho (a) {
    return function() {
        return a
    }
}

function Io(a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
        var d = b.charAt(c + 2);
        d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
        d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
        a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
    }
    return a
}

// translate_m_zh-CN.js:formatted Line 8099 fun Ko
function tk(a, tkk) {
    var b = tkk || ""
    var d = Ho(String.fromCharCode(116));
    var c = Ho(String.fromCharCode(107));
    d = [d(), d()];
    d[1] = c();
    c = "&" + d.join("") + "=";
    d = b.split(".");
    b = Number(d[0]) || 0;
    for (var e = [], f = 0, g = 0; g < a.length; g++) {
        var k = a.charCodeAt(g);
        128 > k ? e[f++] = k : (2048 > k ? e[f++] = k >> 6 | 192 : (55296 == (k & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (k = 65536 + ((k & 1023) << 10) + (a.charCodeAt(++g) & 1023),
        e[f++] = k >> 18 | 240,
        e[f++] = k >> 12 & 63 | 128) : e[f++] = k >> 12 | 224,
        e[f++] = k >> 6 & 63 | 128),
        e[f++] = k & 63 | 128)
    }
    a = b;
    for (f = 0; f < e.length; f++)
        a += e[f],
        a = Io(a, "+-a^+6");
    a = Io(a, "+-3^+b+-f");
    a ^= Number(d[1]) || 0;
    0 > a && (a = (a & 2147483647) + 2147483648);
    a %= 1E6;
    return c + (a.toString() + "." + (a ^ b))
};

function getCandidate(tran) {
    let words = []
    if(tran[1]) words = words.concat(tran[1][0][1])
    if(tran[5]) words = words.concat(tran[5][0][2].map(t => t[0]))
    return words;
}

async function translate(word, lang) {
    let url = `https://translate.google.cn/translate_a/single?client=webapp&sl=${lang.from}&tl=${lang.to}&hl=zh-CN&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&pc=1&otf=1&ssel=0&tsel=0&kc=1&tk=${tk(word, tkk)}&q=${encodeURIComponent(word)}`

    try {
        let req = await got.get(url, {
            json: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36'
            }
        });
        let tranWord = req.body;
        let candidate = getCandidate(tranWord);
        tranWord[0].pop();
        return {
            lang,
            text: word,
            word: tranWord[0].map(t => t[0]).join(''),
            candidate
        };
    } catch (err) {
        throw new Error(`Translate failed, Error message: "${err.message}". Please post an issues for me.`);
    }      
}

module.exports = async (word) => {
    let lang = {
        from: 'auto',
        to: vscode.env.language.indexOf('en') == 0 ? 'zh' : vscode.env.language
    };

    let tran = await translate(word, lang);
    if (tran.word.replace(/\s/g, '') == word.replace(/\s/g, '')) {
        lang.to = 'en';
        tran = await translate(word, lang);
    }
    return tran;
};