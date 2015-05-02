## Define Your Application

To run your app with editor-framework, you should download and put `editor-framework` under your app
folder. You also need to create a `package.json` file, and set its main to your app.js, like this:

```
your-app-path/
├── editor-framework/
├── package.json
└── app.js
```

The `package.json` like this:

```json
{
  "name": "your app name",
  "version": "0.0.1",
  "description": "A simple app based on editor-framework.",
  "dependencies": {},
  "main": "app.js" <== Important!!! Must have.
}
```

## app.js

Here is an example:

```javascript
// you MUST assigned to global.__app
global.__app = {
    path: __dirname, // must have, important

    initCommander: function ( commander ) {
        // optional
    },

    init: function ( options ) {
        // must have, important
    },

    run: function () {
        // must have, important

        // create main window
        var mainWin = new Editor.Window('main', {
            'title': 'Editor Framework',
            'min-width': 800,
            'min-height': 600,
            'show': false,
            'resizable': true,
        });
        Editor.mainWindow = mainWin;

        // restore window size and position
        mainWin.restorePositionAndSize();

        // load and show main window
        mainWin.show();

        // page-level test case
        mainWin.load( 'app://app.html' );

        // open dev tools if needed
        if ( Editor.showDevtools ) {
            mainWin.openDevTools();
        }
        mainWin.focus();
    },

    load: function () {
        // optional
    },

    unload: function () {
        // optional
    },

    // An ipc message start with `app:` will be automatically registerred
    'app:foobar': function () {
        Editor.log('foobar');
    },
};

// must have, important
require('./editor-framework/init');
```
