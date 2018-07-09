let instance = null;

export default class convertService {

  constructor(){
    if(!instance){
      instance = this;
    }
    this.wrongEnToEn;
    this.wrongRuToRu;
    this.translitEnToRu;
    this.translitRuToEn;
    return instance;
  }

  wrongEnToEn(value){
    value = value.toLowerCase();
    value
      .replace(/ыыр/g, 'ssh')
      .replace(/ыр/g, 'sh')
      .replace(/ср/g, 'ch')
      .replace(/ся/g, 'cz')
      .replace(/яр/g, 'zh')
      .replace(/нф/g, 'ya')
      .replace(/нщ/g, 'yo')
      .replace(/нг/g, 'yu')
      .replace(/шу/g, 'ie')
    let result = value.split('');
    let map = {
      а: 'f',
      в: 'd',
      г: 'u',
      д: 'l',
      е: 't',
      з: 'p',
      и: 'b',
      й: 'q',
      к: 'r',
      л: 'k',
      м: 'v',
      н: 'y',
      о: 'j',
      п: 'g',
      р: 'h',
      с: 'c',
      т: 'n',
      у: 'e',
      ф: 'a',
      ц: 'w',
      ч: 'x',
      ш: 'i',
      щ: 'o',
      ы: 's',
      ь: 'm',
      я: 'z',
    }
    return result.map((s)=> s = map[s]).join('') || value
  }

  wrongRuToRu(value){
    value = value.toLowerCase();
    let result = value.split('');
    let map = {
      q: 'й',
      w: 'ц',
      e: 'у',
      r: 'к',
      t: 'е',
      y: 'н',
      u: 'г',
      i: 'ш',
      o: 'щ',
      p: 'з',
      '[': 'х',
      ']': 'ъ',
      a: 'ф',
      s: 'ы',
      d: 'в',
      f: 'а',
      g: 'п',
      h: 'р',
      j: 'о',
      k: 'л',
      l: 'д',
      ';': 'ж',
      "''": 'э',
      '\\' : 'ё',
      z: 'я',
      x: 'ч',
      c: 'с',
      v: 'м',
      b: 'и',
      n: 'т',
      m: 'ь',
      ',': 'б',
      '.': 'ю'
    }
    return result.map((s)=> s = map[s]).join('') || value;
  }

  translitEnToRu(value){
    value = value.toLowerCase();
    let result = value
      .replace(/shh/g, 'щ')
      .replace(/sh/g, 'ш')
      .replace(/ch/g, 'ч')
      .replace(/cz/g, 'ц')
      .replace(/zh/g, 'ж')
      .replace(/ya/g, 'я')
      .replace(/yo/g, 'ё')
      .replace(/yu/g, 'ю')
      .replace(/ie/g, 'ъ')
    result = result.split('');
    let map = {
      e: 'е',
      r: 'р',
      t: 'т',
      u: 'у',
      i: 'и',
      o: 'о',
      p: 'п',
      a: 'а',
      s: 'с',
      d: 'д',
      f: 'ф',
      g: 'г',
      h: 'х',
      j: 'ж',
      k: 'к',
      l: 'л',
      z: 'з',
      c: 'ц',
      v: 'в',
      b: 'б',
      n: 'н',
      m: 'м',
    }
    return result.map((s)=>{
      return  map[s] ? s = map[s] : s = s;
    }).join('') || value

  }

  translitRuToEn(value){
    value = value.toLowerCase();
    let map = {
      е: 'e',
      р: 'r',
      т: 't',
      у: 'u',
      и: 'i',
      о: 'o',
      п: 'p',
      а: 'a',
      с: 's',
      д: 'd',
      ф: 'f',
      г: 'g',
      х: 'h',
      ж: 'j',
      к: 'k',
      л: 'l',
      з: 'z',
      ц: 'c',
      в: 'v',
      б: 'b',
      н: 'n',
      м: 'm',
    }
    let result = value
      .replace(/щ/g, 'shh')
      .replace(/ш/g, 'sh')
      .replace(/ч/g, 'ch')
      .replace(/ц/g, 'cz')
      .replace(/ж/g, 'zh')
      .replace(/я/g, 'ya')
      .replace(/ё/g, 'yo')
      .replace(/ю/g, 'yu')
      .replace(/ъ/g, 'ie')
    result = result.split('');
    return result.map((s)=>{
      return  map[s] ? s = map[s] : s = s;
    }).join('') || value
  }
}
