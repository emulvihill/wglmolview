module molview.model
{
    /// <reference path="ts/DefinitelyTyped/threejs/three.d.ts" />

    /// <reference path="molview/renderer/IMolRenderer.ts" />

public interface IRenderableObject
	{
/*		public get loc():THREE.Vector3 {};

		public set loc(num:THREE.Vector3):void {};

		public get mframe():number{};

		public set mframe(mframe:number):void {};

		public get id():string {};

		public set id(s:string):void {};*/
		
		render(renderer:molview.renderer.IMolRenderer):void;
	}
}