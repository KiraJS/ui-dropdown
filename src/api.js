'use strict';

const express = require( 'express' );
const app = express();
const fs = require( "fs" );

app.use( express.static( 'static' ) );

app.get( '/', function ( req, res ) {

  fs.readFile(__dirname + "/static/" + "index.html", 'utf8', function ( err, data ) {
    res.end( data );
  });

});

app.get( '/users', function ( req, res ) {

  const querySearch = req.query.search;
  if ( querySearch ) {
    fs.readFile( __dirname + "/static/" + "users.json", 'utf8', function ( err, data ) {
      let correctQuery = querySearch;
      const queryesWithCorrection = {
        wrongEnToEn: wrongEnToEn( querySearch ),
        wrongRuToRu: wrongRuToRu( querySearch ),
        translitEnToRu: translitEnToRu( querySearch ),
        translitRuToEn: translitRuToEn( querySearch )
      };
      for ( let key in queryesWithCorrection ) {
        if ( data.indexOf(queryesWithCorrection[key]) !== -1 ) correctQuery = queryesWithCorrection[key];
      }
      data = JSON.parse( data );
      let filteredData = data.filter( ( item ) => {
        return item.domain.toLowerCase().indexOf( correctQuery ) !== -1;
      });
      res.end( JSON.stringify( filteredData ) );
    });
  }
  else {
    fs.readFile( __dirname + "/static/" + "users.json", 'utf8', function ( err, data ) {
      res.end( data );
    });
  }

});

function wrongEnToEn( value ){
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

function wrongRuToRu( value ){
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

function translitEnToRu( value ){
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

function translitRuToEn( value ){
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

const server = app.listen( 3000, function () {

  console.log("Server listening at http://3000");

});