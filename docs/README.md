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

# Install atom-shell
gulp update-atom-shell

# run the framework
sh atom.sh
```

## Features

 - Manage Packages
 - Manage Panels
   - Dockable panel on window
   - Save and load panel settings
   - Allow register and customize key mappings
 - Manage Ipc
   - Ipc message send to specific panel
   - Allow register ipc message to dom event
 - Manage Log
   - Log to file
 - Manage Dialog
   - Remember dialog last edit position
 - Manage Menu
   - Provide main menu registry API
   - Register and customize menu item for panel
 - Manage Command
   - Register and customize command based on panel
   - Search and execute command in command window
