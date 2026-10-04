// O'zbek alifbosidagi tutuq belgisining barcha ko'rinishlari
const APOSTROPHES = /['ʻʼ’‘`]/;

/**
 * So'zni skanvord kataklariga ajratadi: O' va G' (har qanday tutuq belgisi bilan)
 * bitta katak hisoblanadi va "'" ko'rinishiga keltiriladi.
 */
export function splitLetters(word: string): string[] {
  const chars = Array.from(word.normalize("NFC"));
  const cells: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const next = chars[i + 1];
    if (/[oOgG]/.test(c) && next !== undefined && APOSTROPHES.test(next)) {
      cells.push(`${c}'`);
      i++;
    } else {
      cells.push(c);
    }
  }
  return cells;
}
