EditorUI.resizable = (function () {
    function _notifyResizeRecursively ( element ) {
        element.dispatchEvent( new CustomEvent('resize') );

        for ( var i = 0; i < element.children.length; ++i ) {
            var childEL = element.children[i];
            if ( childEL instanceof FireDockResizer )
                continue;

            _notifyResizeRecursively(childEL);
        }
    }

    var resizable = {
        publish: {
            'width': 'auto',
            'min-width': 'auto',
            'max-width': 'auto',

            'height': 'auto',
            'min-height': 'auto',
            'max-height': 'auto',
        },

        calcWidth: function ( width ) {
            if ( this.computedMinWidth !== 'auto' && width < this.computedMinWidth ) {
                return this.computedMinWidth;
            }

            if ( this.computedMaxWidth !== 'auto' && width > this.computedMaxWidth ) {
                return this.computedMaxWidth;
            }

            return width;
        },

        calcHeight: function ( height ) {
            if ( this.computedMinHeight !== 'auto' && height < this.computedMinHeight ) {
                return this.computedMinHeight;
            }

            if ( this.computedMaxHeight !== 'auto' && height > this.computedMaxHeight ) {
                return this.computedMaxHeight;
            }

            return height;
        },

        // init size from its own attributes
        initSize: function () {
            var minWidth = this['min-width'];
            var maxWidth = this['max-width'];
            if ( maxWidth !== 'auto' &&
                 minWidth !== 'auto' &&
                 maxWidth < minWidth )
            {
                this['max-width'] = maxWidth = minWidth;
            }

            var minHeight = this['min-height'];
            var maxHeight = this['max-height'];
            if ( maxHeight !== 'auto' &&
                 minHeight !== 'auto' &&
                 maxHeight < minHeight )
            {
                this['max-height'] = maxHeight = minHeight;
            }

            // width
            this.curWidth = this.computedWidth = this.width;

            // height
            this.curHeight = this.computedHeight = this.height;

            // min-width
            this.computedMinWidth = minWidth;
            if ( this.computedMinWidth !== 'auto' ) {
                this.style.minWidth = this.computedMinWidth + 'px';
            }
            else {
                this.style.minWidth = 'auto';
            }

            // max-width
            this.computedMaxWidth = maxWidth;
            if ( this.computedMaxWidth !== 'auto' ) {
                this.style.maxWidth = this.computedMaxWidth + 'px';
            }
            else {
                this.style.maxWidth = 'auto';
            }

            // min-height
            this.computedMinHeight = minHeight;
            if ( this.computedMinHeight !== 'auto' ) {
                this.style.minHeight = this.computedMinHeight + 'px';
            }
            else {
                this.style.minHeight = 'auto';
            }

            // max-height
            this.computedMaxHeight = maxHeight;
            if ( this.computedMaxHeight !== 'auto' ) {
                this.style.maxHeight = this.computedMaxHeight + 'px';
            }
            else {
                this.style.maxHeight = 'auto';
            }
        },

        // init and finalize min,max depends on children
        finalizeSize: function ( elements ) {
            var autoWidth = false, autoHeight = false;

            // reset width, height
            this.computedWidth = this.width;
            this.computedHeight = this.height;

            for ( var i = 0; i < elements.length; ++i ) {
                var el = elements[i];

                // width
                if ( autoWidth || el.computedWidth === 'auto' ) {
                    autoWidth = true;
                    this.computedWidth = 'auto';
                }
                else {
                    if ( this.width === 'auto' || el.computedWidth > this.computedWidth ) {
                        this.computedWidth = el.computedWidth;
                    }
                }

                // height
                if ( autoHeight || el.computedHeight === 'auto' ) {
                    autoHeight = true;
                    this.computedHeight = 'auto';
                }
                else {
                    if ( this.height === 'auto' || el.computedHeight > this.computedHeight ) {
                        this.computedHeight = el.computedHeight;
                    }
                }
            }

            this.curWidth = this.computedWidth;
            this.curHeight = this.computedHeight;
        },

        // init and finalize min,max depends on children
        finalizeMinMax: function ( elements, row ) {
            var i, el;
            var infWidth = false, infHeight = false;

            this.computedMinWidth = 3 * (elements.length-1); // preserve resizers' width
            this.computedMinHeight = 3 * (elements.length-1); // preserve resizers' height
            this.computedMaxWidth = this['max-width'];
            this.computedMaxHeight = this['max-height'];

            // collect child elements' size

            if ( row ) {
                for ( i = 0; i < elements.length; ++i ) {
                    el = elements[i];

                    // min-width
                    if ( el.computedMinWidth !== 'auto' ) {
                        this.computedMinWidth += el.computedMinWidth;
                    }

                    // min-height
                    if ( el.computedMinHeight !== 'auto' &&
                         this.computedMinHeight < el.computedMinHeight ) {
                        this.computedMinHeight = el.computedMinHeight;
                    }

                    // max-width
                    if ( infWidth || el.computedMaxWidth === 'auto' ) {
                        infWidth = true;
                        this.computedMaxWidth = 'auto';
                    }
                    else {
                        this.computedMaxWidth += el.computedMaxWidth;
                    }

                    // max-height
                    if ( infHeight || el.computedMaxHeight === 'auto' ) {
                        infHeight = true;
                        this.computedMaxHeight = 'auto';
                    }
                    else {
                        if ( this.computedMaxHeight < el.computedMaxHeight ) {
                            this.computedMaxHeight = el.computedMaxHeight;
                        }
                    }
                }
            }
            else {
                for ( i = 0; i < elements.length; ++i ) {
                    el = elements[i];

                    // min-width
                    if ( el.computedMinWidth !== 'auto' &&
                         this.computedMinWidth < el.computedMinWidth ) {
                        this.computedMinWidth = el.computedMinWidth;
                    }

                    // min-height
                    if ( el.computedMinHeight !== 'auto' ) {
                        this.computedMinHeight += el.computedMinHeight;
                    }

                    // max-width
                    if ( infWidth || el.computedMaxWidth === 'auto' ) {
                        infWidth = true;
                        this.computedMaxWidth = 'auto';
                    }
                    else {
                        if ( this.computedMaxWidth < el.computedMaxWidth ) {
                            this.computedMaxWidth = el.computedMaxWidth;
                        }
                    }

                    // max-height
                    if ( infHeight || el.computedMaxHeight === 'auto' ) {
                        infHeight = true;
                        this.computedMaxHeight = 'auto';
                    }
                    else {
                        this.computedMaxHeight += el.computedMaxHeight;
                    }
                }
            }

            // final decision

            // min-width
            if ( this.computedMinWidth !== 'auto' ) {
                this.style.minWidth = this.computedMinWidth + 'px';
            }
            else {
                this.style.minWidth = 'auto';
            }

            // max-width
            if ( this.computedMaxWidth !== 'auto' ) {
                this.style.maxWidth = this.computedMaxWidth + 'px';
            }
            else {
                this.style.maxWidth = 'auto';
            }

            // min-height
            if ( this.computedMinHeight !== 'auto' ) {
                this.style.minHeight = this.computedMinHeight + 'px';
            }
            else {
                this.style.minHeight = 'auto';
            }

            // max-height
            if ( this.computedMaxHeight !== 'auto' ) {
                this.style.maxHeight = this.computedMaxHeight + 'px';
            }
            else {
                this.style.maxHeight = 'auto';
            }
        },

        _notifyResize: function () {
            _notifyResizeRecursively(this);
        },

        _initResizable: function () {
            this.initSize();
        },
    };
    return resizable;
})();
