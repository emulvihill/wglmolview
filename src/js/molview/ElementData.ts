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
module molview
{
    /// <reference path="../../ts/DefinitelyTyped-0.8/jquery/jquery.d.ts" />
    /// <reference path="Configuration.ts" />

export class ElementData
{	
	private static atomData:Object = null;

    public static getData(e:string):Object
	{
        if (!e) {return null;}

        if (ElementData.atomData === null) {
            $.ajax({url: Configuration.getConfig().baseUrl + "/js/molview/elements.json", async:false, dataType:"json",
                    success:(data)=>{
                    ElementData.atomData = {};
                    var json:Object = (typeof data === "string") ? JSON.parse(data) : data;
                    $.each(json, (item)=> {
                        var obj:DataObject = new DataObject(json[item]);
                        atomData[obj.symbol.toUpperCase()] = obj;
                    })
                }});
        }
		return atomData[e.toUpperCase()];
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