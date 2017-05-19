"use strict";
import {Utility} from "../src/molview/Utility";

describe('Utility.r2d', function () {
    it('converts radians to degrees', function () {

        expect(Utility.r2d(0)).toEqual(0);
        expect(Utility.r2d(2)).toBeCloseTo(114.59156, 0.0001);
    });
});
