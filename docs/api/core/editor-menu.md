## Editor.Menu

The `Editor.Menu` module extends the Menu module in electron.

## new Editor.Menu( template, webContents )

Same as [Electron's Menu Item](https://github.com/atom/electron/blob/master/docs/api/menu-item.md),
and add some other values:

- `template`: Array or Object
    - `message`: String - Ipc message name
    - `params`: Array - The parameters passed through ipc
    - `panel`: String - The panelID, if specified, the message will send to panel

## Class Method: reset(template)

Reset the menu items by the template

## Class Method: clear()

Clear the menu items

## Class Method: add( path, template )

Build a template and add it to path

Example:

```javascript
var editorMenu = new Editor.Menu();
editorMenu.add( 'foo/bar', {
    label: foobar,
    message: 'foobar:say',
    params: ['foobar: hello!']
});
```

## Class Method: remove( path )

Remove menu item at path

## Class Method: set( path, options )

Set menu item at path by options

 - `options`: Object
   - `icon`: NativeImage
   - `enabled`: Boolean
   - `visible`: Boolean
   - `checked`: Boolean
   - `position`: String

## EditorMenu.parseTemplate( template, webContents )

Converts Editor.Menu's template to Electron menu template.
If webContents provided, all `message` send to the target webContents.

