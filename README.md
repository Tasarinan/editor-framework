# Editor Framework

[Documentation](https://github.com/fireball-x/editor-framework/tree/master/docs) |
[Downloads](http://github.com/fireball-x/releases/) |
[Install](https://github.com/fireball-x/editor-framework#install) |
[Features](https://github.com/fireball-x/editor-framework#features)

The `Editor Framework` lets you easily write professional IDE like desktop tools just in HTML5 and
io.js.

The Framework is based on top of Electron and Polymer. It is heavily designed with the Electron's
main and renderer process architecture. To make multiple window communicate easily, `Editor Framework`
extends the Ipc API provided from Electron, make it easily to send and recieve callback amongs main
and renderers process.

It is designed for fully extends. In the core-level ( main process ), we doing this
by introduce a package management module and several register API. User can load or unload packages
lively without close or restart the app. In the page-level ( renderer process ), we use HTML5
Web-Component standards and includes the Polymer solution by default. User can extends the
widgets and panels, then refresh the page apply your changes.

## Install

```bash
# Install npm packages
sh utils/npm.sh install # DO NOT use npm directly

# Install bower packages
bower install

# Install electron
gulp update-electron

# run the demo app
sh demo.sh
```

**NOTE:** we use `npm.sh` instead of npm here, this is just a shell script follow the
[electron way](https://github.com/atom/electron/blob/master/docs/tutorial/using-native-node-modules.md)
for using native node modules.

## Install Builtin Packages

To install builtin packages, just create a folder named builtin, and git clone your packages in it.
Here are a list of recommended packages to install for developing editor-framework:

```bash
# widgets
git clone https://github.com/fireball-x/uikits
git clone https://github.com/fireball-x/pixi-grid

# panels
git clone https://github.com/fireball-x/console
git clone https://github.com/fireball-x/package-manager
git clone https://github.com/fireball-x/ipc-debugger
```

## Features

 - Package Management
   - Dynamically load and unload packages
   - Watch package changes and reload or notify changes immediately
   - Manage your packages in package manager Window
 - Panel Management
   - Freely docking panel in multiple window
   - Dynamically load user define panels from package
   - Easily register and respond ipc messages for your panel
   - Easily register shortcuts(hotkeys) for your panel
   - Save and load panels layout in json
   - Save and load panel profiles
 - Menu Extends
   - Dynamically add and remove menu item
   - Dynamically change menu item state ( enabled, checked, visible, ... )
   - Load user menu from packages
 - Commands
   - Register and customize commands for your App
   - A powerful command window (CmdP) for searching and executing your commands
 - Profiles
   - Allow user register different type of profile in demand ( global, local, project, ... )
   - Load and save profiles through unified API
 - Logs
   - Use Winston for low level logs
   - Log to file
   - A powerful console window for display and query your logs
 - Global Selection
   - Selection cached and synced amongs windows
   - User can register his own selection type
   - Automatically filter selections
 - Global Undo and Redo
 - Enhance the native Dialog
   - Remember dialog last edit position
 - Enhance Ipc Programming Experience
   - Add more Ipc methods to help sending and recieving ipc messages in different level
   - Allow sending ipc message to specific panel
   - Allow sending ipc message to specific window
   - Allow sending ipc request and waiting for the reply in callback function
   - An ipc-debugger to help you writing better ipc code
