module molview
{
    /// <reference path="../../ts/DefinitelyTyped/jquery/jquery.d.ts" />

export class ElementData
{	
	private static atomData:Object = null;

    public static getData(e:string):Object
	{
        if (!e) {return null;}

        if (ElementData.atomData === null) {
            $.ajax({url:"/js/molview/elements.json", async:false,
                success:(data)=>{
                    ElementData.atomData = {};
                    $.each(data, (item)=> {
                        data[item].name = item;
                        var obj:DataObject = new DataObject(data[item]);
                        atomData[data[item].symbol.toUpperCase()] = obj;
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
        public color:string;

        constructor(json) {
            this.name = json.name;
            this.symbol = json.symbol;
            this.number = json.atomic_number;
            this.radius = json["atomic_radius pm"];
            this.color = "FFFF00";     // http://jmol.sourceforge.net/jscolors/#Jmol colors
        }
    }

/*   JSON format:
    "name":"Phosphorus",
    "symbol" : "P",
    "atomic_number" : 15,
    "atomic_weight" : 30.973762,
    "density g/cm" : "1.82 (white phosphorus)",
    "melting_point K" : 317.3,
    "boiling_point K" : 553,
    "atomic_radius pm" : 128,
    "covalent_radius pm" : 106,
    "ionic_radius pm" : "",
    "atomic_volume cm3/mol" : 17.0,
    "specific_heat (@20°C J/g mol)" : 0.757,
    "fusion_heat (kJ/mol)" : 2.51,
    "evaporation_heat (kJ/mol)" : 49.8,
    "thermal_conductivity (@25°C W/m K) " : "(0.236)",
    "pauling_negativity" : 2.19,
    "first_ionizing kJ/mol" : 1011.2,
    "oxidation_states" : "5, 3, -3",
    "electronic_configuration" : "[Ne]3s²3p³",
    "lattice_structure" : "CUB",
    "lattice_constant ang" : 7.170*/
}