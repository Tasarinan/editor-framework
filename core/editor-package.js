var NativeImage = require('native-image');
var Ipc = require('ipc');
var Path = require('fire-path');
var Fs = require('fire-fs');

/**
 * Package module for manipulating packages
 * @namespace Editor.Package
 */
var Package = {};
var _path2package = {};
var _name2packagePath = {};
var _panel2info = {};
var _widget2info = {};

/**
 * Load a package at path
 * @param {string} path - An absolute path point to a package folder
 * @method load
 * @memberof Editor.Package
 */
Package.load = function ( path ) {
    if ( _path2package[path] )
        return;

    var packageJsonPath = Path.join( path, 'package.json' );
    var packageObj;
    try {
        packageObj = JSON.parse(Fs.readFileSync(packageJsonPath));
    }
    catch (err) {
        Editor.error( 'Failed to load package.json at %s, message: %s', path, err.message );
        return;
    }

    packageObj._path = path;

    // load main.js
    if ( packageObj.main ) {
        var main;
        var mainPath = Path.join( path, packageObj.main );
        try {
            main = require(mainPath);
            if ( main && main.load ) {
                main.load();
            }
        }
        catch (err) {
            Editor.failed( 'Failed to load %s from %s. %s.', packageObj.main, packageObj.name, err.stack );
            return;
        }

        // register main ipcs
        var ipcListener = new Editor.IpcListener();
        for ( var prop in main ) {
            if ( prop === 'load' || prop === 'unload' )
                continue;

            if ( typeof main[prop] === 'function' ) {
                ipcListener.on( prop, main[prop].bind(main) );
            }
        }
        packageObj._ipc = ipcListener;
    }

    // register menu
    if ( packageObj.menus && typeof packageObj.menus === 'object' ) {
        for ( var menuPath in packageObj.menus ) {
            var parentMenuPath = Path.dirname(menuPath);
            if ( parentMenuPath === '.' ) {
                Editor.error( 'Can not add menu %s at root.', menuPath );
                continue;
            }

            var menuOpts = packageObj.menus[menuPath];
            var template = Editor.JS.mixin( {
                label: Path.basename(menuPath),
            }, menuOpts );

            // create NativeImage for icon
            if ( menuOpts.icon ) {
                var icon = NativeImage.createFromPath( Path.join(path, menuOpts.icon) );
                template.icon = icon;
            }

            Editor.MainMenu.add( parentMenuPath, template );
        }
    }

    // register panel
    if ( packageObj.panels && typeof packageObj.panels === 'object' ) {
        for ( var panelName in packageObj.panels ) {
            var panelID = packageObj.name + '.' + panelName;
            if ( _panel2info[panelID] ) {
                Editor.error( 'Failed to load panel \'%s\' from \'%s\', already exists.', panelName, packageObj.name );
                continue;
            }

            // setup default properties
            var panelInfo = packageObj.panels[panelName];
            Editor.JS.addon(panelInfo, {
                type: 'dockable',
                title: panelID,
                popable: true,
                messages: [],
                path: path,
            });

            //
            _panel2info[panelID] = panelInfo;
        }
    }

    // register widget
    if ( packageObj.widgets && typeof packageObj.widgets === 'object' ) {
        for ( var widgetName in packageObj.widgets ) {
            if ( _widget2info[widgetName] ) {
                Editor.error( 'Failed to register widget \'%s\' from \'%s\', already exists.', widgetName, packageObj.name );
                continue;
            }
            var widgetPath = packageObj.widgets[widgetName];
            _widget2info[widgetName] = {
                path: Path.join( path, Path.dirname(widgetPath) ),
            };
        }
    }

    //
    _path2package[path] = packageObj;
    _name2packagePath[packageObj.name] = path;
    Editor.success('%s loaded', packageObj.name);
    Editor.sendToWindows('package:loaded', packageObj.name);
};

/**
 * Unload a package at path
 * @param {string} path - An absolute path point to a package folder
 * @method unload
 * @memberof Editor.Package
 */
Package.unload = function ( path ) {
    var packageObj = _path2package[path];
    if ( !packageObj )
        return;

    // unregister panel
    if ( packageObj.panels && typeof packageObj.panels === 'object' ) {
        for ( var panelName in packageObj.panels ) {
            var panelID = packageObj.name + '.' + panelName;
            delete _panel2info[panelID];
        }
    }

    // unregister widget
    if ( packageObj.widgets && typeof packageObj.widgets === 'object' ) {
        for ( var widgetName in packageObj.widgets ) {
            delete _widget2info[widgetName];
        }
    }

    // unregister menu
    if ( packageObj.menus && typeof packageObj.menus === 'object' ) {
        for ( var menuPath in packageObj.menus ) {
            Editor.MainMenu.remove( menuPath );
        }
    }

    // unload main.js
    if ( packageObj.main ) {
        // unregister main ipcs
        packageObj._ipc.clear();

        // unload main
        var cache = require.cache;
        var mainPath = Path.join( path, packageObj.main );
        var module = cache[mainPath];
        try {
            if ( module ) {
                var main = module.exports;
                if ( main && main.unload ) {
                    main.unload();
                }
            }
        }
        catch (err) {
            Editor.failed( 'Failed to unload %s from %s. %s.', packageObj.main, packageObj.name, err.stack );
        }
        delete cache[mainPath];
    }

    //
    delete _path2package[path];
    delete _name2packagePath[packageObj.name];
    Editor.success('%s unloaded', packageObj.name);
    Editor.sendToWindows('package:unloaded', packageObj.name);
};

/**
 * Reload a package at path
 * @param {string} path - An absolute path point to a package folder
 * @method reload
 * @memberof Editor.Package
 */
Package.reload = function ( path ) {
    Package.unload(path);
    Package.load(path);
};

/**
 * Find and get panel info via panelID, the panel info is the json object
 * that defined in `panels.{panel-name}` in your package.json
 * @param {string} panelID
 * @return {object}
 * @method panelInfo
 * @memberof Editor.Package
 */
Package.panelInfo = function ( panelID ) {
    return _panel2info[panelID];
};

/**
 * Find and get panel info via widgetName, the widget info is the json object
 * that defined in `widgets.{widget-name}` in your package.json
 * @param {string} widgetName
 * @return {object}
 * @method widgetInfo
 * @memberof Editor.Package
 */
Package.widgetInfo = function ( widgetName ) {
    return _widget2info[widgetName];
};

/**
 * Find and get package info via path, the package info is the json object of your package.json file
 * @param {string} path - The path can be any files in this package
 * @return {object}
 * @method packageInfo
 * @memberof Editor.Package
 */
Package.packageInfo = function ( path ) {
    for ( var p in _path2package ) {
        if ( Path.contains( p, path )  ) {
            return _path2package[p];
        }
    }
    return null;
};

/**
 * Return the path of the package by name
 * @param {string} packageName
 * @return {string}
 * @method packagePath
 * @memberof Editor.Package
 */
Package.packagePath = function ( packageName ) {
    return _name2packagePath[packageName];
};

// ========================================
// Ipc
// ========================================

Ipc.on('package:query', function ( reply ) {
    var results = [];
    for ( var path in _path2package ) {
        results.push({
            path: path,
            builtin: false, // TODO:
            enabled: true, // TODO:
            info: _path2package[path],
        });
    }

    reply(results);
});

Ipc.on('package:reload', function ( name ) {
    var path = _name2packagePath[name];
    if ( !path ) {
        Editor.error('Failed to reload package %s, not found', name);
        return;
    }

    Package.reload(path);
});

module.exports = Package;
