const { src, dest, watch, parallel, series } = require("gulp");
const uglify = require("gulp-uglify");
const pug = require("gulp-pug");
const sass = require("gulp-sass");
const connect = require("gulp-connect");
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const mq = require('gulp-group-css-media-queries');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename')
// const yaml = require("js-yaml");
const del = require("del");
// const fs = require("fs");
var isDev;

sass.compiler = require("node-sass");

// LIVE RELOAD //
const LIVERELOAD = (cb) => {
    connect.server({
        root: './dist',
        livereload: true,
        port: 8000,
    });
    cb();
};


const CLEAN = async () => del("dist");

const JS = () => {
    return src("src/**/*.js")
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(dest("dist/scripts"))
        .pipe(connect.reload());
};

const CSS = () => {
    return src(['src/**/*.s+(c|a)ss'])
        .pipe(sass({
            outputStyle: "expanded"
        }).on("error", sass.logError))
        .pipe(autoprefixer(['last 16 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(concat('styles.css'))
        .pipe(sourcemaps.init())
        .pipe(mq())
        .pipe(cssnano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest("dist/css/"))
        .pipe(connect.reload());
};

const HTML = () => {
    return src("src/**/*.pug")
        .pipe(
            pug({
                pretty: true,
            })
        )
        .pipe(dest("dist/"))
        .pipe(connect.reload());
};

const IMAGES = () => {
    return src("src/images/*")
        .pipe(imagemin([
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 })
        ], {
            verbose: true
        }))
        .pipe(dest("dist/img"))
        .pipe(connect.reload());
};

const WATCHERS = () => {
    watch("src/**/*.s+(c|a)ss", { ignoreInitial: false }, CSS);
    watch("src/**/*.js", { ignoreInitial: false }, JS);
    watch("src/**/*.pug", { ignoreInitial: false }, HTML);
};


// exports.default = series(
//     CLEAN,
//     parallel(JS, CSS, HTML, IMAGES),
//     WATCHERS
// );


exports.prod = series(
    CLEAN,
    parallel(JS, CSS, HTML, IMAGES)
);

exports.dev = series(
    LIVERELOAD,
    series(CLEAN, WATCHERS)
);