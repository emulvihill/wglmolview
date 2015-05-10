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
module molview.model
{

    /// <reference path="../renderer/IMolRenderer.ts" />
    /// <reference path="RenderableObject.ts" />
    /// <reference path="Atom.ts" />
    /// <reference path="../ElementData.ts" />
    /// <reference path="../Configuration.ts" />
    /// <reference path="../Constants.ts" />


export class Bond extends molview.model.RenderableObject
{
	type:number;
	
	atoms:molview.model.Atom[];
	
	color:string;

    private _length:number[];
	public get length():number { return this._length[this.mframe]; }
	public set length(len:number) { this._length[this.mframe] = len; }

	constructor(init:{id:string; t:number; a1:model.Atom; a2:model.Atom;})
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
	
	
	public addToMframe(mframe:number):void
	{
	    this.loc = this.atoms[0].loc.clone();
        this.loc.add(this.atoms[1].loc);
        this.loc.multiplyScalar(0.5);
        this.length = 100 * this.atoms[0].loc.distanceTo(this.atoms[1].loc);
	}


    public render(renderer:molview.renderer.IMolRenderer):void
	{
		renderer.addRenderableObject(this);
	}


    public setColorMode(mode:string):void
	{  
		if (!this.type) throw new Error("bond type is undefined");
		
		switch (mode)
		{
		case Constants.COLORMODE_CPK:  // i.e. "element color"
		    this.color = ["0000FF","8822FF","2299FF"][this.type-1];
			break;
		  
		case Constants.COLORMODE_AMINO_ACID:
			// TO DO
			break;
		}
	}

}
}
