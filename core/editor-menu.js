var BrowserWindow = require('browser-window');
var Ipc = require('ipc');
var Menu = require('menu');
var MenuItem = require('menu-item');
var Path = require('fire-path');

function _getMenuItem ( nativeMenu, path, createIfNotExists ) {
    var nextMenu = nativeMenu;
    createIfNotExists = typeof createIfNotExists !== 'undefined' ? createIfNotExists : false;

    function findMenuItem (menu, name) {
        for (var i = 0; i < menu.items.length; i++) {
            var menuItem = menu.items[i];
            if (menuItem.label === name) {
                return menuItem;
            }
        }
        return null;
    }

    var pathNames = path.split('/');
    var menuItem = null;
    for (var i = 0; i < pathNames.length; i++) {
        var isLastOne = i === pathNames.length - 1;
        var name = pathNames[i];
        menuItem = findMenuItem(nextMenu, name);
        if (menuItem) {
            if (isLastOne) {
                return menuItem;
            }

            if (!menuItem.submenu || menuItem.type !== 'submenu') {
                Editor.error( 'Menu path already occupied: %s', path );
                return null;
            }
        }
        else if (createIfNotExists) {
            menuItem = new MenuItem({
                label: name,
                id: name.toLowerCase(),
                submenu: new Menu(),
                type: 'submenu',
            });

            // if this is the first one
            if ( i === 0 ) {
                // HACK: we assume last menuItem always be 'Help'
                nextMenu.insert(nextMenu.items.length-1,menuItem);
            }
            else {
                nextMenu.append(menuItem);
            }

            if (isLastOne) {
                return menuItem;
            }
        }
        else {
            return null;
        }
        nextMenu = menuItem.submenu;
    }
    return menuItem;
}

function _cloneMenuItemLevel1 ( menuItem ) {
    var options = Editor.JS.extract( menuItem, [
        'click',
        'selector',
        'type',
        'label',
        'sublabel',
        'accelerator',
        'icon',
        'enabled',
        'visible',
        'checked',
        // 'submenu', // NOTE: never clone submenu, other wise we can't change item inside it
        'id',
        'position',
    ]);
    if ( options.type === 'submenu' ) {
        options.submenu = new Menu();
    }
    return new MenuItem(options);
}

function _cloneMenuExcept ( newMenu, nativeMenu, exceptPath, curPath ) {
    var result = false;

    for ( var i = 0; i < nativeMenu.items.length; ++i ) {
        var menuItem = nativeMenu.items[i];
        var path = Path.join( curPath, menuItem.label );

        if ( Path.contains( path, exceptPath ) ) {
            if ( path === exceptPath ) {
                result = true;
                continue;
            }

            var newMenuItem = _cloneMenuItemLevel1(menuItem);
            if ( newMenuItem.type === 'submenu' ) {
                var removed = _cloneMenuExcept( newMenuItem.submenu,
                                                menuItem.submenu,
                                                exceptPath,
                                                path );
                if ( removed ) result = removed;
            }
            newMenu.append(newMenuItem);
        }
        else {
            newMenu.append(menuItem);
        }
    }

    return result;
}

function EditorMenu ( template, webContents ) {
    if ( template ) {
        EditorMenu.parseTemplate(template, webContents);
        this.nativeMenu = Menu.buildFromTemplate(template);
    }
    else {
        this.nativeMenu = new Menu();
    }
}

EditorMenu.prototype.dispose = function () {
    this.nativeMenu = null;
};

EditorMenu.prototype.reset = function (template) {
    this.nativeMenu = Menu.buildFromTemplate(template);
};

EditorMenu.prototype.clear = function () {
    this.nativeMenu = new Menu();
};

EditorMenu.prototype.add = function ( path, template ) {
    EditorMenu.parseTemplate(template);

    if ( !Array.isArray(template) )
        template = [template];

    var menuItem = _getMenuItem( this.nativeMenu, path, true );

    if ( !menuItem ) {
        Editor.error('Failed to find menu in path: %s', path );
        return false;
    }

    if ( menuItem.type !== 'submenu' ) {
        Editor.error('Menu item %s should be submenu', path );
        return false;
    }

    if ( !menuItem.submenu ) {
        Editor.error('Invalid menu item %s, submenu not found', path );
        return false;
    }

    function checkMenuItemLabel ( label ) {
        return function ( item ) {
            return item.label === label;
        };
    }

    var newSubMenu = Menu.buildFromTemplate(template);
    var i, newSubMenuItem;
    for ( i = 0; i < newSubMenu.items.length; ++i ) {
        newSubMenuItem = newSubMenu.items[i];

        if ( menuItem.submenu.items.some( checkMenuItemLabel(newSubMenuItem.label) ) ) {
            Editor.error('Failed to add menu to %s, A menu item %s you try to add already exists.',
                         path,
                         Path.join( path, newSubMenuItem.label ) );
            return false;
        }
    }

    for ( i = 0; i < newSubMenu.items.length; ++i ) {
        newSubMenuItem = newSubMenu.items[i];
        menuItem.submenu.append(newSubMenuItem);
    }

    return true;
};

// base on electron#527 said, there is no simple way to remove menu item
// https://github.com/atom/electron/issues/527
EditorMenu.prototype.remove = function ( path ) {
    var newMenu = new Menu();
    var removed = _cloneMenuExcept( newMenu, this.nativeMenu, path, '' );

    if ( !removed ) {
        Editor.error('Failed to remove menu in path: %s, can not find it', path );
        return false;
    }

    this.nativeMenu = newMenu;
    return true;
};

EditorMenu.prototype.set = function ( path, options ) {
    var menuItem = _getMenuItem( this.nativeMenu, path, false );

    if ( !menuItem ) {
        Editor.error('Failed to find menu in path: %s', path );
        return false;
    }

    if ( menuItem.type === 'separator' ) {
        Editor.error('Menu item %s is a separator', path );
        return false;
    }

    if ( options.icon !== undefined )
        menuItem.icon = options.icon;

    if ( options.enabled !== undefined )
        menuItem.enabled = options.enabled;

    if ( options.visible !== undefined )
        menuItem.visible = options.visible;

    if ( options.checked !== undefined )
        menuItem.checked = options.checked;

    if ( options.position !== undefined )
        menuItem.position = options.position;

    return true;
};

EditorMenu.parseTemplate = function ( template, webContents ) {
    if ( Array.isArray(template) ) {
        for ( var i = 0; i < template.length; ++i ) {
            EditorMenu.parseTemplate(template[i], webContents);
        }
        return;
    }

    var args;

    if ( template.message ) {
        if ( template.click ) {
            Editor.error('Not support to use click and message at the same time: ' + template.label);
            return;
        }

        args = [template.message];
        if (template.params) {
            if ( !Array.isArray(template.params) ) {
                Editor.error('message parameters must be an array');
                return;
            }
            args = args.concat(template.params);
            delete template.params;
        }
        if ( template.panel ) {
            args.unshift(template.panel);
        }

        template.click = (function (args) {
            if ( template.panel ) {
                return function () {
                    setImmediate(function () {
                        Editor.sendToPanel.apply(Editor, args);
                    });
                };
            }
            else if ( webContents ) {
                return function () {
                    setImmediate(function () {
                        webContents.send.apply(webContents,args);
                    });
                };
            }
            else {
                return function () {
                    // response in next tick to prevent ipc blocking issue caused by atom-shell's menu.
                    setImmediate(function () {
                        Editor.sendToCore.apply(Editor, args);
                    });
                };
            }
        })(args);
        delete template.message;
    }
    else if ( template.command ) {
        var paths = template.command.split('.');
        var idx = 0;
        var tmp = global[paths[idx]];
        ++idx;
        while ( tmp && idx < paths.length ) {
            tmp = tmp[paths[idx]];
            ++idx;
        }
        if ( tmp && typeof tmp === 'function' ) {
            args = [];
            if (template.params) {
                if ( !Array.isArray(template.params) ) {
                    Editor.error('message parameters must be an array');
                    return;
                }
                args = args.concat(template.params);
                delete template.params;
            }
            template.click = (function (args) {
                return function () {
                    tmp.apply(Editor, args);
                };
            })(args);
        }
        delete template.command;
    }
    else if ( template.submenu ) {
        EditorMenu.parseTemplate(template.submenu, webContents);
    }
};

// ========================================
// Ipc
// ========================================

Ipc.on('menu:popup', function ( event, x, y, template ) {
    var editorMenu = new Editor.Menu(template,event.sender);
    if ( x ) x = Math.floor(x);
    if ( y ) y = Math.floor(y);
    editorMenu.nativeMenu.popup(BrowserWindow.fromWebContents(event.sender), x, y);
    editorMenu.dispose();
});

module.exports = EditorMenu;
