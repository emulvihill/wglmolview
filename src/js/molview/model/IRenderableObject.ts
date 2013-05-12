module molview.model
{
    /// <reference path="../../../ts/DefinitelyTyped/threejs/three.d.ts" />

    /// <reference path="../renderer/IMolRenderer.ts" />

export interface IRenderableObject
	{

        id:string;
		loc:THREE.Vector3;

		mframe:number;
		
		render(renderer:molview.renderer.IMolRenderer):void;
	}
}