/*
 * =================================================================================================
 *
 * 	WebGL MolView
 * 	Copyright 2013-2015 Eric Mulvihill. All Rights Reserved.
 *
 * 	This program is free software. You can redistribute and/or modify it
 * 	in accordance with the terms of the accompanying license agreement.
 *
 * =================================================================================================
 */
module molview {
    export class ElementData {
        private static atomData:{[key:string]:DataObject} = {};

        public static getData(e:string):DataObject {
            if (!e) {
                return null;
            }

            if (ElementData.atomData === null) {
                $.ajax({
                    url: Configuration.getConfig().baseUrl + "/src/molview/elements.json",
                    async: false,
                    dataType: "json",
                    success: (data)=> {
                        ElementData.atomData = {};
                        var json:Object = (typeof data === "string") ? JSON.parse(data) : data;
                        $.each(json, (item)=> {
                            var obj:DataObject = new DataObject(json[item]);
                            ElementData.atomData[obj.symbol.toUpperCase()] = obj;
                        })
                    }
                });
            }
            return ElementData.atomData[e.toUpperCase()];
        }
    }

    export class DataObject {

        public name:string;
        public symbol:string;
        public number:number;
        public radius:number;
        public color:number;

        constructor(json) {
            this.name = json.name;
            this.symbol = json.symbol;
            this.number = json.number;
            this.radius = json.radius;
            this.color = parseInt(json.color, 16);     // http://jmol.sourceforge.net/jscolors/#Jmol colors
        }
    }

}