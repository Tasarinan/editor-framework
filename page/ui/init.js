var EditorUI = (function () {
    var EditorUI = {};

    EditorUI.index = function ( element ) {
        var parentEL = Polymer.dom(element).parentNode;
        var parentDOM = Polymer.dom(parentEL);
        var curChildEL = parentDOM.children.length > 0 ? parentDOM.children[0] : null;

        for ( var i = 0, len = parentDOM.children.length; i < len; ++i ) {
            if ( parentDOM.children[i] === element )
                return i;
        }

        return -1;
    };

    var _findInChildren = function ( element, elementToFind ) {
        var elementDOM = Polymer.dom(element);

        for ( var i = 0; i < elementDOM.children.length; ++i ) {
            var childEL = elementDOM.children[i];
            if ( childEL === elementToFind )
                return true;

            if ( Polymer.dom(childEL).children.length > 0 )
                if ( _findInChildren( childEL, elementToFind ) )
                    return true;
        }
        return false;
    };

    //
    EditorUI.find = function ( elements, elementToFind ) {
        if ( Array.isArray(elements) ||
             elements instanceof NodeList ||
             elements instanceof HTMLCollection )
        {
            for ( var i = 0; i < elements.length; ++i ) {
                var element = elements[i];
                if ( element === elementToFind )
                    return true;

                if ( _findInChildren ( element, elementToFind ) )
                    return true;
            }
            return false;
        }

        // if this is a single element
        if ( elements === elementToFind )
            return true;

        return _findInChildren( elements, elementToFind );
    };

    //
    EditorUI.getParentTabIndex = function ( element ) {
        var parent = Polymer.dom(element).parentNode;
        while ( parent ) {
            if ( parent.tabIndex !== null &&
                 parent.tabIndex !== undefined &&
                 parent.tabIndex !== -1 )
                return parent.tabIndex;

            parent = Polymer.dom(parent).parentNode;
        }
        return 0;
    };

    //
    EditorUI.getSelfOrAncient = function ( element, parentType ) {
        var parent = element;
        while ( parent ) {
            if ( parent instanceof parentType )
                return parent;

            parent = Polymer.dom(parent).parentNode;
        }
        return 0;
    };

    //
    EditorUI.getFirstFocusableChild = function ( element ) {
        if ( element.tabIndex !== null &&
             element.tabIndex !== undefined &&
             element.tabIndex !== -1 )
        {
            return element;
        }

        var el = null;
        var elementDOM = Polymer.dom(element);
        for ( var i = 0; i < elementDOM.children.length; ++i ) {
            el = EditorUI.getFirstFocusableChild(elementDOM.children[i]);
            if ( el !== null )
                return el;
        }

        var rootDOM = Polymer.dom(element.root);
        if ( rootDOM ) {
            el = EditorUI.getFirstFocusableChild(rootDOM);
            if ( el !== null )
                return el;
        }

        return null;
    };

    //
    var _dragGhost = null;
    EditorUI.addDragGhost = function ( cursor ) {
        // add drag-ghost
        if ( _dragGhost === null ) {
            _dragGhost = document.createElement('div');
            _dragGhost.classList.add('drag-ghost');
            _dragGhost.style.position = 'absolute';
            _dragGhost.style.zIndex = '999';
            _dragGhost.style.top = '0';
            _dragGhost.style.right = '0';
            _dragGhost.style.bottom = '0';
            _dragGhost.style.left = '0';
            _dragGhost.oncontextmenu = function() { return false; };
        }
        _dragGhost.style.cursor = cursor;
        document.body.appendChild(_dragGhost);
    };

    EditorUI.removeDragGhost = function () {
        if ( _dragGhost !== null ) {
            _dragGhost.style.cursor = 'auto';
            if ( _dragGhost.parentElement !== null ) {
                _dragGhost.parentElement.removeChild(_dragGhost);
            }
        }
    };

    //
    var _hitGhost = null;
    EditorUI.addHitGhost = function ( cursor, zindex, onhit ) {
        // add drag-ghost
        if ( _hitGhost === null ) {
            _hitGhost = document.createElement('div');
            _hitGhost.classList.add('hit-ghost');
            _hitGhost.style.position = 'absolute';
            _hitGhost.style.zIndex = zindex;
            _hitGhost.style.top = '0';
            _hitGhost.style.right = '0';
            _hitGhost.style.bottom = '0';
            _hitGhost.style.left = '0';
            // _hitGhost.style.background = 'rgba(0,0,0,0.2)';
            _hitGhost.oncontextmenu = function() { return false; };
        }

        _hitGhost.style.cursor = cursor;
        _hitGhost.addEventListener('mousedown', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if ( onhit )
                onhit();
        });
        document.body.appendChild(_hitGhost);
    };

    EditorUI.removeHitGhost = function () {
        if ( _hitGhost !== null ) {
            _hitGhost.style.cursor = 'auto';
            if ( _hitGhost.parentElement !== null ) {
                _hitGhost.parentElement.removeChild(_hitGhost);
                _hitGhost.removeEventListener('mousedown');
            }
        }
    };

    function _createLayouts ( parentEL, infos, importList ) {
        for ( var i = 0; i < infos.length; ++i ) {
            var info = infos[i];

            var el;

            if ( info.type === 'dock' ) {
                el = new EditorUI.Dock();
            }
            else if ( info.type === 'panel' ) {
                el = new EditorUI.Panel();
            }

            if ( !el ) continue;

            if ( info.row !== undefined ) {
                el.row = info.row;
            }
            if ( info.width !== undefined ) {
                el.curWidth = info.width;
            }
            if ( info.height !== undefined ) {
                el.curHeight = info.height;
            }

            if ( info.docks ) {
                _createLayouts ( el, info.docks, importList );
            }
            else if ( info.panels ) {
                for ( var j = 0; j < info.panels.length; ++j ) {
                    importList.push( { dockEL: el, panelID: info.panels[j], active: j === info.active } );
                }
            }

            Polymer.dom(parentEL).appendChild(el);
        }
        parentEL._initResizers();
    }

    EditorUI.createLayout = function ( parentEL, layoutInfo ) {
        var importList = [];

        // if we have root, clear all children in it
        var rootEL = EditorUI.DockUtils.root;
        if ( rootEL ) {
            rootEL.remove();
            EditorUI.DockUtils.root = null;
        }

        rootEL = new EditorUI.Dock();
        rootEL.classList.add('fit');
        rootEL.setAttribute('no-collapse', '');

        if ( layoutInfo ) {
            if ( layoutInfo.row ) rootEL.setAttribute('row', '');
            _createLayouts( rootEL, layoutInfo.docks, importList );
        }

        Polymer.dom(parentEL).appendChild(rootEL);
        EditorUI.DockUtils.root = rootEL;

        return importList;
    };

    //
    EditorUI.mixin = function ( obj ) {
        'use strict';
        for ( var i = 1, length = arguments.length; i < length; ++i ) {
            var source = arguments[i];
            for ( var name in source) {
                if ( name === 'properties' ||
                     name === 'observers' ||
                     name === 'listeners' )
                {
                    obj[name] = Editor.JS.addon( obj[name], source[name] );
                }
                else {
                    if ( obj[name] === undefined ) {
                        Editor.JS.copyprop( name, source, obj);
                    }
                }
            }
        }
        return obj;
    };

    return EditorUI;
})();
