
const gulp = require('gulp');
const del = require('del');


gulp.task('clean', function () {
    return del([
        './dist',
    ]);
});

gulp.task('run', gulp.series('clean'));

