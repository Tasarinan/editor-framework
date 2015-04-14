// load modules
var App = require('app');
var Path = require('fire-path');
var Fs = require('fire-fs');
var Url = require('fire-url');
var Nomnom = require('nomnom');
var Chalk = require('chalk');
var Winston = require('winston');

// this will prevent default atom-shell uncaughtException
process.removeAllListeners('uncaughtException');
process.on('uncaughtException', function(error) {
    if ( Editor && Editor.sendToWindows ) {
        Editor.sendToWindows('console:error', {
            message: error.stack || error
        });
    }
    Winston.uncaught( error.stack || error );
});

// initialize minimal Editor
var Editor = global.Editor = {};

Editor.name = App.getName();
Editor.cwd = __dirname;
// NOTE: Editor.dataPath = ~/.{app-name}
Editor.dataPath = Path.join( App.getPath('home'), '.' + Editor.name );

// initialize ~/.{app-name}
if ( !Fs.existsSync(Editor.dataPath) ) {
    Fs.makeTreeSync(Editor.dataPath);
}

// initialize ~/.{app-name}/settings/
var settingsPath = Path.join(Editor.dataPath, 'settings');
if ( !Fs.existsSync(settingsPath) ) {
    Fs.mkdirSync(settingsPath);
}

// initialize logs/
// MacOSX: ~/Library/Logs/{app-name}
// Windows: %APPDATA%, some where like 'C:\Users\{your user name}\AppData\Local\...'

// get log path
var _logpath = '';
if ( process.platform === 'darwin' ) {
    _logpath = Path.join(App.getPath('home'), 'Library/Logs/' + Editor.name );
}
else {
    _logpath = App.getPath('appData');
}

if ( !Fs.existsSync(_logpath) ) {
    Fs.makeTreeSync(_logpath);
}

var _logfile = Path.join(_logpath, Editor.name + '.log');
if ( Fs.existsSync(_logfile) ) {
    Fs.unlinkSync(_logfile);
}

var winstonLevels = {
    normal   : 0,
    success  : 1,
    failed   : 2,
    info     : 3,
    warn     : 4,
    error    : 5,
    fatal    : 6,
    uncaught : 7,
};
Winston.setLevels(winstonLevels);

Winston.remove(Winston.transports.Console);
Winston.add(Winston.transports.File, {
    level: 'normal',
    filename: _logfile,
    json: false,
});

var chalk_id = Chalk.bgBlue;
var chalk_success = Chalk.green;
var chalk_warn = Chalk.yellow;
var chalk_error = Chalk.red;
var chalk_info = Chalk.cyan;

var levelToFormat = {
    normal: function ( text ) {
        var pid = chalk_id('[' + process.pid + ']') + ' ';
        return pid + text;
    },

    success: function ( text ) {
        var pid = chalk_id('[' + process.pid + ']') + ' ';
        return pid + chalk_success(text);
    },

    failed: function ( text ) {
        var pid = chalk_id('[' + process.pid + ']') + ' ';
        return pid + chalk_error(text);
    },

    info: function ( text ) {
        var pid = chalk_id('[' + process.pid + ']') + ' ';
        return pid + chalk_info(text);
    },

    warn: function ( text ) {
        var pid = chalk_id('[' + process.pid + ']') + ' ';
        return pid + chalk_warn.inverse.bold('Warning:') + ' ' + chalk_warn(text);
    },

    error: function ( text ) {
        var pid = chalk_id('[' + process.pid + ']') + ' ';
        return pid + chalk_error.inverse.bold('Error:') + ' ' + chalk_error(text);
    },

    fatal: function ( text ) {
        var pid = chalk_id('[' + process.pid + ']') + ' ';
        return pid + chalk_error.inverse.bold('Fatal Error:') + ' ' + chalk_error(text);
    },

    uncaught: function ( text ) {
        var pid = chalk_id('[' + process.pid + ']') + ' ';
        return pid + chalk_error.inverse.bold('Uncaught Exception:') + ' ' + chalk_error(text);
    },
};

Winston.add( Winston.transports.Console, {
    level: 'normal',
    formatter: function (options) {
        var pid = chalk_id('[' + process.pid + ']') + ' ';
        var text = '';
        if ( options.message !== undefined ) {
            text += options.message;
        }
        if ( options.meta && Object.keys(options.meta).length ) {
            text += ' ' + JSON.stringify(options.meta);
        }

        // output log by different level
        var formatter = levelToFormat[options.level];
        if ( formatter ) {
            return formatter(text);
        }

        return text;
    }
});

//
function _parseArgv( argv ) {
    Nomnom
    .script( Editor.name )
    .option('version', { abbr: 'v', flag: true, help: 'Print the version.',
            callback: function () { return App.getVersion(); } })
    .option('help', { abbr: 'h', flag: true, help: 'Print this usage message.' })
    .option('dev', { abbr: 'd', flag: true, help: 'Run in development mode.' })
    .option('showDevtools', { abbr: 'D', full: 'show-devtools', flag: true, help: 'Open devtools automatically when main window loaded.' })
    .option('debug', { full: 'debug', flag: true, help: 'Open in browser context debug mode.' })
    .option('debugBreak', { full: 'debug-brk', flag: true, help: 'Open in browser context debug mode, and break at first.' })
    ;

    var opts = Nomnom.parse(argv);

    if ( opts.dev ) {
        if ( opts._.length < 2 ) {
            opts.project = null;
        }
        else {
            opts.project = opts._[opts._.length-1];
        }
    }

    return opts;
}

// parse process arguments and apply it to editor
var options = _parseArgv( process.argv.slice(1) );

Editor.isDev = options.dev;

// DISABLE: http cache only happends afterwhile, not satisefy our demand (which need to happend immediately).
// App.commandLine.appendSwitch('disable-http-cache');
// App.commandLine.appendSwitch('disable-direct-write');

// quit when all windows are closed.
App.on('window-all-closed', function( event ) {
    App.quit();
});

//
App.on('will-finish-launching', function() {
    if ( !Editor.isDev ) {
        var crashReporter = require('crash-reporter');
        crashReporter.start({
            productName: Editor.name,
            companyName: 'Firebox Technology',
            submitUrl: 'https://fireball-x.com/crash-report',
            autoSubmit: false,
        });
    }
});

//
App.on('ready', function() {
    Winston.normal( 'Initializing protocol' );
    require('./core/protocol-init');

    Winston.normal( 'Initializing editor' );
    require('./core/editor-init');
    require('./core/ipc-init');

    var defaultProfilePath = Path.join( Editor.dataPath, 'settings' );
    Editor.registerProfilePath( 'global', defaultProfilePath );
    Editor.registerProfilePath( 'local', defaultProfilePath );

    Winston.success('Initial success!');

    // open your app
    try {
        if ( Fs.existsSync('./app.js') ) {
            Editor.App = require('./app');
        }
        // run unit test
        else {
            Editor.App = require('./test/app');
        }
        Editor.App.run(options);
    }
    catch ( error ) {
        Winston.error(error.stack || error);
        App.terminate();
    }
});
