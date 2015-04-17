var EditorUI = (function () {
    var UI = {};

    EditorUI.index = function ( element ) {
        var parent = element.parentElement;
        var curChildEL = parent.firstElementChild;

        var idx = 0;
        while ( curChildEL ) {
            if ( curChildEL === element )
                return idx;

            ++idx;
            curChildEL = curChildEL.nextElementSibling;
        }

        return -1;
    };

    var _findInChildren = function ( element, elementToFind ) {
        for ( var i = 0; i < element.children.length; ++i ) {
            var childEL = element.children[i];
            if ( childEL === elementToFind )
                return true;

            if ( childEL.children.length > 0 )
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
        var parent = element.parentElement;
        while ( parent ) {
            if ( parent.tabIndex !== null &&
                 parent.tabIndex !== undefined &&
                 parent.tabIndex !== -1 )
                return parent.tabIndex;

            parent = parent.parentElement;
        }
        return 0;
    };

    //
    EditorUI.getSelfOrAncient = function ( element, parentType ) {
        var parent = element;
        while ( parent ) {
            if ( parent instanceof parentType )
                return parent;

            parent = parent.parentElement;
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
        for ( var i = 0; i < element.children.length; ++i ) {
            el = EditorUI.getFirstFocusableChild(element.children[i]);
            if ( el !== null )
                return el;
        }
        if ( element.shadowRoot ) {
            el = EditorUI.getFirstFocusableChild(element.shadowRoot);
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

    return EditorUI;
})();
