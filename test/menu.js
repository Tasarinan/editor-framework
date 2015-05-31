
describe('Editor.Menu', function() {
    var template = [
        {
            label: 'foo',
            submenu: [
            ],
        },

        {
            label: 'bar',
            submenu: [
                {
                    label: 'bar.01',
                },
                {
                    label: 'bar.02',
                },
            ],
        },
    ];

    it('should be built from template', function( done ) {
        var testMenu = new Editor.Menu(template);

        expect( testMenu.nativeMenu.items.length ).to.equal(2);
        expect( testMenu.nativeMenu.items[0].label ).to.equal('foo');

        done();
    });

    it('should add menu item', function( done ) {
        var testMenu = new Editor.Menu(template);
        // testMenu.add()

        // expect( testMenu.nativeMenu.items.length ).to.equal(2);
    });
});
