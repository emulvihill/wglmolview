module molview.renderer
{

    /// <reference path="../model/IRenderableObject.ts" />

	export interface IMolRenderer
	{
		init():void;
		addRenderableObject(obj:molview.model.IRenderableObject):void;
		render():void;
	}
}