## Register Your Panels

Panel is the dockable "mini-windows" unit in Editor Framework. Each panel contains a panel frame.

You can define a polymer element as your panel frame, and register it in `package.json`. The Editor Framework will dynamically load your polymer element when the panel is opened.

To define a panel frame, just create a html file like this:

```html
<dom-module id="simple-panel">
    <style>
        :host {
            display: flex;
            flex-wrap: nowrap;
            align-items: stretch;
            flex-direction: column;
        }
    </style>

    <template>
        This is a simple panel
    </template>
</dom-module>

<script>
    Editor.registerPanel( 'simple.panel', {
        is: 'simple-panel',
    });
</script>
```

Then save it to your package's `panel` folder. After that register the html file in `package.json`:

```json
{
  "name": "simple",
  "panels": {
    "panel": {
      "frame": "panel/simple.html",
      "type": "dockable",
      "title": "Simple",
      "width": 800,
      "height": 600
    }
  }
}
```

Once your package is loaded, you can use `Editor.Panel.open('simple.panel')` to open your panel.

## Panel ID

A panelID is a string equals to `{package-name}.{panel-name}`. It is used in most of the functions in `Editor.Panel` that needs to operate on a specific panel.

Suppose we have the following `package.json` file:

```json
{
  "name": "foo",
  "panels": {
    "bar": {
      "frame": "panel/simple.html"
    },
    "bar02": {
      "frame": "panel/simple.html"
    }
  }
}
```

The file registers two panels `bar` and `bar02`, so that we will have two panelID which are `foo.bar` and `foo.bar02`.

## Messages

TODO:


## Shortcuts

TODO:

## Profiles

TODO:

## Message: 'panel:open (argv)'

Invoked when panel opens or panel shows up. The `argv` is an `Object` that you send through `Editor.Panel.open`.

Example:

```javascript
Editor.Panel.open( 'your.panel.id', {
    cwd: '~/editor-framework/',
    file: 'foo/bar/foobar.js',
});
```
