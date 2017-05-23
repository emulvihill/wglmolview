"use strict";

describe('PDBParser', function () {

    it('creates parser', function () {
        let parser = new PDBParser();
        expect(parser).toBeTruthy();
    });
});
