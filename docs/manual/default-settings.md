## Editor Default Settings

## Paths

  - `Editor.cwd`: The current app.js running directory.
  - `Editor.mainEntry`: Your main entry file. Usually it is `{your-app}/app.js`.
  - `Editor.frameworkPath`: The editor framework module path. Usually it is `{your-app}/editor-framework/`
  - `Editor.dataPath`: Your application's data path. Usually it is `~/.{your-app-name}`

## Protocols
  - `editor-framework://`: Map to the editor framework module path.
  - `app://`: Map to the root path of your app.
  - `packages://{package-name}`: Map to the `{package-name}` path.
  - `widgets://{widget-name}`: Map to the `{widget-name}` path.

## Options

  - `Editor.isDev`: Indicate if the application run with `--dev`
  - `Editor.showDevtools`: Indicate if the application run with `--show-devtools`

## Editor.App

The Editor.App is your app.js module. Read more in [Define your application](../../manual/define-your-app.md).
