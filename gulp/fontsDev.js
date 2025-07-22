const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const fs = require('fs');
const gulp = require('gulp');
const fonter = require('gulp-fonter-fix');
const ttf2woff2 = require('gulp-ttf2woff2');

const srcFolder = './src';
const destFolder = './build';

// Задача для конвертации .otf в .ttf, если .otf существуют
gulp.task('otfToTtf', () => {
  return gulp
    .src(`${srcFolder}/fonts/*.otf`, { allowEmpty: true }) // allowEmpty: true, чтобы не падать, если файлов нет
    .pipe(
      plumber(
        notify.onError({
          title: 'FONTS',
          message: 'Error: <%= error.message %>. File: <%= file.relative %>!',
        })
      )
    )
    .pipe(fonter({ formats: ['ttf'] }))
    .pipe(gulp.dest(`${srcFolder}/fonts/`));
});

// Задача для конвертации .ttf в .woff и .woff2, если .ttf существуют
gulp.task('ttfToWoff', () => {
  return gulp
    .src(`${srcFolder}/fonts/*.ttf`, { allowEmpty: true })
    .pipe(
      plumber(
        notify.onError({
          title: 'FONTS',
          message: 'Error: <%= error.message %>. File: <%= file.relative %>!',
        })
      )
    )
    .pipe(fonter({ formats: ['woff'] })) // Конвертируем в .woff
    .pipe(gulp.dest(`${destFolder}/fonts/`))
    .pipe(gulp.src(`${srcFolder}/fonts/*.ttf`, { allowEmpty: true })) // Заново берём .ttf для .woff2
    .pipe(ttf2woff2())
    .pipe(gulp.dest(`${destFolder}/fonts/`));
});

// Задача для копирования существующих .woff2, если они есть
gulp.task('copyWoff2', () => {
  return gulp
    .src(`${srcFolder}/fonts/*.woff2`, { allowEmpty: true })
    .pipe(
      plumber(
        notify.onError({
          title: 'FONTS',
          message: 'Error: <%= error.message %>. File: <%= file.relative %>!',
        })
      )
    )
    .pipe(gulp.dest(`${destFolder}/fonts/`));
});

// Задача для генерации SCSS-файла с подключением шрифтов
gulp.task('fontsStyle', done => {
  let fontsFile = `${srcFolder}/scss/base/_fontsAutoGen.scss`;
  // Проверяем, существуют ли файлы шрифтов в build/fonts/
  fs.readdir(`${destFolder}/fonts/`, function(err, fontsFiles) {
    if (fontsFiles && fontsFiles.length > 0) {
      // Создаём или очищаем SCSS-файл
      fs.writeFileSync(fontsFile, '');
      let newFileOnly = new Set(); // Используем Set для избежания дубликатов
      fontsFiles.forEach(file => {
        if (file.endsWith('.woff') || file.endsWith('.woff2')) {
          // Учитываем как .woff, так и .woff2
          let fontFileName = file.split('.')[0];
          if (!newFileOnly.has(fontFileName)) {
            let fontName = fontFileName.split('-')[0] || fontFileName;
            let fontWeightStr = fontFileName.split('-')[1] || fontFileName;
            let fontWeight = 400; // Default
            switch (fontWeightStr.toLowerCase()) {
              case 'thin':
                fontWeight = 100;
                break;
              case 'extralight':
                fontWeight = 200;
                break;
              case 'light':
                fontWeight = 300;
                break;
              case 'medium':
                fontWeight = 500;
                break;
              case 'semibold':
                fontWeight = 600;
                break;
              case 'bold':
                fontWeight = 700;
                break;
              case 'extrabold':
              case 'heavy':
                fontWeight = 800;
                break;
              case 'black':
                fontWeight = 900;
                break;
            }
            // Генерируем src в зависимости от наличия форматов
            let src = '';
            const woff2Exists = fontsFiles.some(
              f => f === `${fontFileName}.woff2`
            );
            const woffExists = fontsFiles.some(
              f => f === `${fontFileName}.woff`
            );
            if (woff2Exists && woffExists) {
              src = `url("../fonts/${fontFileName}.woff2") format("woff2"), url("../fonts/${fontFileName}.woff") format("woff")`;
            } else if (woff2Exists) {
              src = `url("../fonts/${fontFileName}.woff2") format("woff2")`;
            } else if (woffExists) {
              src = `url("../fonts/${fontFileName}.woff") format("woff")`;
            }
            if (src) {
              fs.appendFileSync(
                fontsFile,
                `@font-face {\n\tfont-family: "${fontName}";\n\tfont-display: swap;\n\tsrc: ${src};\n\tfont-weight: ${fontWeight};\n\tfont-style: normal;\n}\r\n`
              );
              newFileOnly.add(fontFileName);
            }
          }
        }
      });
    } else {
      console.log('No font files found in build/fonts/');
    }
    done();
  });
});

// Основная задача: последовательно конвертировать/копировать и генерировать стиль
gulp.task(
  'fontsDev',
  gulp.series('otfToTtf', 'ttfToWoff', 'copyWoff2', 'fontsStyle')
);
