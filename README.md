# Editor Framework

[Documentation](https://github.com/fireball-x/editor-framework/tree/master/docs) |
[Downloads](http://github.com/fireball-x/releases/) |

The `Editor Framework` lets you easily write professional desktop IDE like tools just in HTML5 and
io.js.

The Framework is based on top of Electron and Polymer. It is heavily designed with the Electron's
main and renderer process architecture. To make multiple window communicate easily, `Editor Framework`
extends the Ipc API provided from Electron, make it easily to send and recieve callback between main
and renderer process, renderer and renderer process.

`Editor Framework` is designed for fully extends, in the core-level ( main process ), we doing this
by introduce a package management module and several register API. User can load or unload packages
lively without close or restart the app.

In the page-level ( renderer process ), we use HTML5 Web-Component standards and includes the Polymer
solution by default. User can extends the interface and panels and only need to refresh the page to
make it work.

## Features

 - Package Management
   - Dynamically load and unload packages
   - Watch package changes and reload or notify changes immediately
   - A package management panel to let you operate your packages
 - Panel Management
   - Freely docking panel in multiple window
   - Dynamically load user define panels from package
   - Easily register and respond ipc messages for your panel
   - Easily register shortcuts(hotkeys) for your panel
   - Save and load panels layout in json
   - Save and load panel profiles
 - Main Menu Extends
   - Dynamically add and remove menu item
   - Dynamically change menu item state ( enabled, checked, visible, ...)
   - Load user menu from packages
 - Quick Command
   - Register and customize commands for your App
   - A powerful command window (CmdP) for searching and executing your commands
 - Profiles
   - Allow user register different type of profile in demand ( global, local, project, ... )
   - Load and save profiles through unified API
 - Log System
   - Use Winston for low level logs
   - Log to file
   - A powerful console panel for display and query your logs
 - Global Selection
   - Selection cached and synced amongs windows
   - User can register his own selection type
   - Automatically filter selections
 - Global Undo and Redo
 - Improve the native Dialog
   - Remember dialog last edit position
 - Enhance Ipc Programming Experience
   - Lots of Ipc APIs for easily control ipc send and recv
   - Can sending ipc message to specific panel
   - Can sending ipc message to specific window
   - Add ipc callback, which can wait for a callback message
   - A powerfule ipc-debugger to help you writing better ipc programmes

## Install

```bash
# Install npm packages
npm install .

# Install bower packages
bower install .

# Install electron
gulp update-electron

# run the demo app
sh app.sh
```
