module molview.model
{
    /// <reference path="molview/renderer/IMolRenderer.ts" />
    /// <reference path="molview/model/RenderableObject.ts" />
    /// <reference path="molview/model/Bond.ts" />
    /// <reference path="molview/ElementData.ts" />
    /// <reference path="molview/Configuration.ts" />
    /// <reference path="molview/Constants.ts" />
    /// <reference path="molview/AminoAcidData.ts" />


public class Atom extends RenderableObject
{
	radius:number, altLoc:number, tempFactor:number;
	
	private serial:number, chainID:number, segID:number;
	
	private _bonds:Array, _charge:Array;

    private resName:string, resSeq:string, iCode:string, occupancy:string;

	color:string;

	name:string;

    element:string;

	public get bonds():Array { return this._bonds[this.mframe]; }
	
	
	public Atom(init:Object):void
	{	
		super();
        this.element = String(init.element);
        this.id = String(init.serial);
        this.altLoc = Number(init.altloc);
        this.resName = init.resname;
        this.chainID = int(init.chainid);
        this.resSeq = init.resseq;
        this.iCode = init.icode;
        this.occupancy = init.occupancy;
        this.tempFactor = Number(init.tempfactor);
        this.segID = int(init.segid);
        this.element = init.element;
        this._charge = [Number(init.charge)];
		
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

        this._charge = new Array(Configuration.getConfig().maxFrames);  // per frame
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
        this._charge[mframe] = c;
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