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
import {Configuration} from "./Configuration";
export class ElementData {
    private static atomData: { [key: string]: DataObject } = {};

    public static getData(e: string): DataObject {
        if (ElementData.atomData === null) {

            let url = Configuration.getConfig().baseUrl + "/src/molview/elements.json";
            fetch(url).then(value => {
                value.json().then(data => {
                    ElementData.atomData = {};
                    let json: Object = (typeof data === "string") ? JSON.parse(data) : data;
                    for (let item in json) {
                        let obj: DataObject = new DataObject(json[item]);
                        ElementData.atomData[obj.symbol.toUpperCase()] = obj;
                    }
                });
            });
        }
        return ElementData.atomData[e.toUpperCase()];
    }
}

export class DataObject {

    public name: string;
    public symbol: string;
    public number: number;
    public radius: number;
    public color: number;

    constructor(json: any) {
        this.name = json.name;
        this.symbol = json.symbol;
        this.number = json.number;
        this.radius = json.radius;
        this.color = parseInt(json.color, 16);     // http://jmol.sourceforge.net/jscolors/#Jmol colors
    }
}