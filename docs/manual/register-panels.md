## Register Your Panels

Panel is the docking unit in Editor Framework. Each panel contains a panel frame.
You can define a polymer element as your panel frame, and register it in `package.json`. The
Editor Framework will dynamically load your custom element when it invoked.

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
Then save it in your package's panel folder. Then register it in your `package.json`:

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

When you use `Editor.Panel.open('simple.panel')` for the package we created above, the panel
will be open and your frame will be loaded in it.

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
