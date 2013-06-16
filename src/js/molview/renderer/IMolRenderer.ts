module molview.renderer
{

    /// <reference path="../../../ts/DefinitelyTyped/jquery/jquery.d.ts" />
    /// <reference path="../model/RenderableObject.ts" />

	export interface IMolRenderer
	{
		init(domElement:JQuery):void;
        reset():void;
		addRenderableObject(obj:molview.model.RenderableObject):void;
		render():void;
        getSelectedObject(event):molview.model.RenderableObject;
        select(obj:molview.model.RenderableObject):void;
        deselect(obj:molview.model.RenderableObject):void;
        deselectAll():void;
	}
}