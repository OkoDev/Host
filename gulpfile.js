const project = require("path").basename(__dirname);
const source = "assets";
// const source = require("path").resolve(__dirname,'./assets');
const fs = require('fs');

const {src, dest, parallel, series} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    prefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'),// сборщик медиа запросов
    clean_css = require('gulp-clean-css'),
    uglify = require('gulp-uglify-es').default,
    scss = require('gulp-sass'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),// todo написать проверку
    webpcss = require('gulp-webpcss'),
    webphtml = require('gulp-webp-html'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    fonter = require('gulp-fonter'),
    del = require('del');
//reload = browsersync.reload;

let path = {
    build: {
        html: project + '/',
        css: project + '/css/',
        js: project + '/js/',
        img: project + '/img/',
        fonts: project + '/fonts/',
    },
    src: {
        html: [source + '/*.html', "!" + source + '/_*.html'],
        css: source + '/scss/**/*.scss',
        js: source + '/js/*.js',
        img: source + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
        fonts: source + '/fonts/*.ttf'
    },
    watch: {
        html: source + '/**/*.html',
        css: source + '/**/*.*scss',
        js:  source + '/**/*.js',
        img: source + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    },
    clean: './' + project + '/',
}

browserSync = (p) => {
    browsersync.init({
        server: {
            baseDir: './' + project + '/'
        },
        // tunnel: 'oko-dev',  // Attempt to use the URL https://yousutename.loca.lt
        // proxy: "oko-web-dev.dev",
        port: 3000,
        notify: false
    })
}

html = (p) => src(path.src.html)
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())


css = (p) => src(path.src.css)
    .pipe(sourcemaps.init())
    .pipe(
        scss({
            outputStyle: 'compressed',
            sourceMap: true,
            errLogToConsole: true
        })
    )
    .pipe(
        group_media()
    )
    .pipe(
        prefixer({
            overrideBrowserlist: ['last 5 versions'],
            cascade: true
        })
    )
    .pipe(concat('bundle.css'))
    .pipe(
        webpcss({
            webpClass: '.webp',
            noWebpClass: '.no-webp'
        }))
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
        rename({
            extname: '.min.css'
        })
    )
    .pipe( sourcemaps.write())
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())

js = (p) => src(path.src.js)
    .pipe(concat('main.js'))
    .pipe(dest(path.build.js))
    .pipe(
        uglify()
    )
    .pipe(
        rename({
            extname: '.min.js'
        })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())


images = (p) => src(path.src.img)
    .pipe(
        webp({
            quality: 70
        })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
        imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3 // 0 to 7
        })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())


fonts = (p) => {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts))
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
}

gulp.task('otf2ttf', () => src([source + '/fonts/*.otf'])
    .pipe(fonter({
        formats: ['ttf']
    }))
    .pipe(dest(source + '/fonts/'))
)

fontsStyle = (p) => {

    let file_content = fs.readFileSync(source + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source + '/scss/fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname = '';
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}
function cb() { }

watchFiles = (p) => {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

clean = (p) => del(path.clean);

let build = gulp.series(clean, gulp.parallel(html, css, images, fonts, js), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.fontsStyle = fontsStyle;
exports.build = build;
exports.watch = watch;
exports.default = watch;


