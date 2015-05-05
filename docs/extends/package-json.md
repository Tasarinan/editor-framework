## Package.json

Each package use a `package.json` file to descript it.

## Options

  - `name` String - Name of the package, this name must be uniqued, otherwise it can not be published online.
  - `version` String [Optional] - The version number.
  - `description` String [Optional] - A simple description of the usage of your package.
  - `author` String [Optional] - Who made this.
  - `main` String [Optional] - A file path to the main entry javascript.
  - `menus` Object [Optional] - The menu list.
    - `key` String - Menu path, example: `foo/bar/foobar`
    - `value` Object - Menu options
      - [Editor Menu Template](https://github.com/fireball-x/editor-framework/blob/master/docs/api/core/editor-menu.md)
  - `panels` Object [Optional] - The panel list.
    - `key` String - Panel name, this name will be used with package name to create an ID (e.g. `PackageName.PanelName`).
    - `value` Object - Panel options.
      - `view` String - The panel view html file. ( It is recommended to define as a Polymer element ).
      - `type` String [Optional] - Default is `dockable`, can be `dockable`, `float`, `fixed-size`, `quick`.
      - `title` String [Optional] - The panel title show in the tab, default is the panelID.
      - `popable` Boolean [Optional] - Default is `true`, indicate if the panel is popable.
      - `width` Integer [Optional] - The width of the panel view.
      - `height` Integer [Optional] - The height of the panel view.
      - `min-width` Integer [Optional] - The min-width of the panel view.
      - `min-height` Integer [Optional] - The min-height of the panel view.
      - `shortcuts` Object [Optional] - The shortcuts for the panel.
        - `key` String - The shortcut define (example: `command+k`).
        - `value` String - The method name defined in the panel view.
      - `messages` Array [Optional] - The ipc message name list.
      - `profiles` Object [Optional] - The list of default profile settings.
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
