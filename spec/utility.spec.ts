"use strict";
import {Utility} from "../src/molview/Utility";

beforeAll(() => {
    // need dom elements to exist
    document.createElement("wglContent");
    document.createElement("wglInfo");
    window["molview_config"] =  {
        pdbUrl: "base/spec/data/ala.pdb",
        domElement: "wglContent",
        infoElement: "wglInfo"
    };
});


describe('Utility.r2d', function () {
    it('converts radians to degrees', function () {

        expect(Utility.r2d(0)).toEqual(0);
        expect(Utility.r2d(2)).toBeCloseTo(114.59156, 0.0001);
    });
});
