## Editor

## Editor Paths

  - `Editor.cwd`: The current app.js running directory.
  - `Editor.mainEntry`: Your main entry file. Usually it is `{your-app}/app.js`.
  - `Editor.frameworkPath`: The editor framework module path. Usually it is `{your-app}/editor-framework/`
  - `Editor.dataPath`: Your application's data path. Usually it is `~/.{your-app-name}`

## Editor Options

  - `Editor.isDev`: Indicate if the application run with `--dev`
  - `Editor.showDevtools`: Indicate if the application run with `--show-devtools`

## Editor.App

The Editor.App is your app.js module. Read more in [Define your application](../../manual/define-your-app.md).

## Class Method: Editor.registerProtocol( protocol, fn )
  - `protocol` String
  - `fn` Function

Register a protocol so that `Editor.url` can use it to convert an url to the filesystem path.
The `fn` accept an url Object via [url.parse](https://iojs.org/api/url.html#url_url_parse_urlstr_parsequerystring_slashesdenotehost)

```javascript
var Path = require('path');

var _urlToPath = function ( base ) {
    return function ( urlInfo ) {
        if ( urlInfo.pathname ) {
            return Path.join( base, urlInfo.host, urlInfo.pathname );
        }
        return Path.join( base, urlInfo.host );
    };
};

Editor.registerProtocol('editor-framework', _urlToPath(Editor.frameworkPath));
```

## Class Method: Editor.quit()

Quit your App

## Class Method: Editor.registerPackagePath( path )
  - `path` String

Add an absolute filesystem path for loading packages in Editor Framework.

## Class Method: Editor.registerProfilePath( type, path )
  - `type` String
  - `path` String

Add an absolute filesystem path for loading profiles via `type` in Editor Framework.

## Class Method: Editor.url( url )
  - `url` String

Convert a url by its protocol to a filesystem path. This function is useful when you try to
get some internal file. You can use `Editor.registerProtocol` to register and map your filesystem
path to url. By default, Editor Framework register `editor-framework://` and `app://` protocol.

```javascript
Editor.url('app://foobar/foobar.js');
// will return "{your-app-path}/foobar/foobar.js"
```

## Class Method: Editor.loadProfile( name, type, defaultProfile )
  - `name` String
  - `type` String
  - `defaultProfile` Object
  - `return` Object

Load profile via `name` and `type`, if no profile found, it will use the `defaultProfile` and
save it to the disk.

You must register your profile path with `type` through `Editor.registerProfilePath` before you
can use it. The Editor Framework then will search a profile under your register path with the
`name`.

A profile Object will be return. The object includes the properties parse from the json file
and two more functions:

 - `save` Save your profile
 - `clear` Clear all properties in your profile

Example:

```javascript
// register a project profile
Editor.registerProfilePath( 'project', '~/foo/bar');

// load the profile at ~/foo/bar/foobar.json
var foobarProfile = Editor.loadProfile( 'foobar', 'project', {
  foo: 'foo',
  bar: 'bar',
});

// change and save your profile
foobarProfile.foo = 'hello foo';
foobarProfile.save();
```

## Class Method: Editor.sendToWindows( channel[, args...] )
  - `channel` String

Send `args...` to all opened windows via `channel` in asynchronous message. The `page-level`
can handle it by listening to the channel event of ipc module.

In `core-level`:

```javascript
Editor.sendToWindows('foo:bar', 'Hello World!');
```

In `page-level`:

```html
// index.html
<html>
<body>
  <script>
    require('ipc').on('foo:bar', function(message) {
      console.log(message);  // Prints "Hello World!"
    });
  </script>
</body>
</html>
```

## Class Method: Editor.sendToAll( channel[, args...] )
  - `channel` String

Send `args...` to all opened window and core via `channel` in asynchronous message.

## Class Method: Editor.sendToCore( channel[, args...] )
  - `channel` String

Send `args...` to core itself via `channel` in asynchronous message.

## Class Method: Editor.sendToMainWindow( channel[, args...] )
  - `channel` String

Send `args...` to main window via `channel` in asynchronous message.

## Class Method: Editor.sendToPanel( panelID, channel[, args...] )
  - `panelID` String
  - `channel` String

Send `args...` to specific panel via `channel` in asynchronous message.
