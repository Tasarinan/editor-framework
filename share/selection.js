var Ipc = require('ipc');

var _lastActiveUnit = null;
var _units = {};

// SelectionUnit

function SelectionUnit(type) {
    this.type = type;
    this.selection = [];
    this.lastActive = null;
    this.lastHover = null;
    this._context = null; // NOTE: it is better to use lastHover, but some platform have bug with lastHover

    this.ipc_selected = 'selection:selected';       // argument is an array of ids
    this.ipc_unselected = 'selection:unselected';   // argument is an array of ids
    this.ipc_activated = 'selection:activated';     // argument is an id
    this.ipc_deactivated = 'selection:deactivated'; // argument is an id
    this.ipc_hoverin = 'selection:hoverin';         // argument is an id
    this.ipc_hoverout = 'selection:hoverout';       // argument is an id
    this.ipc_changed = 'selection:changed';
}

SelectionUnit.prototype._activate = function (id) {
    if (this.lastActive !== id) {
        if (this.lastActive) {
            Editor.sendToAll( this.ipc_deactivated, this.type, this.lastActive );
        }
        this.lastActive = id;
        Editor.sendToAll( this.ipc_activated, this.type, id );
        _lastActiveUnit = this;
    }
};

SelectionUnit.prototype._unselectOthers = function (id) {
    var changed = false;

    if (Array.isArray(id)) {
        var unselected = [];
        for (var j = this.selection.length - 1; j >= 0; j--) {
            var selected = this.selection[j];
            if (id.indexOf(selected) === -1) {
                this.selection.splice(j, 1);
                unselected.push(selected);
            }
        }
        if (unselected.length > 0) {
            Editor.sendToAll(this.ipc_unselected, this.type, unselected);
            changed = true;
        }
    }
    else {
        var index = this.selection.indexOf(id);
        if (index !== -1) {
            this.selection.splice(index, 1);
            if (this.selection.length > 0) {
                Editor.sendToAll(this.ipc_unselected, this.type, this.selection);
                changed = true;
            }
            this.selection = [id];
        }
        else {
            if (this.selection.length > 0) {
                Editor.sendToAll(this.ipc_unselected, this.type, this.selection);
                changed = true;
            }
            this.selection.length = 0;
        }
    }

    return changed;
};

SelectionUnit.prototype.select = function (id, unselectOthers) {
    var changed = false;

    if (unselectOthers) {
        changed = this._unselectOthers(id);
    }

    if ( !Array.isArray(id) ) {
        // single
        if (this.selection.indexOf(id) === -1) {
            this.selection.push(id);
            Editor.sendToAll(this.ipc_selected, this.type, [id]);
            changed = true;
        }
        this._activate(id);
    }
    else if (id.length > 0) {
        // array
        var diff = [];
        for (var i = 0; i < id.length; i++) {
            if (this.selection.indexOf(id[i]) === -1) {
                this.selection.push(id[i]);
                diff.push(id[i]);
            }
        }
        if (diff.length > 0) {
            Editor.sendToAll(this.ipc_selected, this.type, diff);
            changed = true;
        }
        this._activate(id[id.length - 1]);
    }

    if ( changed )
        Editor.sendToAll(this.ipc_changed, this.type);
};

SelectionUnit.prototype.unselect = function (id) {
    var changed = false;
    var unselectActiveObj = false;

    if ( !Array.isArray(id) ) {
        // single
        var index = this.selection.indexOf(id);
        if (index !== -1) {
            this.selection.splice(index, 1);
            Editor.sendToAll(this.ipc_unselected, this.type, [id]);
            unselectActiveObj = (id === this.lastActive);
            changed = true;
        }
    }
    else if (id.length > 0) {
        // array
        var diff = [];
        for (var i = 0; i < id.length; i++) {
            var index2 = this.selection.indexOf(id[i]);
            if (index2 !== -1) {
                this.selection.splice(index2, 1);
                diff.push(id[i]);
                unselectActiveObj = unselectActiveObj || (id[i] === this.lastActive);
            }
        }
        if (diff.length > 0) {
            Editor.sendToAll(this.ipc_unselected, this.type, diff);
            changed = true;
        }
    }

    if (unselectActiveObj) {
        // activate another
        if (this.selection.length > 0) {
            this._activate(this.selection[this.selection.length - 1]);
        }
        else {
            this._activate('');
        }
    }

    if ( changed )
        Editor.sendToAll(this.ipc_changed, this.type);
};

SelectionUnit.prototype.hover = function (id) {
    if ( this.lastHover !== id ) {
        if ( this.lastHover ) {
            Editor.sendToAll(this.ipc_hoverout, this.type, this.lastHover);
        }
        this.lastHover = id;
        if ( id ) {
            Editor.sendToAll(this.ipc_hoverin, this.type, id);
        }
    }
};

SelectionUnit.prototype.setContext = function (id) {
    this._context = id;
};

/**
 * @property {string[]} contexts - (Read Only)
 */
Object.defineProperty(SelectionUnit.prototype, 'contexts', {
    get: function () {
        var id = this._context;
        if (id) {
            var index = this.selection.indexOf(id);
            if (index !== -1) {
                var selection = this.selection.slice(0);
                // make the first one as current active
                var firstToSwap = selection[0];
                selection[0] = id;
                selection[index] = firstToSwap;
                return selection;
            }
            else {
                return [id];
            }
        }
        else {
            return [];
        }
    },
    enumerable: true
});

SelectionUnit.prototype.clear = function () {
    Editor.sendToAll(this.ipc_unselected, this.type, this.selection);
    this.selection.length = 0;
    this._activate('');

    Editor.sendToAll(this.ipc_changed, this.type);
};

// ConfirmableSelectionUnit

var $super = SelectionUnit;
function ConfirmableSelectionUnit (type) {
    SelectionUnit.call(this, type);

    this.confirmed = true;
    this._confirmedSnapShot = []; // for cancel
}
Editor.JS.extend(ConfirmableSelectionUnit, $super);

ConfirmableSelectionUnit.prototype._activate = function (id) {
    if ( this.confirmed ) {
        $super.prototype._activate.call( this, id );
    }
};

function _checkConfirm (confirm) {
    if ( !this.confirmed && confirm ) {
        // confirm selecting
        this.confirm();
    }
    else if ( this.confirmed && !confirm ) {
        // take snapshot
        this._confirmedSnapShot = this.selection.slice();
        this.confirmed = false;
    }
}

ConfirmableSelectionUnit.prototype.select = function (id, unselectOthers, confirm) {
    _checkConfirm.call(this, confirm);
    $super.prototype.select.call(this, id, unselectOthers);
};

ConfirmableSelectionUnit.prototype.unselect = function (id, confirm) {
    _checkConfirm.call(this, confirm);
    $super.prototype.unselect.call(this, id);
};

ConfirmableSelectionUnit.prototype.confirm = function () {
    if ( !this.confirmed ) {
        this._confirmedSnapShot.length = 0;
        this.confirmed = true;
        this._activate(this.selection[this.selection.length - 1]);
    }
};

ConfirmableSelectionUnit.prototype.cancel = function () {
    if ( !this.confirmed ) {
        $super.prototype.select.call(this, this._confirmedSnapShot, true);
        this._confirmedSnapShot.length = 0;
        this.confirmed = true;
    }
};

/**
 * Selection module
 * @namespace Editor.Selection
 */
var Selection = {
    register: function ( type ) {
        if ( !Editor.isCoreLevel ) {
            Editor.warn('Editor.Selection.register can only be called in core level.');
            return;
        }

        if ( _units[type] )
            return;

        _units[type] = new ConfirmableSelectionUnit(type);
    },

    /**
     * Confirms all current selecting objects, no matter which type they are.
     * This operation may trigger deactivated and activated events.
     * @memberof Editor.Selection
     */
    confirm: function () {
        for ( var p in _units ) {
            _units[p].confirm();
        }
    },

    /**
     * Cancels all current selecting objects, no matter which type they are.
     * This operation may trigger selected and unselected events.
     * @memberof Editor.Selection
     */
    cancel: function () {
        for ( var p in _units ) {
            _units[p].cancel();
        }
    },

    /**
     * if confirm === false, it means you are in rect selecting state, but have not confirmed yet.
     * in this state, the `selected` messages will be broadcasted, but the `activated` messages will not.
     * after that, if you confirm the selection, `activated` message will be sent, otherwise `unselected` message will be sent.
     * if confirm === true, the activated will be sent in the same time.
     * @memberof Editor.Selection
     * @param {string} type
     * @param {(string|string[])} id
     * @param {boolean} [unselectOthers=true]
     * @param {boolean} [confirm=true]
     */
    select: function ( type, id, unselectOthers, confirm ) {
        var selectionUnit = _units[type];
        if ( !selectionUnit ) {
            Editor.error('Can not find the type %s for selection, please register it first', type);
            return;
        }

        if ( typeof id !== 'string' && ! Array.isArray(id) ) {
            Editor.error('The 2nd argument for Editor.Selection.select must be string or array');
            return;
        }

        unselectOthers = unselectOthers !== undefined ? unselectOthers : true;
        confirm = confirm !== undefined ? confirm : true;
        selectionUnit.select(id, unselectOthers, confirm);

        if ( _lastActiveUnit !== selectionUnit &&
             selectionUnit.confirmed &&
             selectionUnit.lastActive ) {
            _lastActiveUnit = selectionUnit;

            Editor.sendToAll('selection:activated', type, selectionUnit.lastActive);
        }
    },

    /**
     * @memberof Editor.Selection
     * @param {string} type
     * @param {(string|string[])} id
     * @param {boolean} [confirm=true]
     */
    unselect: function (type, id, confirm) {
        var selectionUnit = _units[type];
        if ( !selectionUnit ) {
            Editor.error('Can not find the type %s for selection, please register it first', type);
            return;
        }

        if ( typeof id !== 'string' && ! Array.isArray(id) ) {
            Editor.error('The 2nd argument for Editor.Selection.select must be string or array');
            return;
        }

        confirm = confirm !== undefined ? confirm : true;
        selectionUnit.unselect(id, confirm);
    },

    /**
     * @memberof Editor.Selection
     * @param {string} type
     * @param {string} id
     */
    hover: function ( type, id ) {
        var selectionUnit = _units[type];
        if ( !selectionUnit ) {
            Editor.error('Can not find the type %s for selection, please register it first', type);
            return;
        }

        selectionUnit.hover(id);
    },


    /**
     * @memberof Editor.Selection
     * @param {string} type
     * @param {string} id
     */
    setContext: function ( type, id ) {
        var selectionUnit = _units[type];
        if ( !selectionUnit ) {
            Editor.error('Can not find the type %s for selection, please register it first', type);
            return;
        }

        selectionUnit.setContext(id);
    },

    /**
     * @memberof Editor.Selection
     * @param {string} type
     */
    clear: function ( type ) {
        var selectionUnit = _units[type];
        if ( !selectionUnit ) {
            Editor.error('Can not find the type %s for selection, please register it first', type);
            return;
        }

        selectionUnit.clear();
        selectionUnit.confirm();
    },

    /**
     * @memberof Editor.Selection
     * @param {string} type
     * @return {string} hovering
     */
    hovering: function ( type ) {
        var selectionUnit = _units[type];
        if ( !selectionUnit ) {
            Editor.error('Can not find the type %s for selection, please register it first', type);
            return null;
        }

        return selectionUnit.lastHover;
    },

    /**
     * @memberof Editor.Selection
     * @param {string} type
     * @return {string} contexts
     */
    contexts: function ( type ) {
        var selectionUnit = _units[type];
        if ( !selectionUnit ) {
            Editor.error('Can not find the type %s for selection, please register it first', type);
            return null;
        }

        return selectionUnit.contexts;
    },

    /**
     * @memberof Editor.Selection
     * @param {string} type
     * @return {string} current activated
     */
    curActivate: function ( type ) {
        var selectionUnit = _units[type];
        if ( !selectionUnit ) {
            Editor.error('Can not find the type %s for selection, please register it first', type);
            return null;
        }

        return selectionUnit.lastActive;
    },

    /**
     * @memberof Editor.Selection
     * @param {string} type
     * @return {string[]} selected list
     */
    curSelection: function ( type ) {
        var selectionUnit = _units[type];
        if ( !selectionUnit ) {
            Editor.error('Can not find the type %s for selection, please register it first', type);
            return null;
        }

        return selectionUnit.selection.slice();
    },

    /**
     * @memberof Editor.Selection
     * @param {string[]} items - an array of ids
     * @param {string} mode - ['top-level', 'deep', 'name']
     * @param {function} func
     */
    filter: function ( items, mode, func ) {
        var results, item, i, j;

        if ( mode === 'name' ) {
            results = items.filter(func);
        }
        else {
            results = [];
            for ( i = 0; i < items.length; ++i ) {
                item = items[i];
                var add = true;

                for ( j = 0; j < results.length; ++j ) {
                    var addedItem = results[j];

                    if ( item === addedItem ) {
                        // existed
                        add = false;
                        break;
                    }

                    var cmp = func( addedItem, item );
                    if ( cmp > 0 ) {
                        add = false;
                        break;
                    }
                    else if ( cmp < 0 ) {
                        results.splice(j, 1);
                        --j;
                    }
                }

                if ( add ) {
                    results.push(item);
                }
            }
        }

        return results;
    },

    local: function () {
        // TODO: return a local selection wrap Editor.Selection functions
    }
};

module.exports = Selection;

// ==========================
// Ipc
// ==========================

// recv ipc message and update the local data

Ipc.on( 'selection:selected', function ( type, ids ) {
    var selectionUnit = _units[type];
    if ( !selectionUnit ) {
        Editor.error('Can not find the type %s for selection, please register it first', type);
        return;
    }

    // NOTE: it is possible we recv messages from ourself
    ids = ids.filter(function (x) {
        return selectionUnit.selection.indexOf(x) === -1;
    });

    // NOTE: we don't consider message from multiple source, in that case
    //       even the data was right, the messages still goes wrong.
    if (ids.length === 1) {
        selectionUnit.selection.push(ids[0]);
    }
    else if (ids.length > 1) {
        // NOTE: push.apply has limitation in item counts
        selectionUnit.selection = selectionUnit.selection.concat(ids);
    }
});

Ipc.on( 'selection:unselected', function ( type, ids ) {
    var selectionUnit = _units[type];
    if ( !selectionUnit ) {
        Editor.error('Can not find the type %s for selection, please register it first', type);
        return;
    }

    selectionUnit.selection = selectionUnit.selection.filter( function (x) {
        return ids.indexOf(x) === -1;
    });
});

Ipc.on( 'selection:activated', function ( type, id ) {
    var selectionUnit = _units[type];
    if ( !selectionUnit ) {
        Editor.error('Can not find the type %s for selection, please register it first', type);
        return;
    }

    selectionUnit.lastActive = id;
});

Ipc.on( 'selection:hoverin', function ( type, id ) {
    var selectionUnit = _units[type];
    if ( !selectionUnit ) {
        Editor.error('Can not find the type %s for selection, please register it first', type);
        return;
    }

    selectionUnit.lastHover = id;
});

Ipc.on( 'selection:hoverout', function ( type, id ) {
    var selectionUnit = _units[type];
    if ( !selectionUnit ) {
        Editor.error('Can not find the type %s for selection, please register it first', type);
        return;
    }

    selectionUnit.lastHover = null;
});

// ==========================
// init
// ==========================

if ( Editor.isCoreLevel ) {
    Ipc.on( 'selection:get-registers', function ( event ) {
        results = [];
        for ( var key in _units ) {
            var selectionUnit = _units[key];
            results.push({
                type: key,
                selection: selectionUnit.selection,
                lastActive: selectionUnit.lastActive,
                lastHover: selectionUnit.lastHover,
                context: selectionUnit._context,
            });
        }
        event.returnValue = results;
    });
}

if ( Editor.isPageLevel ) {
    (function () {
        var results = Ipc.sendSync('selection:get-registers');
        for ( var i = 0; i < results.length; ++i ) {
            var info = results[i];
            if ( _units[info.type] )
                return;

            var selectionUnit = new ConfirmableSelectionUnit(info.type);
            selectionUnit.selection = info.selection.slice();
            selectionUnit.lastActive = info.lastActive;
            selectionUnit.lastHover = info.lastHover;
            selectionUnit._context = info.context;

            _units[info.type] = selectionUnit;
        }
    })();
}
