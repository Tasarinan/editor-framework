module.exports = {
    load: function () {
    },

    unload: function () {
    },

    'foo:bar': function ( reply ) {
        console.log('foobar in core');
        setTimeout(function () {
            reply();
        }, 1000 );

        // var Winston = require('winston');
        // Winston.query({
        //     from: new Date() - 24 * 60 * 60 * 1000,
        //     until: new Date(),
        //     limit: 10,
        //     start: 0,
        //     order: 'desc',
        // }, function ( err, results ) {
        //     if ( err ) {
        //         console.log('query error: ', err);
        //         return;
        //     }
        //     console.log('found %d logs.', results.length);
        //     console.log(results);
        // });
    },

};
