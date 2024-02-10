var gulp        = require('gulp'),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'),
    browserSync = require('browser-sync'),
    pug         = require('gulp-pug'),
    sassGlob    = require('gulp-sass-glob'), // use glob imports sass/scss files
    autoprefixer= require('gulp-autoprefixer');

// gulp.task('pug', function buildHTML(){
//   return gulp.src('dev/pug/*.pug')
//   .pipe(pug({
//     pretty: true,
//   }))
//   .pipe(gulp.dest('dev'))
// });
gulp.task('pug', function() {
  return gulp.src('dev/pug/*.pug')
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('dev/'))
});

// STYLE Tasks
gulp.task('sass', function(){
  return gulp.src('dev/sass/main.sass') // джерело файлу
  .pipe(sassGlob())
  .pipe(sourcemaps.init()) // підключення карт
  .pipe(sass({includePaths: ['node_modules/susy/sass']}).on('error', sass.logError)) // компіляція sass
  .pipe(autoprefixer({
    browsers: ['last 2 version'],
    cascade: false
  }))
  .pipe(sourcemaps.write('.')) // записати карту
  .pipe(gulp.dest('dev/css')) // лише назви папок. Коли файл - створить папку
  .pipe(browserSync.reload({ stream: true })) // інжекція файлу прямо в дом
});

gulp.task('browser-sync', function(){
  browserSync({
    server: {
      baseDir: 'dev' // Папка сервера тут задається
    },
    notify: false // Виключити увідомлєнія )
  })
});

gulp.task('watch', ['browser-sync', 'pug', 'sass'/*, 'scripts'*/], function(){  // після слова
  gulp.watch('dev/pug/**/*.pug', ['pug', browserSync.reload]);
  gulp.watch('dev/sass/**/*.+(scss|sass)', ['sass']);
  gulp.watch('dev/js/**/*.js', browserSync.reload);
});
