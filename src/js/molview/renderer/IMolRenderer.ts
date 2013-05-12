module molview.renderer
{

    /// <reference path="../model/RenderableObject.ts" />

	export interface IMolRenderer
	{
		init():void;
		addRenderableObject(obj:molview.model.RenderableObject):void;
		render():void;
	}
}