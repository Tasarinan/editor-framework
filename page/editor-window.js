var EditorWindow = {};

EditorWindow.focus = function () {
    Editor.sendToCore( 'window:focus', Editor.requireIpcEvent );
};

module.exports = EditorWindow;
