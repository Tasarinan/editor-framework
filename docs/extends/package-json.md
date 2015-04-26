## Package.json

Each package use a `package.json` file to descript it.

## Options

  - `name` String - Name of the package, this name must be uniqued, otherwise it can not be published online.
  - `version` String - The version number.
  - `description` String - A simple description of the usage of your package.
  - `author` String - Who made this.
  - `main` String - A file path to the main entry javascript.
  - `menus` Object - The menu list.
    - `key` String - Menu path, example: `foo/bar/foobar`
    - `value` Object - Menu options
      - `message` String - ipc messages to invoke.
      - `params` Array - ipc messages parameters.
      - == Electron's menu item options ==
      - `click` Function - Callback when the menu item is clicked
      - `selector` String - Call the selector of first responder when clicked (OS X only)
      - `type` String - Can be `normal`, `separator`, `submenu`, `checkbox` or `radio`
      - `label` String
      - `sublabel` String
      - `accelerator` [Accelerator](accelerator.md)
      - `icon` [NativeImage](native-image.md)
      - `enabled` Boolean
      - `visible` Boolean
      - `checked` Boolean
      - `submenu` Menu - Should be specified for `submenu` type menu item, when it's specified the `type: 'submenu'` can be omitted for the menu item
      - `id` String - Unique within a single menu. If defined then it can be used as a reference to this item by the position attribute.
      - `position` String - This field allows fine-grained definition of the specific location within a given menu.
  - `panels` Object - The panel list.
    - `key` String - Panel name, this name will be used with package name to create an ID (e.g. `PackageName.PanelName`).
    - `value` Object - Panel options.
      - `type` String - Can be `dockable`, `float`, `fixed-size`, `quick`.
      - `view` String - The path of the panel view polymer element.
      - `title` String - The panel title show in the tab.
      - `width` Integer [Optional] - The width of the panel view.
      - `height` Integer [Optional] - The height of the panel view.
      - `min-width` Integer [Optional] - The min-width of the panel view.
      - `min-height` Integer [Optional] - The min-height of the panel view.
      - `messages` Array - The ipc message name list.
      - `profiles` Object - The list of default profile settings.
        - `key` String - The profile type, by default it can be `local` and `global`. You can register more profile type through `Editor.registerProfilePath`
        - `value` Object - The default setting values.

## Menu Path

TODO:

## Profile

TODO:
