Editor.info('starting load elements');

var url2link = {};

var importElement = function ( url, cb ) {
    var link = url2link[url];
    if ( link ) {
        link.remove();
        delete url2link[url];
    }

    link = document.createElement('link');
    link.rel = 'import';
    link.href = url;
    link.onload = cb;
    link.onerror = function(e) {
        Editor.error('Failed to import %s', link.href);
    };

    document.head.appendChild(link);
    url2link[url] = link;
};

var index = 0;
Polymer( {
    is: 'test-import',

    clickAction: function ( event ) {
        ++index;
        importElement( 'app://test/page-level/import/foo-bar.html?' + index, function () {
            Polymer.dom(this).appendChild( new Editor.Foobar() );
        }.bind(this));
    }
});
