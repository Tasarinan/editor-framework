var Path = require('fire-path');

module.exports = [
    'menu.js',
    'selection.js',
].map( function ( file ) {
    return Path.join( __dirname, file );
});
