## Define Your App

To run your app with editor-framework, you should download and put `editor-framework` into your app folder. You also need to create a `package.json` file in your app's root folder, and set its main to your app.js.

Your project structure should look like this:

```
your-app-path/
├── editor-framework/
├── package.json
└── app.js
```

The `package.json` should look like this:

```json
{
  "name": "your app name",
  "version": "0.0.1",
  "description": "A simple app based on editor-framework.",
  "dependencies": {},
  "main": "app.js" //<== Important!!! Must have.
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

An example project can be checked out here: https://github.com/fireball-x/editor-framework-app

## Class Method: initCommander(commander)

 - `commander` An instance of [commander.js](https://github.com/tj/commander.js)

Invoked at the very beginning of the app, before Editor module initialization. No method in `Editor` module can be used in this function.

## Class Method: init(options)

 - `options` The options parsed from `process.argv`

Invoked after `Editor` and its sub modules initialization. It is recommended to put following register work in this function:

 - register your protocol
 - register your profile path
 - register your package path
 - define your main menu

## Class Method: run()

Invoked after finish loading all packages. Basically you should open your main window in this function.

## Define ipc messages in your App

You can define ipc messages in your app script. Just add a function that use `app:` as prefix, the editor-framework will detect and load it before your app run.

Example:

```javascript
global.__app = {
    // An ipc message start with `app:` will be automatically registerred
    'app:foobar': function () {
        Editor.log('foobar');
    },
};
```

## Reload your App

You can reload your App by calling `Editor.App.reload()`. This is useful if you have any changes in your app code, especially when you add or remove ipc messages.

The Editor Framework also add a menu item `Developer/Reload Editor.App` to help you with this task.
