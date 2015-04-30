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
      - [Editor Menu Template](https://github.com/fireball-x/editor-framework/blob/master/docs/api/core/editor-menu.md)
  - `panels` Object - The panel list.
    - `key` String - Panel name, this name will be used with package name to create an ID (e.g. `PackageName.PanelName`).
    - `value` Object - Panel options.
      - `type` String - Can be `dockable`, `float`, `fixed-size`, `quick`.
      - `view` String - The path of the panel view polymer element.
      - `title` String - The panel title show in the tab.
      - `popable` Boolean - Indicate if the panel is popable.
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

## Panel Profile

TODO:

## Panel Name

TODO:

## Panel Position

TODO:

## Panel Messages

TODO:
