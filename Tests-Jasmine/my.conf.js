// Karma configuration
// Generated on Mon Dec 30 2013 23:20:51 GMT+0000 (GMT Standard Time)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      '../web/js/libs/jquery-1.7.2.min.js',
	'../web/js/libs/jquery-ui-1.8.11.min.js',
	//'../web/js/libs/modernizr-2.5.3-respond-1.1.0.min.js',
	//'../web/js/libs/bootstrap/bootstrap.min.js',
	//'../web/Scripts/jquery.signalR-2.0.0.min.js',
	'../web/js/libs/knockout-2.1.0.js',
	//'http://localhost:1269/signalr/hubs',
	//'../web/client/tilefill.js',
	'../web/client/Exceptions.js',
	'../web/client/Utils.js',
	//'../web/client/PokerHub.js',
	'../web/client/Lobby.js',
	//'../web/Themes/Standard/theme.js',
	'../web/client/Seat.js',
	'../web/client/Game.js',
	'../web/client/PokerGame.js',
	'../web/client/FlopGame.js',
	'../web/client/OFCGame.js',
	'../web/client/BlackJackGame.js',
	'../web/client/Desktop.js',
	'*.js',
	],


    // list of files to exclude
    exclude: [
      
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_ERROR,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
