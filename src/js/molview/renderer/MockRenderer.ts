module molview.renderer {

    /// <reference path="IMolRenderer.ts" />
    /// <reference path="../model/RenderableObject.ts" />

    export class MockRenderer implements IMolRenderer {

        init():void { };

        addRenderableObject(obj:molview.model.RenderableObject):void { };

        render():void { };

    }
}