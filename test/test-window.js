Editor.info('starting load elements');

var link = document.createElement('link');
link.rel = 'import';
link.href = 'editor://test/foo-bar.html';
link.onload = function(e) {
    document.body.appendChild( new Editor.Foobar() );
};
link.onerror = function(e) {
    Editor.error('Failed to import %s', link.href);
};
document.head.appendChild(link);
