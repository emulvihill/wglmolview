module molview.model
{

    /// <reference path="molview/renderer/IMolRenderer.ts" />
    /// <reference path="molview/model/RenderableObject.ts" />
    /// <reference path="molview/model/Atom.ts" />
    /// <reference path="molview/ElementData.ts" />
    /// <reference path="molview/Configuration.ts" />
    /// <reference path="molview/Constants.ts" />


public class Bond extends RenderableObject
{
	type:number;
	
	atoms:molview.model.Atom[];
	
	color:string;

    private _length:Array;
	public get length():number { return this._length[this.mframe]; }
	public set length(len:number):void { this._length[this.mframe] = len; }

	function Bond(init:Object):void
	{   
		super();
        this.type = init.t;
        this.atoms = [init.a1, init.a2];
        this.id = init.id;
        this.mframe = 0;
        this._length = new Array(Configuration.getConfig().maxFrames);
		
		// color for the type of bond
        this.setColorMode(Constants.COLORMODE_CPK);

		//add this bond to each atom's list of bonds
		this.atoms[0].addBond(this);
		this.atoms[1].addBond(this);
	}
	
	
	function addToMframe(mframe:number):void
	{
	  this.loc = this.atoms[0].loc.clone();
	  loc.add(this.atoms[1].loc);
	  loc.scaleBy(0.5);
        this.length = 100 * THREE.Vector3.distance(this.atoms[1].loc, this.atoms[0].loc);
	}
	
	
	public override function render(renderer:molview.renderer.IMolRenderer):void
	{
		renderer.addRenderableObject(this);
	}
	
	
	setColorMode(mode:string):void
	{  
		if (!type) throw new Error("bond type is undefined");
		
		switch (mode)
		{
		case Constants.COLORMODE_CPK:  // i.e. "element color"
		    this.color = ["0000FF","8822FF","2299FF"][type-1];
			break;
		  
		case Constants.COLORMODE_AMINO_ACID:
			// TO DO
			break;
		}
	}

}
}
