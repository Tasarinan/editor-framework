var Ipc = require('ipc');
var Menu = require('menu');
var MenuItem = require('menu-item');

function _getMenuItem ( nativeMenu, path, createIfNotExists ) {
    var nextMenu = nativeMenu;
    createIfNotExists = typeof createIfNotExists !== 'undefined' ? createIfNotExists : false;

    function findItem (menu, name) {
        for (var i = 0; i < menu.items.length; i++) {
            var item = menu.items[i];
            if (item.label === name) {
                return item;
            }
        }
        return null;
    }

    var pathNames = path.split('/');
    var item = null;
    for (var i = 0; i < pathNames.length; i++) {
        var isLastOne = i === pathNames.length - 1;
        var name = pathNames[i];
        item = findItem(nextMenu, name);
        if (item) {
            if (isLastOne) {
                return item;
            }

            if (!item.submenu || item.type !== 'submenu') {
                Editor.error( 'Menu path already occupied: %s', path );
                return null;
            }
        }
        else if (createIfNotExists) {
            item = new MenuItem({
                label: name,
                id: name.toLowerCase(),
                submenu: new Menu(),
                type: 'submenu',
            });

            // if this is the first one
            if ( i === 0 ) {
                // HACK: we assume last item always be 'Help'
                nextMenu.insert(nextMenu.items.length-1,item);
            }
            else {
                nextMenu.append(item);
            }

            if (isLastOne) {
                return item;
            }
        }
        else {
            return null;
        }
        nextMenu = item.submenu;
    }
    return item;
}

function EditorMenu ( template ) {
    if ( template ) {
        this.nativeMenu = Menu.buildFromTemplate(template);
    }
    else {
        this.nativeMenu = new Menu();
    }
}

EditorMenu.prototype.reset = function (template) {
    this.nativeMenu = Menu.buildFromTemplate(template);
};

EditorMenu.prototype.clear = function () {
    this.nativeMenu = new Menu();
};

EditorMenu.prototype.add = function ( path, template ) {
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

    var newSubMenu = Menu.buildFromTemplate(template);
    if ( menuItem.submenu ) {
        for ( var i = 0; i < newSubMenu.items.length; ++i ) {
            menuItem.submenu.append(newSubMenu.items[i]);
        }
    }
    else {
        menuItem.submenu = newSubMenu;
    }

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

module.exports = EditorMenu;
