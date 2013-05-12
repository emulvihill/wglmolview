module molview.model
{

    /// <reference path="ts/DefinitelyTyped/threejs/three.d.ts" />

    /// <reference path="molview/renderer/IMolRenderer.ts" />
    /// <reference path="molview/Configuration.ts" />


public class RenderableObject implements IRenderableObject
	{
	
	private _id:string;
	private _loc:Array;
	private _mframe:number;
	
	function RenderableObject():void
	{
        this._loc = new Array(Configuration.getConfig().maxFrames);    // per frame
	}
	
	public get id():string { return this._id; }
	public set id(id:string):void { this._id = id; }

	public get loc():THREE.Vector3 { return this._loc[this._mframe]; }
	public set loc(num:THREE.Vector3):void { this._loc[this._mframe] = num; }
	
	public get mframe():number { return this._mframe; }
	public set mframe(mframe:number):void { this._mframe = mframe; }
		
	render(renderer:molview.renderer.IMolRenderer):void {}
	
	}
}