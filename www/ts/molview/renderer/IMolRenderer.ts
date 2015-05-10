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