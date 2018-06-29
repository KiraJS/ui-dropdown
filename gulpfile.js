'use strict';
const gulp = require('gulp');
const concat = require('gulp-concat');
const stylus = require('gulp-stylus');
const pug = require('gulp-pug');
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const jpegoptim = require('imagemin-jpegoptim');
const pngquant = require('imagemin-pngquant');
const cssmin = require('gulp-cssmin');
const jsonmin = require('gulp-jsonminify');

const rename = require('gulp-rename');
const runSequence = require('gulp-run-sequence');
const uglify = require('gulp-uglify');
const sitemap = require('gulp-sitemap');
const typograf = require('gulp-typograf');
const gutil = require('gulp-util');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
const babel = require('gulp-babel');
const gulpif = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const jsdoc = require('gulp-jsdoc3');

const merge = require('merge2');
const rollup = require('rollup-stream');
const rootImport = require('rollup-plugin-root-import');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const KarmaServer = require('karma').Server;

const cacheBust = require('./custom_modules/cache-bust.js');
const buildNews = require('./custom_modules/newsroom.js');
const getPrices = require('./custom_modules/get-prices.js');

const fs = require('fs');
const path = require('path');
const glob = require('glob');

var proxy = require('proxy-middleware');
var url = require('url');

const BROWSERS = ['last 2 versions', 'ie >= 10'];
const BABEL_OPTIONS = {
  presets: [
    [
      'env',
      {
        targets: {
          browsers: BROWSERS
        }
      }
    ]
  ],
  plugins: ['transform-object-assign', 'transform-remove-export']
};

const SOURCE_DIR = 'source/';
const BUILD_DIR = 'build/';
const DOCS_DIR = 'docs/';
const TESTS_DIR = 'tests/';
const PRICES_KIT_DIR = './node_modules/@selectel/prices-kit/dist/prices-kit.js';

let env = gutil.env.env || 'prod';
let prices = {
  storage: 1,
  managed: 5000,
  ddos: 5000,
  monitoring: 150,
  vols: 7000,
  colocation: 2200,
  vpc: 7.3,
  rack: 20000,
  remote: 100,
  dedicated: 2700,
  firewall: 4500,
  vrrp: 3000
};

process.on('unhandledRejection', e => {
  console.error(e);
  process.exit(-1);
});

function getLangDir(lang) {
  if (lang === 'ru') return '';
  return lang + '/';
}

// Build pages
function filterPagesByLang(pages, lang) {
  return pages.filter(item => {
    let data = fs.readFileSync(item, 'utf8');
    let json = data.split('}')[0].substr(3) + '}';

    try {
      let obj = JSON.parse(json);
      return obj.lang.indexOf(lang) > -1;
    } catch (e) {
      throw 'JSON error in ' + item;
    }
  });
}

function buildPageMarkup(page, lang) {
  return gulp
    .src(page)
    .pipe(gulpif(env === 'dev', plumber()))
    .pipe(
      pug({
        basedir: SOURCE_DIR + 'components/',
        locals: { lang, prices, rootPath: lang === 'ru' ? '' : '/' + lang }
      })
    )
    .pipe(
      typograf({
        locale: [lang === 'en' ? 'en-US' : lang],
        disableRule: [
          'ru/other/phone-number',
          'common/symbols/cf',
          'ru/nbsp/groupNumbers'
        ]
      })
    )
    .pipe(
      rename({
        basename: 'index'
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true
      })
    )
    .pipe(
      gulp.dest(
        path.resolve(
          BUILD_DIR + getLangDir(lang),
          path.relative(SOURCE_DIR + '/pages', path.dirname(page))
        )
      )
    );
}

function buildPageScripts(dir, lang) {
  let jsDir = dir + '/js';

  return merge(
    gulp.src(jsDir + '/i18n/' + lang + '.js'),
    rollup({
      input: jsDir + '/index.js',
      format: 'iife',
      sourcemap: true,
      plugins: [
        rootImport({
          root: __dirname + '/source',
          extensions: '.js'
        })
      ]
    })
      .pipe(source('script.js'))
      .pipe(buffer())
  )
    .pipe(gulpif(env === 'dev', sourcemaps.init({ loadMaps: true })))
    .pipe(gulpif(env === 'dev', plumber()))
    .pipe(concat('script.js'))
    .pipe(babel(BABEL_OPTIONS))
    .pipe(uglify())
    .pipe(gulpif(env === 'dev', sourcemaps.write()))
    .pipe(
      gulp.dest(
        path.resolve(
          BUILD_DIR + getLangDir(lang),
          path.relative(SOURCE_DIR + '/pages', jsDir)
        )
      )
    );
}

function buildPageStyles(dir, lang) {
  let styleDir = dir + '/style';
  return gulp
    .src(styleDir + '/[^_]*.styl')
    .pipe(gulpif(env === 'dev', plumber()))
    .pipe(
      stylus({
        include: [SOURCE_DIR + 'stylus/', SOURCE_DIR + 'components/'],
        define: { lang }
      })
    )
    .pipe(
      rename({
        basename: 'style'
      })
    )
    .pipe(
      autoprefixer({
        browsers: BROWSERS,
        cascade: false
      })
    )
    .pipe(cssmin())
    .pipe(
      gulp.dest(
        path.resolve(
          BUILD_DIR + getLangDir(lang),
          path.relative(SOURCE_DIR + '/pages', styleDir)
        )
      )
    );
}

function buildPages(done, lang) {
  let pages = glob.sync(SOURCE_DIR + '/pages/**/!(_)*.pug');
  pages = filterPagesByLang(pages, lang);
  let promises = [];

  pages.forEach(function(page) {
    let dir = path.dirname(page);
    let arr = [];

    arr.push(
      new Promise((resolve, reject) => {
        let stream = buildPageMarkup(page, lang);
        stream.on('finish', resolve);
        stream.on('error', reject);
      })
    );

    if (fs.existsSync(dir + '/js/index.js')) {
      arr.push(
        new Promise((resolve, reject) => {
          let stream = buildPageScripts(dir, lang);
          stream.on('finish', resolve);
          stream.on('error', reject);
        })
      );
    }

    arr.push(
      new Promise((resolve, reject) => {
        let stream = buildPageStyles(dir, lang);
        stream.on('finish', resolve);
        stream.on('error', reject);
      })
    );

    promises.push(Promise.all(arr));
  });

  if (lang === 'ru') {
    promises.push(
      new Promise((resolve, reject) => {
        let stream = buildPageScripts(
          SOURCE_DIR + '/pages/about/newsroom',
          lang
        );
        stream.on('finish', resolve);
        stream.on('error', reject);
      })
    );

    promises.push(
      new Promise((resolve, reject) => {
        let stream = buildPageStyles(
          SOURCE_DIR + '/pages/about/newsroom',
          lang
        );
        stream.on('finish', resolve);
        stream.on('error', reject);
      })
    );
  }

  Promise.all(promises)
    .then(() => done())
    .catch(e => {
      done(e);
      process.exit(-1);
    });
}

// Build pages with scripts and styles
gulp.task('pages', function(done) {
  buildPages(done, 'ru');
});

gulp.task('pages-en', function(done) {
  buildPages(done, 'en');
});

// Build common styles
gulp.task('common-css', function() {
  return gulp
    .src([SOURCE_DIR + 'stylus/style.styl'])
    .pipe(gulpif(env === 'dev', plumber()))
    .pipe(stylus())
    .pipe(
      rename({
        basename: 'common'
      })
    )
    .pipe(
      autoprefixer({
        browsers: BROWSERS,
        cascade: false
      })
    )
    .pipe(cssmin())
    .pipe(gulp.dest(BUILD_DIR + '/style/'))
    .pipe(browserSync.stream());
});

// Build page 404
gulp.task('notfound', function() {
  return gulp
    .src(SOURCE_DIR + 'pages/404/404.pug')
    .pipe(
      pug({
        basedir: SOURCE_DIR + 'components/',
        locals: { lang: 'ru', rootPath: '' }
      })
    )
    .pipe(
      rename({
        dirname: '',
        basename: '404'
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true
      })
    )
    .pipe(gulp.dest(BUILD_DIR));
});

// Build json data
gulp.task('data', function() {
  return gulp
    .src(SOURCE_DIR + 'data/**/*.json')
    .pipe(jsonmin())
    .pipe(gulp.dest(BUILD_DIR + '/data'))
    .pipe(browserSync.stream());
});

// Build newsroom
gulp.task('newsroom', done => {
  buildNews(done, {
    sourcePath: 'selectel_news',
    newsTemplate: 'build/about/newsroom/news/index.html',
    newsPostTemplate: 'build/about/newsroom/news/news-post/index.html',
    pressTemplate: 'build/about/newsroom/press/index.html',
    pressPostTemplate: 'build/about/newsroom/press/press-post/index.html'
  });
});

gulp.task('prices-kit', function() {
  gulp
    .src([PRICES_KIT_DIR, './prices-kit-paths-settings.js'])
    .pipe(concat('prices-kit.js'))
    .pipe(gulp.dest(BUILD_DIR + '/js/prices-kit/'));
});

gulp.task('common-js', function() {
  ['ru', 'en'].forEach(lang => {
    gulp
      .src([
        SOURCE_DIR + 'js/i18n/' + lang + '.js',
        SOURCE_DIR + 'components/**/js/i18n/' + lang + '.js'
      ])
      .pipe(gulpif(env === 'dev', plumber()))
      .pipe(concat(lang + '.js'))
      .pipe(babel(BABEL_OPTIONS))
      .pipe(uglify())
      .pipe(gulp.dest(BUILD_DIR + '/js/i18n/'));
  });

  return rollup({
    input: SOURCE_DIR + 'js/common.js',
    format: 'es',
    sourcemap: true,
    plugins: [
      rootImport({
        root: __dirname + '/source',
        extensions: '.js'
      })
    ]
  })
    .pipe(source('common.js'))
    .pipe(buffer())
    .pipe(gulpif(env === 'dev', sourcemaps.init({ loadMaps: true })))
    .pipe(gulpif(env === 'dev', plumber()))
    .pipe(babel(BABEL_OPTIONS))
    .pipe(uglify())
    .pipe(gulpif(env === 'dev', sourcemaps.write()))
    .pipe(gulp.dest(BUILD_DIR + '/js/'))
    .pipe(browserSync.stream());
});

// Run webserver
gulp.task('webserver', function() {
  let proxyOptions = url.parse('https://selectel.ru/api');
  proxyOptions.route = '/api';

  browserSync.init({
    server: {
      baseDir: BUILD_DIR,
      middleware: [proxy(proxyOptions)]
    },
    port: 8080
  });
});

// Copy archive promo-pages
gulp.task('copy-special', function() {
  return gulp
    .src(SOURCE_DIR + 'pages/special/**/*')
    .pipe(gulp.dest(BUILD_DIR + '/special/'));
});

// Run watch
gulp.task('watch', function() {
  //Watch HTML
  gulp.watch(
    [SOURCE_DIR + 'pages/**/!(_)*.pug', '!source/pages/404/404.pug'],
    function(obj) {
      let path = obj.path.substr(process.cwd().length + 1);
      console.log('Build HTML from: /' + path);

      buildPageMarkup(obj.path, 'en');
      return buildPageMarkup(obj.path, 'ru').pipe(browserSync.stream());
    }
  );

  //Watch CSS
  gulp.watch(
    [SOURCE_DIR + 'pages/**/*.styl', '!source/pages/404/**/*.styl'],
    function(obj) {
      let dir = obj.path
        .substr(0, obj.path.lastIndexOf('/style'))
        .substr(process.cwd().length + 1);
      console.log('Build CSS from: /' + dir + '/style/');

      buildPageStyles(dir, 'en');
      return buildPageStyles(dir, 'ru').pipe(browserSync.stream());
    }
  );

  //Watch JS
  gulp.watch(
    [SOURCE_DIR + 'pages/**/*.js', '!source/pages/special/**/*.js'],
    function(obj) {
      let dir = obj.path
        .substr(0, obj.path.lastIndexOf('/js'))
        .substr(process.cwd().length + 1);
      console.log('Build JS from: /' + dir + '/js/');

      buildPageScripts(dir, 'en');
      return buildPageScripts(dir, 'ru').pipe(browserSync.stream());
    }
  );

  // Watch common files
  gulp.watch(
    [SOURCE_DIR + 'stylus/**/*.styl', SOURCE_DIR + 'components/**/*.styl'],
    ['common-css']
  );
  gulp.watch(
    [SOURCE_DIR + 'js/**/*.js', SOURCE_DIR + 'components/**/*.js'],
    ['common-js']
  );
  gulp.watch(SOURCE_DIR + 'assets/img/**/*', ['img']);
  gulp.watch(SOURCE_DIR + 'assets/fonts/**/*', ['fonts']);
  gulp.watch(SOURCE_DIR + 'media/**/*', ['media']);
  gulp.watch(SOURCE_DIR + 'root/**/*', ['root']);
  gulp.watch(SOURCE_DIR + 'pages/404/**/*', ['notfound']);
  gulp.watch(SOURCE_DIR + 'data/**/*', ['data']);
});

// Clean build directory
gulp.task('clean', function() {
  return gulp
    .src(BUILD_DIR, {
      read: false
    })
    .pipe(clean());
});

// Copy assets
gulp.task('assets', ['fonts', 'img', 'assets-js']);

// Images
gulp.task('img', function() {
  return gulp
    .src(SOURCE_DIR + 'assets/img/**/*')
    .pipe(
      imagemin([
        imagemin.svgo(),
        jpegoptim({
          max: 80
        }),
        pngquant(),
        imagemin.jpegtran(),
        imagemin.optipng()
      ])
    )
    .pipe(gulp.dest(BUILD_DIR + '/assets/img'));
});

// Fonts
gulp.task('fonts', function() {
  return gulp
    .src(SOURCE_DIR + 'assets/fonts/*')
    .pipe(gulp.dest(BUILD_DIR + '/assets/fonts'));
});

// Assets JS
gulp.task('assets-js', function() {
  return gulp
    .src(SOURCE_DIR + 'assets/js/*.js')
    .pipe(gulp.dest(BUILD_DIR + '/assets/js'));
});

// Copy media
gulp.task('media', function() {
  return gulp
    .src(SOURCE_DIR + 'media/**/*')
    .pipe(gulp.dest(BUILD_DIR + '/media'));
});

// Copy root folder files
gulp.task('root', function() {
  return gulp.src(SOURCE_DIR + 'root/**/*').pipe(gulp.dest(BUILD_DIR));
});

// Sitemap task
gulp.task('sitemap', function() {
  let pages = [
    BUILD_DIR + '/**/*.html',
    '!' + BUILD_DIR + '/special/**/*.html',
    '!' + BUILD_DIR + '/exclusive-config/**/*.html',
    '!' + BUILD_DIR + '/cart/**/*.html',
    '!' + BUILD_DIR + '/cart/preorder/**/*.html',
    '!' + BUILD_DIR + '/clients-review/**/*.html',
    '!' + BUILD_DIR + '/clients-review/feedback/**/*.html',
    '!' + BUILD_DIR + '/clients-review/positive/**/*.html',
    '!' + BUILD_DIR + '/clients-review/thanks/**/*.html',
    '!' + BUILD_DIR + '/en/promo/**/*.html',
    '!' + BUILD_DIR + '/en/promo/intel-optane/**/*.html',
    '!' + BUILD_DIR + '/en/promo/intel-scalable/**/*.html',
    '!' + BUILD_DIR + '/promo/**/*.html',
    '!' + BUILD_DIR + '/promo/application-security/**/*.html',
    '!' + BUILD_DIR + '/promo/cloud-vmware/**/*.html',
    '!' + BUILD_DIR + '/promo/cloud/**/*.html',
    '!' + BUILD_DIR + '/promo/discount-dedicated/**/*.html',
    '!' + BUILD_DIR + '/promo/imperva-incapsula/**/*.html',
    '!' + BUILD_DIR + '/promo/intel-cloud-storage/**/*.html',
    '!' + BUILD_DIR + '/promo/intel-e5/**/*.html',
    '!' + BUILD_DIR + '/promo/intel-optane/**/*.html',
    '!' + BUILD_DIR + '/promo/intel-scalable/**/*.html',
    '!' + BUILD_DIR + '/promo/intel-skylake/**/*.html',
    '!' + BUILD_DIR + '/promo/intel-ssd/**/*.html',
    '!' + BUILD_DIR + '/promo/intel-xeon-phi/**/*.html',
    '!' + BUILD_DIR + '/promo/itsumma-osago/**/*.html',
    '!' + BUILD_DIR + '/promo/server-colocation/**/*.html',
    '!' + BUILD_DIR + '/thanks/**/*.html',
    '!' + BUILD_DIR + '/thankyou/**/*.html',
    '!' + BUILD_DIR + '/en/thanks/**/*.html',
    '!' + BUILD_DIR + '/en/promo/application-security/**/*.html',
    '!' + BUILD_DIR + '/en/promo/cloud-vmware/**/*.html',
    '!' + BUILD_DIR + '/en/promo/intel-xeon-phi/**/*.html',
    '!' + BUILD_DIR + '/en/promo/server-colocation/**/*.html'
  ];

  return gulp
    .src(pages, { read: false })
    .pipe(
      sitemap({
        siteUrl: 'https://selectel.ru',
        changefreq: 'weekly',
        mappings: [
          {
            pages: ['index.html'],
            priority: 1
          },
          {
            pages: ['services/**/*.html'],
            priority: 0.9
          }
        ]
      })
    )
    .pipe(gulp.dest(BUILD_DIR));
});

// Calculate and inject md5 hashes for script and style files
gulp.task('cache-bust', function(done) {
  cacheBust(done);
});

// Development task
gulp.task('default', function() {
  env = 'dev';
  gulp.run('watch');
  gulp.run('webserver');
});

// Build task
gulp.task('build', function() {
  return runSequence(
    'clean',
    'prices',
    'prices-kit',
    'common-js',
    'test',
    [
      'common-css',
      'pages',
      'pages-en',
      'data',
      'notfound',
      'assets',
      'media',
      'copy-special'
    ],
    'newsroom',
    ['sitemap', 'cache-bust'],
    'root'
  );
});

// Docs task
gulp.task('docs', function() {
  return runSequence('clean-docs', 'build-docs');
});

gulp.task('build-docs', function(cb) {
  let config = require('./.jsdoc.json');
  gulp
    .src(['README.md', './source/**/*.js'], { read: false })
    .pipe(jsdoc(config, cb));
});

gulp.task('clean-docs', function() {
  return gulp
    .src(DOCS_DIR, {
      read: false
    })
    .pipe(clean());
});

// Get API prices for SEO
gulp.task('prices', function(cb) {
  getPrices(res => {
    prices = res;
    cb();
  });
});

// Tests
gulp.task('test', function(done) {
  return runSequence(
    'clean-tests',
    'build-tests',
    'run-tests',
    'run-tests-en',
    done
  );
});

function runTests(done, lang) {
  new KarmaServer(
    {
      configFile: __dirname + '/karma.conf.js',
      files: [
        { pattern: `build/js/i18n/${lang}.js`, include: true },
        { pattern: 'build/js/common.js', include: true },
        'tests/**/*' + '.' + lang + '.spec.js'
      ]
    },
    exitCode => {
      if (exitCode === 0) {
        done();
      } else {
        process.exit(exitCode);
      }
    }
  ).start();
}

gulp.task('run-tests', done => runTests(done, 'ru'));
gulp.task('run-tests-en', done => runTests(done, 'en'));

gulp.task('build-tests', function(done) {
  let tests = glob.sync(SOURCE_DIR + '/**/*.spec.js');
  let promises = [];

  tests.forEach(function(test) {
    promises.push(
      new Promise((resolve, reject) => {
        let stream = rollup({
          input: test,
          format: 'es',
          plugins: [
            rootImport({
              root: __dirname + '/source',
              extensions: '.js'
            })
          ]
        })
          .pipe(source(path.basename(test)))
          .pipe(buffer())
          .pipe(babel(BABEL_OPTIONS))
          .pipe(
            gulp.dest(
              path.resolve(
                TESTS_DIR,
                path.relative(SOURCE_DIR, path.dirname(test))
              )
            )
          );

        stream.on('finish', resolve);
        stream.on('error', reject);
      })
    );
  });

  Promise.all(promises)
    .then(() => done())
    .catch(e => {
      done(e);
      process.exit(-1);
    });
});

gulp.task('clean-tests', function() {
  return gulp
    .src(TESTS_DIR, {
      read: false
    })
    .pipe(clean());
});

gulp.task('pardot-css', function() {
  return gulp
    .src(path.join(SOURCE_DIR, 'pardot/pardot.styl'))
    .pipe(gulpif(env === 'dev', plumber()))
    .pipe(stylus())
    .pipe(autoprefixer({ browsers: BROWSERS, cascade: false }))
    .pipe(cssmin())
    .pipe(gulp.dest('pardot'))
    .pipe(browserSync.stream());
});

gulp.task('pardot-js', function() {
  return rollup({
    input: path.join(SOURCE_DIR, 'pardot/pardot.js'),
    format: 'iife',
    plugins: [
      rootImport({
        root: __dirname + '/source',
        extensions: '.js'
      })
    ]
  })
    .pipe(source('pardot.js'))
    .pipe(buffer())
    .pipe(gulpif(env === 'dev', plumber()))
    .pipe(babel(BABEL_OPTIONS))
    .pipe(uglify())
    .pipe(gulp.dest('pardot'));
});

gulp.task('pardot', ['pardot-css', 'pardot-js']);
