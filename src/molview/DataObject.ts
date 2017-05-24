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
