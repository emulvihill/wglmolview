/*
 * =================================================================================================
 *
 * 	WebGL MolView
 * 	Copyright 2013-2017 Eric Mulvihill. All Rights Reserved.
 *
 * 	This program is free software. You can redistribute and/or modify it
 * 	in accordance with the terms of the accompanying license agreement.
 *
 * =================================================================================================
 */
module molview.renderer {

    export interface IMolRenderer {
        init(domElement: HTMLElement): void;
        reset(): void;
        addRenderableObject(obj: molview.model.RenderableObject): void;
        render(): void;
        getSelectedObject(event): molview.model.RenderableObject;
        select(obj: molview.model.RenderableObject): void;
        deselect(obj: molview.model.RenderableObject): void;
        deselectAll(): void;
    }
}