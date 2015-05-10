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
module molview.renderer {

    /// <reference path="IMolRenderer.ts" />
    /// <reference path="../model/RenderableObject.ts" />

    export class MockRenderer implements IMolRenderer {

        init():void { };

        addRenderableObject(obj:molview.model.RenderableObject):void { };

        render():void { };

    }
}