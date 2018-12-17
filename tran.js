const request = require('request-promise').defaults({
    simple: false,
    resolveWithFullResponse: true,
    // proxy:'http://127.0.0.1:8888'
});
const urlencode = require('urlencode');
const iconv = require('iconv-lite');

let tkk = '429175.1243284773'
let Jo = null

async function getTkk() {
    let url = 'https://translate.google.cn/';
    let rsp = await get(url);
    let tkkMat = rsp.body.match(/tkk:'([\d.]+)'/);
    tkk = tkkMat[1];
}

getTkk();

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

function tk(a, tkk) {
    if (null !== Jo)
        var b = Jo;
    else {
        b = Ho(String.fromCharCode(84));
        var c = Ho(String.fromCharCode(75));
        b = [b(), b()];
        b[1] = c();
        b = (Jo = tkk || "") || ""
    }
    var d = Ho(String.fromCharCode(116));
    c = Ho(String.fromCharCode(107));
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

async function get(url) {
    let options = {
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36'
        }
    };

    let rsp = await request.get(options);

    if (rsp.statusCode >= 400) {
        throw 'Translate failed, please check your network.';
    }

    iconv.decode(rsp.body, 'utf-8')

    return rsp;
}

module.exports = async (word) => {
    let lang = {
        from: 'en',
        to: 'zh-CN'
    };

    let matEng = word.match(/[a-zA-Z]/g);
    if (!matEng || matEng.length < word.length / 2) {
        lang = {
            to: 'en',
            from: 'zh-CN'
        }
    }

    let url = `https://translate.google.cn/translate_a/single?client=webapp&sl=${lang.from}&tl=${lang.to}&hl=zh-CN&dt=t&tk=${tk(word, tkk)}&q=${urlencode(word, 'utf-8')}`

    try {
        let rsp = await get(url);
        let tranWord = JSON.parse(rsp.body);
        return tranWord[0][0][0];
    } catch (err) {
        throw 'Translate failed, please check your network.';
    }        
};