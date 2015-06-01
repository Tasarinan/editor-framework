# Editor Framework

[Documentation](https://github.com/fireball-x/editor-framework/tree/master/docs) |
[Downloads](http://github.com/fireball-x/editor-framework/releases/) |
[Install](https://github.com/fireball-x/editor-framework#install) |
[Features](https://github.com/fireball-x/editor-framework#features)

Editor Framework gives you power to easily write professional multi-panel desktop software in HTML5 and io.js.

The framework is based on top of [Electron](http://github.com/atom/electron) and [Polymer](http://github.com/polymer/polymer).
It is designed conforming to Electron's main and renderer process architecture.
To make multiple window communicate easily, Editor Framework extends Electron's Ipc message API, making it easier to send and receive callback between main and renderer processes.

It is designed for fully extendibility. In the core-level ( main process ), we fulfill this by introducing a package management module and several register API. User can load or unload packages on the fly without close or restart the app. In the page-level ( renderer process ), we use HTML5 Web-Component standards and include the Polymer solution by default. User can extends the
widgets and panels, then refresh the page to apply the changes.

![screen shot 2015-06-01 at 5 25 52 pm](https://cloud.githubusercontent.com/assets/174891/7909981/4c0c0472-0883-11e5-8660-ff6ad8f24b9e.png)


## Install

```bash
# Install npm packages
sh utils/npm.sh install # DO NOT use npm directly

# Install bower packages
bower install

# Install electron
gulp update-electron

# Install builtin packages
sh utils/install-builtin.sh

# run the demo app
sh demo.sh
```

**NOTE:** we use `npm.sh` instead of npm here, this is just a shell script follow the [electron way](https://github.com/atom/electron/blob/master/docs/tutorial/using-native-node-modules.md) for using native node modules.

## Builtin Packages

The `utils/install-builtin.sh` will install these builtin packages:

 - Developer Tools
   - [console](https://github.com/fireball-packages/console)
   - [ipc-debugger](https://github.com/fireball-packages/ipc-debugger)
   - [package-manager](https://github.com/fireball-packages/package-manager)
   - [tester](https://github.com/fireball-packages/tester)
 - Widgets
   - [ui-kit](https://github.com/fireball-packages/ui-kit)
   - [pixi-grid](https://github.com/fireball-packages/pixi-grid)


## Develop

### Test Environment

 - Mocha
 - Chai

**Note:** We need to install mocha, chai in both core and page, that's why we put them in both bower and npm dependencies. The core level tests only run during develop phase, and will not go into the final product. The page level test environment has integrated with [tester](https://github.com/fireball-x/tester) package and every developer can use it to test your panels.

To test the editor-framework itself, just run:

```bash
npm test
```

### Generate Documentation

To generate the document, just run:

```bash
npm run api-core # for core-level docs
npm run api-page # for page-level docs
```

## Features

 - Package Management
   - Dynamically load and unload packages
   - Watch package changes and reload or notify changes immediately
   - Manage your packages in package manager window
 - Panel Management
   - Freely docks panel anywhere in multiple windows
   - Dynamically load user define panels from package
   - Easily register and respond to ipc messages for your panel
   - Easily register shortcut(hotkeys) for your panel
   - Save and load layout in json
   - Save and load panel profiles
 - Menu Extends
   - Dynamically add and remove menu item
   - Dynamically change menu item state ( enabled, checked, visible, ... )
   - Load user menu from packages
 - Commands
   - Register and customize commands for your App
   - A powerful command window (CmdP) for searching and executing your commands
 - Profiles
   - Allow user to register different types of profile to their need ( global, local, project, ... )
   - Load and save profiles through unified API
 - Logs
   - Use Winston for low level logs
   - Log to file
   - A powerful console window for display and query your logs
 - Global Selection
   - Selection cached and synced among windows
   - User can register his own selection type
   - Automatically filtering selections
 - Global Undo and Redo
 - Enhance the native Dialog
   - Remember dialog last edit position
 - Enhance Ipc Programming Experience
   - Add more Ipc methods to help sending and recieving ipc messages in different level
   - Allow sending ipc message to specific panel
   - Allow sending ipc message to specific window
   - Allow sending ipc request and waiting for the reply in callback function
   - An ipc-debugger to help you writing better ipc code
