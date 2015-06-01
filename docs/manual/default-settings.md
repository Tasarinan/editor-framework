## Editor Default Settings

## Paths

  - `Editor.cwd`: The current app.js working directory path.
  - `Editor.mainEntry`: Your main entry file. Usually it is `{your-app}/app.js`.
  - `Editor.frameworkPath`: The editor framework module path. Usually it is `{your-app}/editor-framework/`
  - `Editor.appHome`: Your application's home path. Usually it is `~/.{your-app-name}`

## Protocols
  - `editor-framework://`: Map to the editor framework module path.
  - `app://`: Map to the root path of your app.
  - `packages://{package-name}`: Map to the `{package-name}` path.
  - `widgets://{widget-name}`: Map to the `{widget-name}` path.

## Options

  - `Editor.isDev`: Indicate if the application running with `--dev` option.
  - `Editor.showDevtools`: Indicate if the application running with `--show-devtools`.

## Editor.App

The Editor.App is your app.js module. Read more in [Define your application](../../manual/define-your-app.md).
