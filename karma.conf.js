// Karma configuration
// Generated on Sun May 29 2016 15:42:26 GMT+0200 (CEST)

//To run karma:
// npm install
//./node_modules/karma/bin/karma start --single-run

//To generate config:
//./node_modules/karma/bin/karma init

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-route/angular-route.js',
      'node_modules/angular-resource/angular-resource.js',
      'node_modules/angular-mocks/angular-mocks.js',

      'node_modules/angular-animate/angular-animate.js',
      'node_modules/angular-animate/angular-messages.js',
      'node_modules/angular-aria/angular-aria.js',

      'node_modules/angular-material/angular-material.js',
      'node_modules/angular-material/angular-material-mocks.js',

      'node_modules/moment/moment.js',
      'node_modules/angular-moment-picker/src/angular-moment-picker.js',

      'travel/frontend/js/*.js',
//      'travel/static/travel/js/all.js',
//      'travel/static/travel/js/all.min.js',
      'travel/frontend/js/test/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
