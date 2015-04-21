var MainMenu = {};

MainMenu.reset = function () {
    Editor.sendToCore('main-menu:reset');
};

MainMenu.apply = function () {
    Editor.sendToCore('main-menu:apply');
};

MainMenu.add = function ( path, template ) {
    Editor.sendToCore('main-menu:add', path, template);
};

MainMenu.set = function ( path, options ) {
    Editor.sendToCore('main-menu:set', path, options);
};

module.exports = MainMenu;
