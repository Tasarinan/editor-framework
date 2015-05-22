EditorUI.DragDrop = (function () {
    var Path = null;
    if ( Editor.isNative ) {
        Path = require('fire-path');
    }

    var _allowed = false;

    var DragDrop = {
        start: function ( dataTransfer, effect, type, items ) {
            var ids = items.map( function (item) {
                return item.id;
            } );
            dataTransfer.effectAllowed = effect;
            dataTransfer.dropEffect = 'none';
            dataTransfer.setData('editor/type', type);
            dataTransfer.setData('editor/items', ids.join());
            var img = this.getDragIcon(items);
            dataTransfer.setDragImage(img, -10, 10);
        },

        drop: function ( dataTransfer ) {
            var results = [];
            if ( _allowed ) {
                results = DragDrop.items(dataTransfer);
            }

            _allowed = false;

            return results;
        },

        end: function () {
            _allowed = false;
        },

        updateDropEffect: function ( dataTransfer, dropEffect ) {
            if ( _allowed ) {
                dataTransfer.dropEffect = dropEffect;
            }
            else {
                dataTransfer.dropEffect = 'none';
            }
        },

        allowDrop: function ( dataTransfer, allowed ) {
            _allowed = allowed;
            if ( !_allowed ) {
                dataTransfer.dropEffect = 'none';
            }
        },

        type: function ( dataTransfer ) {
            var type = dataTransfer.getData('editor/type');

            if ( type === '' && dataTransfer.files.length > 0 )
                return 'file';

            return type;
        },

        items: function ( dataTransfer ) {
            var type = DragDrop.type(dataTransfer);
            var items;

            if ( type === 'file' ) {
                var files = dataTransfer.files;
                items = [];

                for ( var i = 0; i < files.length; ++i ) {
                    var exists = false;

                    // filter out sub file paths if we have Path module
                    if ( Path ) {
                        for ( var j = 0; j < items.length; ++j ) {
                            if ( Path.contains( items[j], files[i].path ) ) {
                                exists = true;
                                break;
                            }
                        }
                    }

                    if ( !exists ) {
                        items.push( files[i].path );
                    }
                }
            }
            else {
                items = dataTransfer.getData('editor/items');
                if ( items !== '' ) {
                    items = items.split(',');
                }
                else {
                    items = [];
                }
            }

            return items;
        },

        // NOTE: The image will be blur in retina, still not find a solution.
        getDragIcon: function (items) {
            var icon = new Image();
            var canvas = document.createElement('canvas');
            var imgPanel = canvas.getContext('2d');
            imgPanel.font = 'normal 12px Arial';
            imgPanel.fillStyle = 'white';
            var top = 0;
            for ( var i = 0; i < items.length; ++i ) {
                var item = items[i];
                if ( i <= 4 ) {
                    icon.src = 'uuid://' + item.id + '?thumb';
                    imgPanel.drawImage(icon,0,top,16,16); // icon
                    imgPanel.fillText(item.name,20,top + 15); // text
                    top += 15;
                }
                else {
                    imgPanel.fillStyle = 'gray';
                    imgPanel.fillText('[more.....]',20,top + 15);
                    break;
                }

            }

            icon.src = canvas.toDataURL();
            return icon;
        },
    };

    Object.defineProperty( DragDrop, 'allowed', {
        get: function () { return _allowed; }
    });

    return DragDrop;
})();
