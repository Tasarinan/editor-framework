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
    is: 'test-page',

    clickAction: function ( event ) {
        ++index;
        importElement( 'editor://test/foo-bar.html?' + index, function () {
            var myPage = document.querySelector('#my-page');
            Polymer.dom(myPage).appendChild( new Editor.Foobar() );
        } );
    }
});
