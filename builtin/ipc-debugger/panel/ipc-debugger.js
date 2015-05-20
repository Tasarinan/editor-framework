(function () {

var Ipc = require('ipc');

Editor.registerPanel( 'ipc-debugger.panel', {
    is: 'ipc-debugger',

    properties: {
    },

    ready: function () {
        this.inspects = {};
        this.refresh();
    },

    attached: function () {
        EditorUI.update( this, 'ipcInfos' );
    },

    _onRefresh: function ( event ) {
        this.refresh();
    },

    _onInspect: function ( event ) {
        event.stopPropagation();

        var model = event.model;
        // var item = this.$.list.itemForElement(event.target);
        var item = model.item;
        model.set( 'item.inspect', !item.inspect );
        event.target.classList.toggle( 'active', item.inspect );

        if ( item.level === 'core' ) {
            if ( item.inspect ) {
                Editor.sendToCore( 'ipc-debugger:inspect', item.name );
            }
            else {
                Editor.sendToCore( 'ipc-debugger:uninspect', item.name );
            }
        }
        else {
            if ( item.inspect ) {
                this.inspect(item.name);
            }
            else {
                this.uninspect(item.name);
            }
        }

        this.refresh();
    },

    inspect: function ( name ) {
        var fn = function () {
            var args = [].slice.call( arguments, 0 );
            args.unshift( 'ipc-debugger[page][' + name + ']' );
            Editor.success.apply( Editor, args );
        };
        this.inspects[name] = fn;
        Ipc.on( name, fn );
    },

    uninspect: function ( name ) {
        var fn = this.inspects[name];
        if ( fn ) {
            Ipc.removeListener( name, fn );
            delete this.inspects[name];
        }
    },

    refresh: function () {
        Editor.sendRequestToCore( 'ipc-debugger:query', function ( results ) {
            var ipcInfos = results.filter ( function ( item ) {
                return !/^ATOM/.test(item.name);
            });

            ipcInfos.sort( function ( a, b ) {
                var result = a.level.localeCompare( b.level );
                if ( result === 0 ) {
                    result = a.name.localeCompare(b.name);
                }
                return result;
            });

            ipcInfos = ipcInfos.map( function ( item ) {
                if ( item.level === 'page' ) {
                    item.inspect = this.inspects[item.name] !== undefined;
                }
                return item;
            }.bind(this));

            this.set( 'ipcInfos', ipcInfos );
        }.bind(this));
    },
});

})();
