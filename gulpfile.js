const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const fileinclude = require('gulp-file-include');
// const ttf2woff2 = require('gulp-ttf2woff2');

function styles() {
  return src('./app/scss/main.scss')
    .pipe(scss())
    .pipe(dest('./app/css'))
    .pipe(browserSync.stream());
}

function includeHTML() {
  return src(['./app/pages/*.html'])
    .pipe(fileinclude({
      prefix: "@@",
      basepath: "@file"
    }))
    .pipe(dest("./app"));
}

function watchProject() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/pages/**/*', 'app/components/**/*'])
    .on('change', includeHTML);
  watch(['app/*.html', 'app/js/**/*', 'app/fonts/**/*'])
    .on('change', browserSync.reload);
}

function initBrowserSync() {
  browserSync.init({
    server: './app',
  });
}

function cleanDist() {
  return src("dist", { allowEmpty: true }).pipe(clean());
}

function build() {
  return src(
    [
      "./app/css/main.css",
      "./app/js/main.js",
      "./app/**/*.html",
      "./app/fonts/**/*"
    ],
    { base: "app", encoding: false }
  )
    .pipe(dest('dist'));
}

function minimizeImages() {
  return src(
    ['./app/img/*'],
    { base: './app/img', encoding: false }
  )
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(dest('dist/img'));
}

// function optiFonts() {
//   return src(
//     ['./app/fonts/**/*.ttf'],
//     { base: './app/fonts', encoding: false }
//   )
//     .pipe(ttf2woff2())
//     .pipe(dest('./app/fonts'));
// }

exports.styles = styles;
exports.watchProject = watchProject;
exports.build = series(cleanDist, build, minimizeImages);

exports.default = parallel(includeHTML, styles, initBrowserSync, watchProject);