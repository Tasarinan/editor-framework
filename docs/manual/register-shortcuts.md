## Register shortcuts for your panel

You can define shortcuts for your panel in `package.json`. Here is a simple example:

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

The shortcut is directly bind to your panel frame's method. Just make sure your have defined
the method otherwise the framework will raise a warning.

The Editor Framework allow you register shortcut for specified element in your panel frame.
In this way, you can have a better way to manage your key mappings when different element focused.
To achieve this, just add an `id` in your sub-element, and write the id selector (a.k.a `#{your-id}`)
as a key in the shortcut, and define the key mappings in it.

Learn more about this in [shortcuts-demo](https://github.com/fireball-x/editor-framework/tree/master/demo/shortcuts)
