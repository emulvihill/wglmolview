module molview.renderer
{

    /// <reference path="molview/model/IRenderableObject.ts" />

	public interface IMolRenderer
	{
		init():void;
		addRenderableObject(obj:molview.model.IRenderableObject):void;
		render():void;
	}
}