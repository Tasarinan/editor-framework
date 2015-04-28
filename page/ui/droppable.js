EditorUI.droppable = (function () {

    var droppable = {
        'ui-droppable': true,

        properties: {
            droppable: {
                type: String,
                value: 'file',
                reflectToAttribute: true,
            },

            singleDrop: {
                type: Boolean,
                value: false,
                reflectToAttribute: true,
            },
        },

        _initDroppable: function ( dropAreaElement ) {
            this._dragenterCnt = 0;

            dropAreaElement.addEventListener( 'dragenter', function (event) {
                // NOTE: do not stopPropagation, otherwise dock-utils can not catch the event
                // event.stopPropagation();

                ++this._dragenterCnt;

                if ( this._dragenterCnt === 1 ) {
                    this.checkIfDroppable( event.dataTransfer, function ( droppable, dragType, dragItems ) {
                        if ( !droppable ) {
                            return;
                        }

                        this.fire('drop-area-enter', {
                            dragType: dragType,
                            dragItems: dragItems,
                            dataTransfer: event.dataTransfer
                        });
                    });
                }
            }.bind(this));

            dropAreaElement.addEventListener( 'dragleave', function (event) {
                // NOTE: do not stopPropagation, otherwise dock-utils can not catch the event
                // event.stopPropagation();

                --this._dragenterCnt;

                if ( this._dragenterCnt === 0 ) {
                    this.checkIfDroppable( event.dataTransfer, function ( droppable, dragType, dragItems ) {
                        if ( !droppable ) {
                            return;
                        }

                        this.fire('drop-area-leave', {
                            dragType: dragType,
                            dragItems: dragItems,
                            dataTransfer: event.dataTransfer
                        });
                    });
                }
            }.bind(this));

            dropAreaElement.addEventListener( 'drop', function (event) {
                this._dragenterCnt = 0;

                this.checkIfDroppable( event.dataTransfer, function ( droppable, dragType, dragItems ) {
                    if ( !droppable ) {
                        return;
                    }

                    event.preventDefault(); // Necessary. Allows us to control the drop
                    event.stopPropagation();

                    EditorUI.DragDrop.end();

                    this.fire('drop-area-accept', {
                        dragType: dragType,
                        dragItems: dragItems,
                        dataTransfer: event.dataTransfer
                    });
                });
            }.bind(this));

            // dropAreaElement.addEventListener( 'dragover', function (event) {
            //     event.preventDefault(); // Necessary. Allows us to control the drop.
            //     event.stopPropagation();

            //     this.checkIfDroppable( event.dataTransfer, function ( droppable, dragType, dragItems ) {
            //         if ( !droppable ) {
            //             return;
            //         }

            //         this.fire('drop-area-dragover', {
            //             dragType: dragType,
            //             dragItems: dragItems,
            //             dataTransfer: event.dataTransfer
            //         });
            //     });
            // }.bind(this));
        },

        checkIfDroppable: function ( dataTransfer, fn ) {
            var droppableList = this.droppable.split(',');
            var dragType = EditorUI.DragDrop.type(dataTransfer);

            var found = false;
            for ( var i = 0; i < droppableList.length; ++i ) {
                if ( dragType === droppableList[i] ) {
                    found = true;
                    break;
                }
            }

            if ( !found ) {
                fn.call( this, false, dragType, dragItems );
                return;
            }

            var dragItems = EditorUI.DragDrop.items(dataTransfer);
            if ( this.singleDrop && dragItems.length > 1 ) {
                fn.call( this, false, dragType, dragItems );
                return;
            }

            fn.call( this, true, dragType, dragItems );
        },
    };

    return droppable;
})();
