/**
 * Created by artembazhin on 18.08.17.
 */
module.exports = function(callback, _config) {
  'use strict';
  let md5File = require('md5-file');
  let fs = require('fs');
  let path = require('path');
  let glob = require('glob');
  let cheerio = require('cheerio');

  let config = {
    path: './build/',
    query: 'v',
    log: false
  };

  if (_config) config = Object.assign(config, _config);

  const ROOT = path.resolve(process.cwd(), config.path);
  let hashes = {};
  let htmlArray = glob.sync(path.resolve(ROOT, './**/*.html'));

  htmlArray.forEach(function(html) {
    processHtml(html);
  });

  if (config.log) {
    console.log('Hash values:');
    console.log(hashes);
  }

  callback();

  function processHtml(filePath) {
    let data = fs.readFileSync(filePath, 'utf8');
    let $ = cheerio.load(data, { decodeEntities: false });

    $('link[type="text/css"][rel="stylesheet"]').each(function(i, elem) {
      let href = $(this).attr('href');

      if (href.indexOf('.css') < 0) return;
      href = href.substring(0, href.indexOf('.css') + 4);

      let hash = getFileHash(getResolvedPath(filePath, href));
      $(this).attr('href', href + '?' + config.query + '=' + hash);
    });

    $('script[type="text/javascript"][src]').each(function(i, elem) {
      let href = $(this).attr('src');

      if (href.indexOf('.js') < 0) return;
      href = href.substring(0, href.indexOf('.js') + 3);

      let hash = getFileHash(getResolvedPath(filePath, href));
      $(this).attr('src', href + '?' + config.query + '=' + hash);
    });

    fs.writeFileSync(filePath, $.html(), 'utf8');
  }

  function getResolvedPath(filePath, href) {
    if (href[0] !== '/') {
      return path.resolve(
        filePath.substring(0, filePath.lastIndexOf('/')),
        href
      );
    } else {
      return path.resolve(ROOT, href.substr(1));
    }
  }

  function getFileHash(filePath) {
    if (hashes[filePath]) return hashes[filePath];

    try {
      hashes[filePath] = md5File.sync(filePath);
    } catch (e) {
      if (config.log) {
        console.log('Failed to read ' + filePath);
        hashes[filePath] = '';
      }
    }

    return hashes[filePath];
  }
};
