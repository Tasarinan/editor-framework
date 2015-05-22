## Register Your Panels

Panel is the docking unit in Editor Framework. Each panel contains a panel frame.
You can define a polymer element as your panel frame, and register it in `package.json`. The
Editor Framework will dynamically load your polymer element when the panel opened.

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
Then save it in your package's panel folder. After that register the html file in `package.json`:

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

Once your package loaded, you can use `Editor.Panel.open('simple.panel')` to open your panel.

## Panel ID

A panel id is a string equals to `{package-name}.{panel-name}`. It is used in most of
the functions in `Editor.Panel` that needs to operate a specific panel.

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

The file register two panels `bar` and `bar02`, so that we will have two panel ID
whiches are `foo.bar` and `foo.bar02`.

## Messages

TODO:


## Shortcuts

TODO:

## Profiles

TODO:

## Message: 'panel:open (argv)'

Invoke when panel open or panel show up. The argv is an `Object` that you send
through `Editor.Panel.open`.

Example:

```javascript
Editor.Panel.open( 'your.panel.id', {
    cwd: '~/editor-framework/',
    file: 'foo/bar/foobar.js',
});
```
