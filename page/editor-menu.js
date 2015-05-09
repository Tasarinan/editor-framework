var EditorMenu = {};

EditorMenu.checkTemplate = function ( template ) {
    // ensure no click
    for ( var i = 0; i < template.length; ++i ) {
        var item = template[i];

        if ( item.click ) {
            Editor.error('Not support to use click in page-level menu declaration, it may caused dead lock due to ipc problem in Electron');
            return false;
        }

        if ( item.submenu && !EditorMenu.checkTemplate(item.submenu) ) {
            return false;
        }
    }
    return true;
};

// parameters: [x, y], template
EditorMenu.popup = function () {
    var x, y, template;
    if ( arguments.length === 1 ) {
        template = arguments[0];
    }
    else if ( arguments.length === 3 ) {
        x = arguments[0];
        y = arguments[1];
        template = arguments[2];
    }
    else {
        Editor.error( 'Invalid arguments, please try Editor.Menu.popup( x (optional), y (optional), template )' );
        return;
    }

    if ( EditorMenu.checkTemplate(template) ) {
        Editor.sendToCore('menu:popup', x, y, template, Editor.requireIpcEvent);
    }
};

module.exports = EditorMenu;
