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

import {
    CylinderGeometry,
    GeometryUtils,
    Light,
    Matrix4,
    MeshBasicMaterial,
    MeshLambertMaterial,
    PerspectiveCamera,
    PointLight,
    Projector,
    Raycaster,
    Scene,
    SphereGeometry,
    Vector2,
    Vector3,
    WebGLRenderer
} from "three";

import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';

import {Atom} from "../model/Atom";
import {Bond} from "../model/Bond";
import {RenderableObject} from "../model/RenderableObject";
import {Configuration} from "../Configuration";
import {Constants} from "../Constants";
import {IMolRenderer} from "./IMolRenderer";
import {ViewObject} from "./ViewObject";

export class ThreeJsRenderer implements IMolRenderer {

    private static SCALE: number = 100;

    private scene: Scene;
    private renderer: WebGLRenderer;
    private camera: PerspectiveCamera;
    private projector: Projector;

    /* Projector has been removed. New pattern:
     let raycaster = new Raycaster(); // create once
     let mouse = new Vector2(); // create once
     ...
     mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
     mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;
     raycaster.setFromCamera( mouse, camera );
     let intersects = raycaster.intersectObjects( objects, recursiveFlag );*/

    private light: Light;
    private controls: OrbitControls;
    private domElement: HTMLDivElement;
    private objects: ViewObject[] = [];
    private selections: ViewObject[] = [];

    init(domElement: HTMLElement): void {
        this.domElement = domElement as HTMLDivElement;

        // scene size
        const WIDTH = 800;
        const HEIGHT = 600;

        // camera attributes
        const VIEW_ANGLE = 45;
        const ASPECT = WIDTH / HEIGHT;
        const NEAR = 0.1;
        const FAR = 1000000;

        // create a WebGL renderer, camera
        // and a scene
        if (this.testWebGL() === false) {
            alert("Sorry. Please use WebGL-enabled browser (Chrome, Firefox, Safari, IE 11+)");
            return;
        }

        this.renderer = new WebGLRenderer();
        this.camera = new PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        this.scene = new Scene();

        // add the camera to the scene
        this.scene.add(this.camera);

        // the camera starts at 0,0,0
        // so pull it back
        this.camera.position.z = 1000;

        // start the renderer
        this.renderer.setSize(WIDTH, HEIGHT);

        // create a point light
        this.light = new PointLight(0xFFFFFF);

        // set its position
        this.light.position.set(100, 400, 1000);

        // add to the scene
        this.camera.add(this.light);

        // attach the render-supplied DOM element
        this.domElement.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.rotateSpeed = 0.5;
        this.controls.addEventListener("change", () => this.render);
        window.addEventListener("resize", () => {
            this.onWindowResize();
        }, false);

        this.objects = [];

        this.animate();
    }

    reset(): void {
        // this.camera.position = new Vector3(0,0,1000);
        // this.camera.lookAt(new Vector3(0,0,0));
        for (const value of this.objects) {
            this.scene.remove(value);
        }
        for (const value of this.selections) {
            this.scene.remove(value);
        }
        // this.renderer.clear(true, true, true);
        this.objects = [];
        this.selections = [];
    }

    addRenderableObject(modelObject: RenderableObject): void {

        let vo: ViewObject | null;

        if (modelObject instanceof Atom) {
            vo = this.renderAtom(modelObject);
            vo.modelObject = modelObject;
            this.objects.push(vo);
        } else if (modelObject instanceof Bond) {
            vo = this.renderBond(modelObject);
            vo.modelObject = modelObject;
            this.objects.push(vo);
        }
    }

    select(modelObject: RenderableObject): void {

        const vo: ViewObject = modelObject.viewObject;

        if (!vo) {
            throw new Error("cannot find view object for " + modelObject);
        }

        for (const sel of this.selections) {
            if (sel.modelObject === modelObject) {
                // we've already selected.. unselect
                this.deselect(modelObject);
                return;
            }
        }

        if (modelObject instanceof Atom) {
            this.selections.push(this.renderAtomSelection(modelObject));
        } else if (modelObject instanceof Bond) {
            this.selections.push(this.renderBondSelection(modelObject));
        }
    }

    getSelectedObject(event: MouseEvent): RenderableObject | undefined {

        event.preventDefault();

        // console.info("event.clientX " + event.clientX);
        // console.info("event.clientY " + event.clientY);
        const point: Vector3 = new Vector3(( (event.clientX - this.renderer.domElement.offsetLeft) /
            this.renderer.domElement.clientWidth ) * 2 - 1,
            -( (event.clientY - this.renderer.domElement.offsetTop) /
            this.renderer.domElement.clientHeight) * 2 + 1, 0.5);
        const raycaster = new Raycaster();
        const mouse = new Vector2();
        mouse.x = ( event.clientX / this.renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = -( event.clientY / this.renderer.domElement.clientHeight ) * 2 + 1;

        raycaster.setFromCamera(mouse, this.camera);

        const intersects = raycaster.intersectObjects(this.objects, false);

        if (intersects.length > 0) {
            const vo: ViewObject = intersects[0].object as ViewObject;
            return vo.modelObject;
        }

        return undefined;
    }

    deselect(modelObject: RenderableObject): void {

        for (let i: number = 0; i < this.selections.length; i++) {
            if (this.selections[i].modelObject === modelObject) {
                const sels: ViewObject[] = this.selections.splice(i, 1);
                this.scene.remove(sels[0]);
            }
        }
    }

    deselectAll(): void {

        for (const sel of this.selections) {
            this.scene.remove(sel);
        }
        this.selections = [];
    }

    setRenderMode(mode: string): void {

        switch (mode) {
            case Constants.RENDERMODE_BALL_AND_STICK :
                // stuff
                break;
            case Constants.RENDERMODE_SPACE_FILL :
                // stuff
                break;
            case Constants.RENDERMODE_STICKS :
                // stuff
                break;
        }

        this.render();
    }

    render(): void {
        // draw!
        this.renderer.render(this.scene, this.camera);
    }

    private animate(): void {

        const rot = Date.now() * 0.0004;

        requestAnimationFrame(() => {
            this.animate();
        });

        this.controls.update();

        this.light.rotation.x = this.scene.rotation.x = rot;
        this.light.rotation.y = this.scene.rotation.y = rot * 0.7;

        this.render();
    }

    private renderAtom(modelObject: Atom): ViewObject {

        const quality: string = Configuration.renderQuality;

        // set up the sphere vars
        const radius = this.radiusConversion(modelObject.radius);
        const segments = 16;
        const rings = 16;

        // create the sphere's material
        const sphereMaterial: MeshLambertMaterial = new MeshLambertMaterial({color: modelObject.color});
        // create a new mesh with sphere geometry
        const geometry: SphereGeometry = new SphereGeometry(radius, segments, rings);
        const viewObject: ViewObject = new ViewObject(geometry, sphereMaterial);
        const p: Vector3 = modelObject.loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);

        viewObject.position.set(p.x, p.y, p.z);

        viewObject.modelObject = modelObject;
        modelObject.viewObject = viewObject;

        this.scene.add(viewObject);
        return viewObject;
    }

    private renderBond(modelObject: Bond): ViewObject {

        const tubes: ViewObject[] = [];

        const m: number[] = this.getBondMetrics(modelObject, Configuration.renderMode);
        const bondMaterial: MeshLambertMaterial = new MeshLambertMaterial({color: 0x0000FF});
        const bondLength = modelObject.length; // 10 * m[2];

        switch (modelObject.type) {
            case 1:
                tubes.push(this.makeCylinder(6, bondLength, bondMaterial));
                break;

            case 2:
                tubes.push(this.makeCylinder(5, bondLength, bondMaterial));
                tubes.push(this.makeCylinder(5, bondLength, bondMaterial));
                tubes[0].translateX(6);
                tubes[1].translateX(-6);
                break;

            case 3:
                tubes.push(this.makeCylinder(4, bondLength, bondMaterial));
                tubes.push(this.makeCylinder(4, bondLength, bondMaterial));
                tubes.push(this.makeCylinder(4, bondLength, bondMaterial));
                tubes[0].translateX(6);
                tubes[0].translateY(-3.5);
                tubes[1].translateX(-6);
                tubes[1].translateY(-3.5);
                tubes[2].translateY(3.5);
                break;
        }

        const viewObject: ViewObject = tubes[0];
        for (let i: number = 1; i < tubes.length; i++) {
            GeometryUtils.merge(tubes[0].geometry, tubes[i].geometry, 0);
        }

        const v0: Vector3 = modelObject.atoms[0].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
        const v1: Vector3 = modelObject.atoms[1].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
        const p: Vector3 = v0.add(v1).divideScalar(2);

        viewObject.position.set(p.x, p.y, p.z);
        viewObject.lookAt(v1);

        viewObject.modelObject = modelObject;
        modelObject.viewObject = viewObject;

        this.scene.add(viewObject);
        return viewObject;
    }

    private renderAtomSelection(modelObject: Atom): ViewObject {

        // set up the sphere vars
        const radius = 1.1 * this.radiusConversion(modelObject.radius);
        const segments = 16;
        const rings = 16;

        // create the sphere's material
        const sphereMaterial: MeshBasicMaterial = new MeshBasicMaterial({
            color: 0xFF0000,
            opacity: 0.5,
            transparent: true
        });
        // create a new mesh with sphere geometry
        const geometry: SphereGeometry = new SphereGeometry(radius, segments, rings);
        const viewObject = new ViewObject(geometry, sphereMaterial);

        let p:Vector3 = modelObject.loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
        viewObject.position.set(p.x, p.y, p.z);

        // add the sphere to the scene
        this.scene.add(viewObject);

        viewObject.modelObject = modelObject;

        return viewObject;
    }

    private renderBondSelection(bond: Bond): ViewObject {

        const quality: string = Configuration.renderQuality;
        const mode: string = Configuration.renderMode;
        const m: number[] = this.getBondMetrics(bond, mode);
        const selMaterial: MeshBasicMaterial = new MeshBasicMaterial({
            color: 0xFF0000,
            opacity: 0.5,
            transparent: true
        });
        const bondLength = bond.length;
        const selObj: ViewObject = this.makeCylinder(10, bondLength, selMaterial);
        const v0: Vector3 = bond.atoms[0].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
        const v1: Vector3 = bond.atoms[1].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);

        selObj.position = v0.add(v1).divideScalar(2);
        selObj.lookAt(v1);

        selObj.modelObject = bond;
        this.scene.add(selObj);

        return selObj;
    }

    private makeCylinder(width: number, height: number, material: any) {

        const g: CylinderGeometry = new CylinderGeometry(width, width, height, 24, 1, true);
        g.applyMatrix(new Matrix4().makeRotationX(Math.PI / 2));
        return new ViewObject(g, material);
    }

    /*
     * Measure the "empty space" at the ends of bonds, to make it look right with drawing between atoms
     * [length between atom0 & start of bond, length between end of bond & atom1, bond length as drawn]
     */
    private getBondMetrics(bond: Bond, mode: string): number[] {

        if (mode === Constants.RENDERMODE_STICKS) {
            return [0, bond.length, bond.length];
        } else {
            return [bond.atoms[0].radius,
                bond.length - bond.atoms[1].radius,
                bond.length - (bond.atoms[1].radius + bond.atoms[0].radius)];
        }
    }

    private onWindowResize(): void {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.controls.reset();

        this.render();
    }

    private radiusConversion(radius: number): number {

        return 5 * Math.log(8 * radius);
    }

    private testWebGL(): boolean {
        /*        try {
         return !!window. && !!document.createElement('canvas').getContext('experimental-webgl');
         } catch (e) {
         return false;
         }*/
        return true;
    }
}
