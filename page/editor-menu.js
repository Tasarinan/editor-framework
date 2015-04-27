
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

EditorMenu.popup = function ( x, y, template ) {
    if ( EditorMenu.checkTemplate(template) ) {
        Editor.sendToCore('menu:popup', x, y, template, Editor.requireIpcEvent);
    }
};

module.exports = EditorMenu;
