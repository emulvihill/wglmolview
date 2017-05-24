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
import {DataObject} from "./DataObject";

export class ElementData {
    public static getData(e: string): DataObject {
        if (ElementData.atomData === null) {

            const url = Configuration.baseUrl + "/src/molview/elements.json";
            fetch(url).then((value) => {
                value.json().then((data) => {
                    ElementData.atomData = {};
                    const json = (typeof data === "string") ? JSON.parse(data) : data;
                    for (const item in json) {
                        const obj = new DataObject(json[item]);
                        ElementData.atomData[obj.symbol.toUpperCase()] = obj;
                    }
                });
            });
        }
        return ElementData.atomData[e.toUpperCase()];
    }

    private static atomData: { [key: string]: DataObject } = {};
}
