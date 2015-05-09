## Define Your Panel Frame

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
