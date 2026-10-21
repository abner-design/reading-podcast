/**
 * 臺灣注音符號引擎 (Zhuyin / Bopomofo Engine)
 * 專為國小學童閱讀推薦平台與喜閱龍 Podcast 設計
 * 結合 pinyin-pro 與標準注音映射表，支援 HTML <ruby> 標籤與即時轉換
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['pinyinPro'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('./pinyin-pro.js'));
  } else {
    root.ZhuyinEngine = factory(root.pinyinPro);
  }
})(typeof self !== 'undefined' ? self : this, function (pinyinPro) {
  'use strict';

  // 聲母對照表
  const INITIALS = {
    'b': 'ㄅ', 'p': 'ㄆ', 'm': 'ㄇ', 'f': 'ㄈ',
    'd': 'ㄉ', 't': 'ㄊ', 'n': 'ㄋ', 'l': 'ㄌ',
    'g': 'ㄍ', 'k': 'ㄎ', 'h': 'ㄏ',
    'j': 'ㄐ', 'q': 'ㄑ', 'x': 'ㄒ',
    'zh': 'ㄓ', 'ch': 'ㄔ', 'sh': 'ㄕ', 'r': 'ㄖ',
    'z': 'ㄗ', 'c': 'ㄘ', 's': 'ㄙ',
    'y': '', 'w': ''
  };

  // 韻母對照表
  const FINALS = {
    'a': 'ㄚ', 'o': 'ㄛ', 'e': 'ㄜ', 'ai': 'ㄞ', 'ei': 'ㄟ', 'ao': 'ㄠ', 'ou': 'ㄡ',
    'an': 'ㄢ', 'en': 'ㄣ', 'ang': 'ㄤ', 'eng': 'ㄥ', 'er': 'ㄦ',
    'i': 'ㄧ', 'ia': 'ㄧㄚ', 'io': 'ㄧㄛ', 'ie': 'ㄧㄝ', 'iao': 'ㄧㄠ', 'iu': 'ㄧㄡ',
    'ian': 'ㄧㄢ', 'in': 'ㄧㄣ', 'iang': 'ㄧㄤ', 'ing': 'ㄧㄥ', 'iong': 'ㄩㄥ',
    'u': 'ㄨ', 'ua': 'ㄨㄚ', 'uo': 'ㄨㄛ', 'uai': 'ㄨㄞ', 'ui': 'ㄨㄟ', 'uan': 'ㄨㄢ',
    'un': 'ㄨㄣ', 'uang': 'ㄨㄤ', 'ong': 'ㄨㄥ',
    'v': 'ㄩ', 've': 'ㄩㄝ', 'van': 'ㄩㄢ', 'vn': 'ㄩㄣ',
    'ue': 'ㄩㄝ'
  };

  // 零聲母與特殊音節完全對照表
  const SPECIALS = {
    'zhi': 'ㄓ', 'chi': 'ㄔ', 'shi': 'ㄕ', 'ri': 'ㄖ',
    'zi': 'ㄗ', 'ci': 'ㄘ', 'si': 'ㄙ',
    'er': 'ㄦ', 'yi': 'ㄧ', 'wu': 'ㄨ', 'yu': 'ㄩ',
    'ye': 'ㄧㄝ', 'yue': 'ㄩㄝ', 'yuan': 'ㄩㄢ', 'yun': 'ㄩㄣ',
    'yin': 'ㄧㄣ', 'ying': 'ㄧㄥ', 'yong': 'ㄩㄥ',
    'you': 'ㄧㄡ', 'yan': 'ㄧㄢ', 'yang': 'ㄧㄤ', 'yao': 'ㄧㄠ', 'ya': 'ㄧㄚ',
    'wa': 'ㄨㄚ', 'wo': 'ㄨㄛ', 'wai': 'ㄨㄞ', 'wei': 'ㄨㄟ',
    'wan': 'ㄨㄢ', 'wen': 'ㄨㄣ', 'wang': 'ㄨㄤ', 'weng': 'ㄨㄥ'
  };

  // 臺灣國小常用詞彙發音校準字典 (Taiwan Mandarin Pronunciation Overrides)
  const TAIWAN_WORDS_OVERRIDE = {
    '喜閱龍': ['ㄒㄧˇ', 'ㄩㄝˋ', 'ㄌㄨㄥˊ'],
    '大樹哥哥': ['ㄉㄚˋ', 'ㄕㄨˋ', 'ㄍㄜ', '˙ㄍㄜ'],
    '什麼': ['ㄕㄣˊ', '˙ㄇㄜ'],
    '角色': ['ㄐㄩㄝˊ', 'ㄙㄜˋ'],
    '給予': ['ㄐㄧˇ', 'ㄩˇ'],
    '主角': ['ㄓㄨˇ', 'ㄐㄩㄝˊ'],
    '妖怪': ['ㄧㄠ', 'ㄍㄨㄞˋ'],
    '小讀者': ['ㄒㄧㄠˇ', 'ㄉㄨˊ', 'ㄓㄜˇ'],
    '圖書館': ['ㄊㄨˊ', 'ㄕㄨ', 'ㄍㄨㄢˇ'],
    '推薦': ['ㄊㄨㄟ', 'ㄐㄧㄢˋ'],
    '精彩': ['ㄐㄧㄥ', 'ㄘㄞˇ'],
    '心得': ['ㄒㄧㄣ', 'ㄉㄜˊ'],
    '喜歡': ['ㄒㄧˇ', 'ㄏㄨㄢ'],
    '神奇': ['ㄕㄣˊ', 'ㄑㄧˊ'],
    '故事': ['ㄍㄨˋ', '˙ㄕ'],
    '秘密': ['ㄇㄧˋ', 'ㄇㄧˋ'],
    '塞滿': ['ㄙㄞ', 'ㄇㄢˇ'],
    '企劃': ['ㄑㄧˋ', 'ㄏㄨㄚˋ']
  };

  /**
   * 單個拼音音節轉為注音符號
   * @param {string} rawPinyin - 純拼音無聲調數字（如 'xiao'）
   * @param {number} num - 聲調數字 0~5 (1為一聲無符號，2為ˊ，3為ˇ，4為ˋ，0或5為輕聲˙)
   */
  function syllableToZhuyin(rawPinyin, num) {
    if (!rawPinyin) return '';
    let p = rawPinyin.toLowerCase().replace(/ü/g, 'v').replace(/u:/g, 'v');
    let toneMark = (num === 0 || num === 5) ? '˙' : (num === 2 ? 'ˊ' : (num === 3 ? 'ˇ' : (num === 4 ? 'ˋ' : '')));

    if (SPECIALS[p]) {
      return (num === 0 || num === 5 ? '˙' : '') + SPECIALS[p] + (num > 1 && num < 5 ? toneMark : '');
    }

    let init = '';
    let rest = p;
    if (p.startsWith('zh') || p.startsWith('ch') || p.startsWith('sh')) {
      init = p.slice(0, 2);
      rest = p.slice(2);
    } else if (/^[bpmfdtnlgkhjqxzcsrywn]/.test(p)) {
      init = p[0];
      rest = p.slice(1);
    }

    // ㄐㄑㄒ 相拼時 u 實為 ㄩ (v)
    if (['j', 'q', 'x'].includes(init)) {
      if (rest === 'u') rest = 'v';
      else if (rest === 'ue') rest = 've';
      else if (rest === 'uan') rest = 'van';
      else if (rest === 'un') rest = 'vn';
    }

    let zhInit = INITIALS[init] || '';
    let zhFinal = FINALS[rest] || rest;
    let res = zhInit + zhFinal;

    if (num === 0 || num === 5) {
      return '˙' + res;
    }
    return res + toneMark;
  }

  /**
   * 將任意文字轉換為含有注音的陣列
   * @param {string} text 
   * @returns {Array<{char: string, zhuyin: string, isZh: boolean}>}
   */
  function textToZhuyinTokens(text) {
    if (!text) return [];
    if (!pinyinPro || !pinyinPro.pinyin) {
      // 降級純字元輸出
      return text.split('').map(c => ({ char: c, zhuyin: '', isZh: false }));
    }

    // 先搜尋臺灣特製詞庫
    const tokens = [];
    let i = 0;
    while (i < text.length) {
      let matched = false;
      for (const word of Object.keys(TAIWAN_WORDS_OVERRIDE)) {
        if (text.startsWith(word, i)) {
          const zhList = TAIWAN_WORDS_OVERRIDE[word];
          for (let j = 0; j < word.length; j++) {
            tokens.push({
              char: word[j],
              zhuyin: zhList[j] || '',
              isZh: true
            });
          }
          i += word.length;
          matched = true;
          break;
        }
      }
      if (matched) continue;

      const singleChar = text[i];
      const items = pinyinPro.pinyin(singleChar, { type: 'all', toneType: 'num' });
      if (items && items.length > 0) {
        const it = items[0];
        if (it.isZh) {
          const cleanPy = (it.pinyin || '').replace(/[0-9]/g, '');
          const zh = syllableToZhuyin(cleanPy, it.num);
          tokens.push({ char: singleChar, zhuyin: zh, isZh: true });
        } else {
          tokens.push({ char: singleChar, zhuyin: '', isZh: false });
        }
      } else {
        tokens.push({ char: singleChar, zhuyin: '', isZh: false });
      }
      i++;
    }
    return tokens;
  }

  /**
   * 將中文轉換為標準 HTML5 <ruby> 標籤
   * 範例: 喜閱龍 -> <ruby>喜<rt>ㄒㄧˇ</rt></ruby><ruby>閱<rt>ㄩㄝˋ</rt></ruby><ruby>龍<rt>ㄌㄨㄥˊ</rt></ruby>
   * @param {string} text 
   * @returns {string} HTML 字串
   */
  function toRubyHtml(text) {
    if (!text) return '';
    const tokens = textToZhuyinTokens(text);
    return tokens.map(tok => {
      if (tok.isZh && tok.zhuyin) {
        return `<ruby class="zhuyin-char">${escapeHtml(tok.char)}<rt class="zhuyin-rt">${escapeHtml(tok.zhuyin)}</rt></ruby>`;
      } else {
        if (tok.char === '\n') return '<br>';
        return escapeHtml(tok.char);
      }
    }).join('');
  }

  /**
   * 將純文字加上注音純文字展示（例如用於排版）
   * 範例: 喜閱龍 -> 喜(ㄒㄧˇ) 閱(ㄩㄝˋ) 龍(ㄌㄨㄥˊ)
   */
  function toTextWithZhuyin(text) {
    if (!text) return '';
    const tokens = textToZhuyinTokens(text);
    return tokens.map(tok => {
      if (tok.isZh && tok.zhuyin) {
        return `${tok.char}(${tok.zhuyin})`;
      }
      return tok.char;
    }).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 常用注音符號列表 (方便國小低年級點選輸入)
  const ZHUYIN_ALPHABET = [
    'ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ',
    'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ',
    'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ', 'ㄧ', 'ㄨ', 'ㄩ',
    'ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ',
    'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ', 'ˊ', 'ˇ', 'ˋ', '˙'
  ];

  // 國小學童常用好書特色關鍵字（帶注音提示，助學童寫作靈感）
  const FEATURE_TAGS = [
    { text: '幽默好笑', zhuyin: 'ㄧㄡ ㄇㄛˋ ㄏㄠˇ ㄒㄧㄠˋ', emoji: '😄' },
    { text: '冒險刺激', zhuyin: 'ㄇㄠˋ ㄒㄧㄢˇ ㄘˋ ㄐㄧ', emoji: '⚔️' },
    { text: '感動溫馨', zhuyin: 'ㄍㄢˇ ㄉㄨㄥˋ ㄨㄣ ㄒㄧㄣ', emoji: '💖' },
    { text: '學到知識', zhuyin: 'ㄒㄩㄝˊ ㄉㄠˋ ㄓ ㄕˋ', emoji: '💡' },
    { text: '插圖超美', zhuyin: 'ㄔㄚ ㄊㄨˊ ㄔㄠ ㄇㄟˇ', emoji: '🎨' },
    { text: '情節精彩', zhuyin: 'ㄑㄧㄥˊ ㄐㄧㄝˊ ㄐㄧㄥ ㄘㄞˇ', emoji: '✨' },
    { text: '出乎意料', zhuyin: 'ㄔㄨ ㄏㄨ ㄧˋ ㄌㄧㄠˋ', emoji: '😲' },
    { text: '學會勇敢', zhuyin: 'ㄒㄩㄝˊ ㄏㄨㄟˋ ㄩㄥˇ ㄍㄢˇ', emoji: '🦁' },
    { text: '交到朋友', zhuyin: 'ㄐㄧㄠ ㄉㄠˋ ㄆㄥˊ ㄧㄡˇ', emoji: '🤝' },
    { text: '奇幻魔法', zhuyin: 'ㄑㄧˊ ㄏㄨㄢˋ ㄇㄛˊ ㄈㄚˇ', emoji: '🪄' }
  ];

  return {
    syllableToZhuyin,
    textToZhuyinTokens,
    toRubyHtml,
    toTextWithZhuyin,
    ZHUYIN_ALPHABET,
    FEATURE_TAGS
  };
});
