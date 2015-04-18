EditorUI.focusable = (function () {

    //
    function _removeTabIndexRecursively ( el ) {
        if ( el.focused !== undefined && el._initTabIndex !== undefined ) {
            el.focused = false;
            el._removeTabIndex();
        }

        var elementDOM = Polymer.dom(el);
        for ( var i = 0; i < elementDOM.children.length; ++i ) {
            _removeTabIndexRecursively ( elementDOM.children[i] );
        }
    }

    function _initTabIndexRecursively ( el ) {
        if ( el.focused !== undefined && el._initTabIndex !== undefined ) {
            if ( el.disabled === false ) {
                el._initTabIndex();
            }
        }

        var elementDOM = Polymer.dom(el);
        for ( var i = 0; i < elementDOM.children.length; ++i ) {
            _initTabIndexRecursively ( elementDOM.children[i] );
        }
    }


    var focusable = {
        'ui-focusable': true,

        properties: {
            focused: {
                type: Boolean,
                value: false,
                reflectToAttribute: true,
                observer: '_focusedChanged',
            },

            disabled: {
                type: Boolean,
                value: false,
                reflectToAttribute: true,
                observer: '_disabledChanged',
            },
        },

        _initFocusable: function ( focusEls ) {
            if ( focusEls ) {
                if ( Array.isArray(focusEls) ) {
                    this.focusEls = focusEls;
                }
                else {
                    this.focusEls = [focusEls];
                }
            }
            else {
                this.focusEls = [];
            }

            this._initTabIndex();
        },

        _initTabIndex: function () {
            if ( !this.focusEls )
                return;

            for ( var i = 0; i < this.focusEls.length; ++i ) {
                var el = this.focusEls[i];
                el.tabIndex = EditorUI.getParentTabIndex(this) + 1;
            }
        },

        _removeTabIndex: function () {
            if ( !this.focusEls )
                return;

            for ( var i = 0; i < this.focusEls.length; ++i ) {
                var el = this.focusEls[i];
                // NOTE: this is better than el.removeAttribute('tabindex'),
                // because <input> only not get focused when tabIndex=-1
                el.tabIndex = -1;
            }
        },

        _disabledInHierarchy: function () {
            if ( this.disabled )
                return true;

            var parent = Polymer.dom(this).parentNode;
            while ( parent ) {
                if ( parent.disabled )
                    return true;

                parent = Polymer.dom(parent).parentNode;
            }
            return false;
        },

        _focusedChanged: function () {
            if ( this.disabled ) {
                this.focused = false;
            }
        },

        _disabledChanged: function () {
            if ( this.disabled ) {
                this.style.pointerEvents = 'none';
                _removeTabIndexRecursively(this);
            }
            else {
                this.style.pointerEvents = '';
                _initTabIndexRecursively(this);
            }
        },

        _focusAction: function ( event ) {
            this.focused = true;
        },

        _blurAction: function ( event ) {
            this.focused = false;
        },

        focus: function () {
            if ( this._disabledInHierarchy() )
                return;

            if ( this.focusEls.length > 0 ) {
                this.focusEls[0].focus();
            }
            this.focused = true;
        },

        blur: function () {
            if ( this._disabledInHierarchy() )
                return;

            if ( this.focusEls.length > 0 ) {
                this.focusEls[0].blur();
            }
            this.focused = false;
        },
    };
    return focusable;
})();
