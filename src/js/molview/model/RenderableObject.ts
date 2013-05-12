module molview.model
{

    /// <reference path="../../../ts/DefinitelyTyped/threejs/three.d.ts" />

    /// <reference path="../renderer/IMolRenderer.ts" />
    /// <reference path="IRenderableObject.ts" />
    /// <reference path="../Configuration.ts" />


export class RenderableObject implements molview.model.IRenderableObject
	{
	id:string;
	private _loc:THREE.Vector3[];
	private _mframe:number;
	
	constructor()
	{
        this._loc = new Array(Configuration.getConfig().maxFrames);    // per frame
	}

	public get loc():THREE.Vector3 { return this._loc[this._mframe]; }
	public set loc(num:THREE.Vector3) { this._loc[this._mframe] = num; }
	
	public get mframe():number { return this._mframe; }
	public set mframe(mframe:number) { this._mframe = mframe; }
		
	render(renderer:molview.renderer.IMolRenderer):void {}
	
	}
}