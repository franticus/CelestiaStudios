const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fs = require('fs');
const sourceMaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');
const typograf = require('gulp-typograf');
const svgsprite = require('gulp-svg-sprite');
const replace = require('gulp-replace');
const webpHTML = require('gulp-webp-retina-html');
const imageminWebp = require('imagemin-webp');
const rename = require('gulp-rename');
const prettier = require('@bdchauvette/gulp-prettier');

gulp.task('clean:dev', function(done) {
  if (fs.existsSync('./build/')) {
    return gulp.src('./build/', { read: false }).pipe(clean({ force: true }));
  }
  done();
});

const fileIncludeSetting = {
  prefix: '@@',
  basepath: '@file',
};

const plumberNotify = title => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: 'Error <%= error.message %>',
      sound: false,
    }),
  };
};

gulp.task('html:dev', function() {
  return (
    gulp
      .src([
        './src/html/**/*.html',
        '!./**/blocks/**/*.*',
        '!./src/html/docs/**/*.*',
      ])
      .pipe(changed('./build/', { hasChanged: changed.compareContents }))
      .pipe(plumber(plumberNotify('HTML')))
      .pipe(fileInclude(fileIncludeSetting))
      .pipe(
        replace(
          /(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
          '$1./$4$5$7$1'
        )
      )
      // .pipe(
      //   typograf({
      //     locale: ['ru', 'en-US'],
      //     htmlEntity: { type: 'digit' },
      //     enableRule: ['space*'], // включить только нужные правила
      //     disableRule: ['common/nbsp/*'], // 🔧 отключает все правила, связанные с &nbsp;
      //     safeTags: [
      //       ['<\\?php', '\\?>'],
      //       ['<no-typography>', '</no-typography>'],
      //     ],
      //   })
      // )
      .pipe(
        webpHTML({
          extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          retina: {
            1: '',
            2: '@2x',
          },
        })
      )
      .pipe(
        prettier({
          tabWidth: 4,
          useTabs: true,
          printWidth: 182,
          trailingComma: 'es5',
          bracketSpacing: false,
        })
      )
      .pipe(gulp.dest('./build/'))
  );
});

gulp.task('sass:dev', function() {
  return gulp
    .src('./src/scss/*.scss')
    .pipe(changed('./build/css/'))
    .pipe(plumber(plumberNotify('SCSS')))
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(
      replace(
        /(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
        '$1$2$3$4$6$1'
      )
    )
    .pipe(sourceMaps.write())
    .pipe(gulp.dest('./build/css/'));
});

gulp.task('images:dev', function() {
  return (
    gulp
      .src(['./src/img/**/*', '!./src/img/svgicons/**/*'])
      .pipe(changed('./build/img/'))
      .pipe(
        imagemin([
          imageminWebp({
            quality: 85,
          }),
        ])
      )
      .pipe(rename({ extname: '.webp' }))
      .pipe(gulp.dest('./build/img/'))
      .pipe(gulp.src(['./src/img/**/*', '!./src/img/svgicons/**/*']))
      .pipe(changed('./build/img/'))
      // .pipe(imagemin({ verbose: true }))
      .pipe(gulp.dest('./build/img/'))
  );
});

const svgStack = {
  mode: {
    stack: {
      example: true,
    },
  },
  shape: {
    transform: [
      {
        svgo: {
          js2svg: { indent: 4, pretty: true },
        },
      },
    ],
  },
};

const svgSymbol = {
  mode: {
    symbol: {
      sprite: '../sprite.symbol.svg',
    },
  },
  shape: {
    transform: [
      {
        svgo: {
          js2svg: { indent: 4, pretty: true },
          plugins: [
            {
              name: 'removeAttrs',
              params: {
                attrs: '(fill|stroke)',
              },
            },
          ],
        },
      },
    ],
  },
};

gulp.task('svgStack:dev', function() {
  return gulp
    .src('./src/img/svgicons/**/*.svg')
    .pipe(plumber(plumberNotify('SVG:dev')))
    .pipe(svgsprite(svgStack))
    .pipe(gulp.dest('./build/img/svgsprite/'));
});

gulp.task('svgSymbol:dev', function() {
  return gulp
    .src('./src/img/svgicons/**/*.svg')
    .pipe(plumber(plumberNotify('SVG:dev')))
    .pipe(svgsprite(svgSymbol))
    .pipe(gulp.dest('./build/img/svgsprite/'));
});

gulp.task('files:dev', function() {
  return gulp
    .src('./src/files/**/*')
    .pipe(changed('./build/files/'))
    .pipe(gulp.dest('./build/files/'));
});

gulp.task('js:dev', function() {
  return (
    gulp
      .src('./src/js/*.js')
      .pipe(changed('./build/js/'))
      .pipe(plumber(plumberNotify('JS')))
      // .pipe(babel())
      .pipe(webpack(require('./../webpack.config.js')))
      .pipe(gulp.dest('./build/js/'))
  );
});

const serverOptions = {
  livereload: true,
  open: true,
};

gulp.task('server:dev', function() {
  return gulp.src('./build/').pipe(server(serverOptions));
});

gulp.task('watch:dev', function() {
  gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass:dev'));
  gulp.watch(
    ['./src/html/**/*.html', './src/html/**/*.json'],
    gulp.parallel('html:dev')
  );
  gulp.watch('./src/img/**/*', gulp.parallel('images:dev'));
  gulp.watch('./src/files/**/*', gulp.parallel('files:dev'));
  gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev'));
  gulp.watch(
    './src/img/svgicons/*',
    gulp.series('svgStack:dev', 'svgSymbol:dev')
  );
});
