var gulp = require('gulp');

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('lint', function() {
    return gulp.src('travel/frontend/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('scripts', function() {
    return gulp.src('travel/frontend/js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('travel/static/travel/js'))
        .pipe(rename('all.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('travel/static/travel/js'));
});

gulp.task('watch', function() {
    gulp.watch('travel/static/travel/js/*.js', ['lint', 'scripts']);
});

gulp.task('default', ['lint', 'scripts']);