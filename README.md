# Editor Framework

[Documentation](https://github.com/fireball-x/editor-framework/tree/master/docs) |
[Downloads](http://github.com/fireball-x/releases/) |

A simple framework for easily making multi-panel editor.

## Usage

```bash
# Install npm packages
npm install .

# Install bower packages
bower install .

# Install electron
gulp update-electron

# play some test
sh test.sh
```

## Features

 - Package Manager
   - Allow dynamically load and unload packages
   - Allow register menu items
   - Allow register custom panels
   - Allow register key mappings for panel
   - Allow register messages for panel
 - Dockable Panels
   - Freely docking panel in multiple window
   - Save and restore the last edit layout
   - Save and load panel profiles
 - Enhance Ipc Programming Experience
   - Lots of Ipc APIs for easily control ipc send and recv
   - Can sending ipc message to specific panel
   - Can sending ipc message to specific window
   - Add ipc callback, which can wait for a callback message
   - Inspect and Develop Ipc in ipc-debugger
 - Improve Log System
   - Use Winston for low level log system
   - Log to file
   - A editor-console Panel for displaying logs
 - Manage Menu
   - Can dynamically add and remove main menu items
 - Manage Dialog
   - Remember dialog last edit position
 - Manage Command
   - Register and customize command based on panel
   - Search and execute command in command window
