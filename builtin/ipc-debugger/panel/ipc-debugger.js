(function () {

var Ipc = require('ipc');

var name = 'ipc-debugger';
window[name] = {};
window[name].panel = Polymer({
    is: name,

    properties: {
    },

    ready: function () {
        this.inspects = {};

        Editor.sendRequestToCore( 'ipc-debugger:query', function ( results ) {
            this.ipcInfos = results.filter ( function ( item ) {
                return !/^ATOM/.test(item.name);
            });
            this.ipcInfos.sort( function ( a, b ) {
                var result = a.level.localeCompare( b.level );
                if ( result === 0 ) {
                    result = a.name.localeCompare(b.name);
                }
                return result;
            });

            // NOTE: the sort will not repaint in x-repeat,
            // TODO: keep watching on Polymer updates
            this.ipcInfos = this.ipcInfos.slice();
        }.bind(this));
    },

    _onInspect: function ( event ) {
        event.stopPropagation();

        var item = this.$.list.itemForElement(event.target);
        item.inspect = !item.inspect;
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
});

})();
