## Create Your Package

Editor Framework loads package before App runs. By default it load packages from
`editor-framework://builtin/` and `~/.{app-name}/packages/`. You can customize the package loading
place through the method `Editor.registerPackagePath` when in your `App.init` function.

Each package use a `package.json` file to descript itself. Just create a folder include it and put
it in your registered package path.

## Options

  - `name` String - Name of the package, this name must be uniqued, otherwise it can not be published online.
  - `version` String - The version number.
  - `description` String [Optional] - A simple description of the usage of your package.
  - `author` String [Optional] - Who made this.
  - `hosts` Object [Optional] - The version of the hosts required for this package.
  - `main` String [Optional] - A file path to the main entry javascript.
  - `menus` Object [Optional] - The menu list.
    - `key` String - Menu path, example: `foo/bar/foobar`
    - `value` Object - Menu options
      - [Editor Menu Template](https://github.com/fireball-x/editor-framework/blob/master/docs/api/core/editor-menu.md)
  - `panels` Object [Optional] - The panel list.
    - `key` String - Panel name, this name will be used with package name to create an ID (e.g. `PackageName.PanelName`).
    - `value` Object - Panel options.
      - `frame` String - The panel frame html file. ( It is recommended to define as a Polymer element ).
      - `type` String [Optional] - Default is `dockable`, can be `dockable`, `float`, `fixed-size`, `quick`.
      - `title` String [Optional] - The panel title show in the tab, default is the panelID.
      - `popable` Boolean [Optional] - Default is `true`, indicate if the panel is popable.
      - `width` Integer [Optional] - The width of the panel frame.
      - `height` Integer [Optional] - The height of the panel frame.
      - `min-width` Integer [Optional] - The min-width of the panel frame.
      - `min-height` Integer [Optional] - The min-height of the panel frame.
      - `shortcuts` Object [Optional] - The shortcuts for the panel.
        - `key` String - The shortcut define (example: `command+k`).
        - `value` String - The method name defined in the panel frame.
      - `messages` Array [Optional] - The ipc message name list.
      - `profiles` Object [Optional] - The list of default profile settings.
        - `key` String - The profile type, by default it can be `local` and `global`. You can register more profile type through `Editor.registerProfilePath`
        - `value` Object - The default setting values.
  - `dependencies` Object [Optional] - The dependencies list.
  - `npmDependencies??` Object [Optional] - The npm dependencies list.
  - `bowerDependencies??` Object [Optional] - The bower dependencies list.

## Main Entry

TODO:

## Menu Path

TODO:
