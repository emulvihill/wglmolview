﻿module molview.model
{
    /// <reference path="RenderableObject.ts" />
    /// <reference path="Atom.ts" />
    /// <reference path="../renderer/IMolRenderer.ts" />
    /// <reference path="../Configuration.ts" />


export class Atom extends molview.model.RenderableObject
{
    atom:Atom;
    radius:number;

	constructor(atom:Atom)
	{	
		super();
        this.atom = atom;
        this.radius = 1.05 * atom.radius;
	}

	
	public render(renderer:molview.renderer.IMolRenderer):void
	{		
		renderer.addRenderableObject(this);
	}


}
}