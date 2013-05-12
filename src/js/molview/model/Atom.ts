module molview.model
{
    /// <reference path="../renderer/IMolRenderer.ts" />
    /// <reference path="RenderableObject.ts" />
    /// <reference path="Bond.ts" />
    /// <reference path="../ElementData.ts" />
    /// <reference path="../Configuration.ts" />
    /// <reference path="../Constants.ts" />
    /// <reference path="../AminoAcidData.ts" />

export interface AtomInitializer {
    serial:number;
    element:string;
    altLoc:number;
    resName:string;
    chainId:number;
    resSeq:string;
    iCode:string;
    x:number;
    y:number;
    z:number;
    occupancy:string;
    tempFactor:number;
    segId:number;
    element2:string;
    charge:number;
}

export class Atom extends molview.model.RenderableObject
{
	radius:number;

    color:string;

    name:string;

    element:string;
    element2:string;

    private altLoc:number;
    private tempFactor:number;
	private serial:number;
    private chainID:number;
    private segID:number;
    private charge:number[];
    private resName:string;
    private resSeq:string;
    private iCode:string;
    private occupancy:string;

    private _bonds:Bond[][];
	public get bonds():Bond[] {
        return this._bonds[this.mframe];
    }

	constructor(init:AtomInitializer)
	{	
		super();
        this.element = init.element;
        this.id = init.serial;
        this.altLoc = init.altLoc;
        this.resName = init.resName;
        this.chainID = init.chainId;
        this.resSeq = init.resSeq;
        this.iCode = init.iCode;
        this.occupancy = init.occupancy;
        this.tempFactor = init.tempFactor;
        this.segID = init.segId;
        this.element2 = init.element2;
        this.charge = [init.charge];
		
		var edata:Object = ElementData.getData(this.element);
        this.name = edata.name;
        this.color = edata.color;
		
        var radiusScale:number = Configuration.getConfig().atomRadiusScale;
		switch(Configuration.getConfig().atomRadiusMode)
	    {
			case Constants.ATOM_RADIUS_ACCURATE:
                this.radius = radiusScale * edata.radius;
				break;
			case Constants.ATOM_RADIUS_REDUCED:
                this.radius = radiusScale * (Constants.ATOM_RADIUS_REDUCED_SCALE * edata.radius + (1-Constants.ATOM_RADIUS_REDUCED_SCALE) * ElementData.getData("H").radius);
				break;
			case Constants.ATOM_RADIUS_UNIFORM:
			default:
                this.radius = radiusScale * ElementData.getData("H").radius;
		}

        this.charge = new Array(Configuration.getConfig().maxFrames);  // per frame
        this._bonds = new Array(Configuration.getConfig().maxFrames);   // per frame
 		for (var i:number = 0; i <= Configuration.getConfig().maxFrames; i++)
		{
            this._bonds[i] = [];
		}
		
	}

    public addToMframe(x:number, y:number, z:number, c:number, mframe:number):void
	{
		this.mframe = mframe;
        this.loc = new THREE.Vector3(x, y, z);
        this.charge[mframe] = c;
	}


    public addBond(bond:Bond):void
	{
        this._bonds[this.mframe].push(bond);
	}

	
	public render(renderer:molview.renderer.IMolRenderer):void
	{		
		renderer.addRenderableObject(this);
	}

	
	public setColorMode(colorMode:string):void
	{
		var edata:Object;
		
		switch (colorMode)
		{
			case Constants.COLORMODE_CPK:  // i.e. "element color"
				edata = ElementData.getData(this.element);
				if (!edata)
				{
					edata = ElementData.getData("C");  // fallback
				}
				this.color = edata.color;
			
            case Constants.COLORMODE_AMINO_ACID:
                this.color = AminoAcidData.getData(this.resName).color;
                if (!color)
				{
					this.color = "CCCCCC";  // fallback
				}
		} 
	}
	
}
}