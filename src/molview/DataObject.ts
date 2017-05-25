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
