/*
 * =================================================================================================
 *
 * 	WebGL MolView
 * 	Copyright 2013-2017 Eric Mulvihill. All Rights Reserved.
 *
 * 	This program is free software. You can redistribute and/or modify it
 * 	in accordance with the terms of the accompanying license agreement.
 *
 * =================================================================================================
 */

/**
 * Amino acid constants
 */
export class DataObject {

    public name: string;
    public symbol: string;
    public number: number;
    public radius: number;
    public color: number;

    constructor(json: any) {
        this.name = json.name;
        this.symbol = json.symbol;
        this.number = json.atomicNumber;
        this.radius = json.vanDelWaalsRadius;
        this.color = parseInt(json.cpkHexColor, 16);     // http://jmol.sourceforge.net/jscolors/#Jmol colors
    }
}
