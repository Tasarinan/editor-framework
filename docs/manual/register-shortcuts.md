## Register Shortcuts for Your Panel

You can define keyboard shortcuts for your panel in `package.json`. Here is a simple example:

```json
"panel": {
  "shortcuts": {
    "command+k": "clear",
    "#props": {
      "command+delete": "delete"
    },
    "#view": {
      "command+delete": "delete"
    }
  }
}
```

The shortcut is directly bind to method in your panel frame. Just make sure your have defined the method otherwise the framework will raise a warning.

Editor Framework allows you to register shortcut for a specific element in your panel frame. In this way, you can have a better way to manage your key mappings when focused on different elements.

To achieve this, just add an `id` in your sub-element, and write the id selector (a.k.a `#{your-id}`) as a key in the shortcut, and define the key mappings in it.

Learn more about this in [shortcuts-demo](https://github.com/fireball-x/editor-framework/tree/master/demo/shortcuts)
