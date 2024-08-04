// Less configuration
import gulp from 'gulp'
import less from 'gulp-less';

gulp.task('less', function (cb) {
    gulp
        .src('src/less/splittermond.less')
        .pipe(less())
        .pipe(
            gulp.dest("./")
        );
    cb();
});

gulp.task(
    'default',
    gulp.series('less', function (cb) {
        gulp.watch('src/less/*.less', gulp.series('less'));
        cb();
    })
);
