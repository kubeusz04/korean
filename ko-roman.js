/**
 * Korean → Polish transcription (approximate, mirrors pl-hangul.js rules in reverse).
 * Transcription is hidden until the user clicks Korean text.
 */
(function (global) {
  'use strict';

  const INITIALS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const MEDIALS = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  const FINALS = [
    '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ',
    'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];

  /* Vowels — inverse of pl-hangul VOWEL + DIGRAPHS (ja, jo, ju, wa, wo, y→ㅡ, …) */
  const VOWEL = {
    'ㅏ': 'a', 'ㅐ': 'e', 'ㅑ': 'ja', 'ㅒ': 'je', 'ㅓ': 'o', 'ㅔ': 'e',
    'ㅕ': 'jo', 'ㅖ': 'je', 'ㅗ': 'o', 'ㅘ': 'wa', 'ㅙ': 'we', 'ㅚ': 'we',
    'ㅛ': 'jo', 'ㅜ': 'u', 'ㅝ': 'wo', 'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'ju',
    'ㅡ': 'y', 'ㅢ': 'yj', 'ㅣ': 'i'
  };

  /* Consonants — inverse of pl-hangul CONSON + cz/dz/ch → ㅊ/ㅈ/ㅎ */
  const CONSON_INITIAL = {
    'ㄱ': 'g', 'ㄲ': 'k', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'd', 'ㄹ': 'r',
    'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's', 'ㅆ': 'sz', 'ㅇ': '',
    'ㅈ': 'dz', 'ㅉ': 'dź', 'ㅊ': 'cz', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h'
  };

  const CONSON_FINAL = {
    '': '', 'ㄱ': 'k', 'ㄲ': 'k', 'ㄳ': 'k', 'ㄴ': 'n', 'ㄵ': 'n', 'ㄶ': 'n',
    'ㄷ': 't', 'ㄹ': 'l', 'ㄺ': 'k', 'ㄻ': 'm', 'ㄼ': 'l', 'ㄽ': 'l', 'ㄾ': 'l',
    'ㄿ': 'p', 'ㅀ': 'l', 'ㅁ': 'm', 'ㅂ': 'p', 'ㅄ': 'p', 'ㅅ': 't', 'ㅆ': 't',
    'ㅇ': 'ng', 'ㅈ': 't', 'ㅊ': 't', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'k'
  };

  /* pl-hangul: ci→ㅊㅣ, si→ㅅㅣ, zi/dzi→ㅈㅣ, nie→ㄴㅣㅔ */
  const INITIAL_VOWEL = {
    'ㅈㅣ': 'dzi', 'ㅈㅕ': 'dżo', 'ㅈㅖ': 'dże', 'ㅈㅛ': 'dżo', 'ㅈㅠ': 'dżu',
    'ㅈㅏ': 'dża', 'ㅈㅗ': 'dżo', 'ㅈㅜ': 'dżu', 'ㅈㅔ': 'dże', 'ㅈㅓ': 'dżo',
    'ㅊㅣ': 'ci', 'ㅊㅕ': 'czo', 'ㅊㅖ': 'cze', 'ㅊㅛ': 'czo', 'ㅊㅠ': 'czu',
    'ㅊㅏ': 'cza', 'ㅊㅗ': 'czo', 'ㅊㅜ': 'czu', 'ㅊㅔ': 'cze', 'ㅊㅓ': 'czo',
    'ㅅㅣ': 'si', 'ㅅㅕ': 'so', 'ㅅㅖ': 'se', 'ㅅㅛ': 'so', 'ㅅㅠ': 'su',
    'ㄴㅣㅔ': 'nie', 'ㄴㅣ': 'ni'
  };

  const HANGUL_RUN = /~?[\uAC00-\uD7A3]+(?:\s[\uAC00-\uD7A3]+)*/g;
  const HAS_HANGUL = /[\uAC00-\uD7A3]/;

  let clickBound = false;

  function decompose(char) {
    const code = char.charCodeAt(0);
    if (code < 0xAC00 || code > 0xD7A3) return null;
    const offset = code - 0xAC00;
    const fi = offset % 28;
    const mi = Math.floor((offset % 588) / 28);
    const ii = Math.floor(offset / 588);
    return {
      i: INITIALS[ii],
      m: MEDIALS[mi],
      f: FINALS[fi]
    };
  }

  function syllableToPolish(char) {
    const parts = decompose(char);
    if (!parts) return char;

    const combo = parts.i + parts.m;
    if (INITIAL_VOWEL[combo]) {
      return INITIAL_VOWEL[combo] + (CONSON_FINAL[parts.f] || '');
    }

    const initial = CONSON_INITIAL[parts.i] ?? parts.i;
    const vowel = VOWEL[parts.m] ?? parts.m;
    const fin = CONSON_FINAL[parts.f] ?? parts.f;

    return initial + vowel + fin;
  }

  function hangulToPolish(text) {
    if (!text) return '';
    return text
      .split(/(\s+)/)
      .map((part) => {
        if (/^\s+$/.test(part)) return ' ';
        let out = '';
        for (const ch of part) {
          out += syllableToPolish(ch);
        }
        return out;
      })
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function wrapKoWord(display, transcript) {
    if (!transcript) return display;
    return `<span class="ko-word" role="button" tabindex="0" title="Kliknij, aby zobaczyć transkrypcję">${display}<span class="ko-roman">(${transcript})</span></span>`;
  }

  function formatKoreanWithRoman(text) {
    if (!text || text.includes('ko-word')) return text;
    if (!HAS_HANGUL.test(text)) return text;

    return text.replace(HANGUL_RUN, (segment) => {
      const transcript = hangulToPolish(segment.replace(/^~/, ''));
      if (!transcript) return segment;
      return wrapKoWord(segment, transcript);
    });
  }

  function annotateElement(el) {
    if (!el || el.dataset.koRomanDone) return;

    if (!el.querySelector('span.ko-word, input, button, a')) {
      const html = formatKoreanWithRoman(el.textContent);
      if (html !== el.textContent) {
        el.innerHTML = html;
        el.dataset.koRomanDone = '1';
        el.querySelectorAll('.ko-word').forEach((w) => {
          if (w.closest('.match-item, .word-chip')) {
            w.title = 'Double-tap for transcription';
          }
        });
      }
    }
  }

  function bindClickReveal() {
    if (clickBound) return;
    clickBound = true;

    function toggleWord(word) {
      word.classList.toggle('revealed');
    }

    function isInteractiveParent(word) {
      return word.closest('.match-item, .word-chip');
    }

    document.addEventListener('click', (e) => {
      const word = e.target.closest('.ko-word');
      if (!word || isInteractiveParent(word)) return;
      e.stopPropagation();
      toggleWord(word);
    });

    document.addEventListener('dblclick', (e) => {
      const word = e.target.closest('.ko-word');
      if (!word || !isInteractiveParent(word)) return;
      e.stopPropagation();
      e.preventDefault();
      toggleWord(word);
    });

    document.addEventListener('keydown', (e) => {
      const word = e.target.closest('.ko-word');
      if (!word) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        toggleWord(word);
      }
    });
  }

  function annotateKoreanPage() {
    bindClickReveal();

    const forceSelectors = [
      '.example-pl.ko',
      '.example-pl',
      '.flashcard-pl.ko',
      'table.vocab td.ko',
      'table.theory-table td.ko',
      '.pattern-formula .ko',
      '.gender-chip .ko',
      '.summary-item .ko',
      '.fill-sentence.ko'
    ];

    forceSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (HAS_HANGUL.test(el.textContent)) annotateElement(el);
      });
    });

    document.querySelectorAll('.match-item.ko, .word-chip.ko, em.ko, span.ko, strong.ko').forEach((el) => {
      if (HAS_HANGUL.test(el.textContent) && !el.closest('table.vocab')) {
        annotateElement(el);
      }
    });
  }

  function koCell(text) {
    return formatKoreanWithRoman(text);
  }

  global.hangulToPolish = hangulToPolish;
  global.hangulToRoman = hangulToPolish;
  global.formatKoreanWithRoman = formatKoreanWithRoman;
  global.annotateKoreanPage = annotateKoreanPage;
  global.koCell = koCell;
})(typeof window !== 'undefined' ? window : globalThis);
