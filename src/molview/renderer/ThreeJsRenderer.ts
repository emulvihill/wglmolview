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
    TrackballControls, Mesh, Scene, WebGLRenderer, PerspectiveCamera, Light, PointLight,
    SphereGeometry, GeometryUtils, Vector3, CylinderGeometry, Intersection, Object3D
} from "three";
import {MeshLambertMaterial, MeshBasicMaterial, Matrix4} from "@types/three/three-core";
import {Atom} from "../model/Atom";
import {Bond} from "../model/Bond";
import {Constants} from "../Constants";
import {Configuration} from "../Configuration";
import {IMolRenderer} from "./IMolRenderer";
import {RenderableObject} from "../model/RenderableObject";

export class ViewObject extends Mesh {
    modelObject: RenderableObject;
}

export class ThreeJsRenderer implements IMolRenderer {

    private static SCALE: number = 100;

    private scene: Scene;
    private renderer: WebGLRenderer;
    private camera: PerspectiveCamera;

    //private projector:Projector;
    /* Projector has been removed. New pattern:
     let raycaster = new Raycaster(); // create once
     let mouse = new Vector2(); // create once
     ...
     mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
     mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;
     raycaster.setFromCamera( mouse, camera );
     let intersects = raycaster.intersectObjects( objects, recursiveFlag );*/

    private light: Light;
    private controls: TrackballControls;
    private domElement: HTMLDivElement;
    private objects: ViewObject[] = [];
    private selections: ViewObject[] = [];

    init(domElement: HTMLElement): void {
        this.domElement = <HTMLDivElement>domElement;

        // set the scene size
        let WIDTH = 800,
            HEIGHT = 600;

        // set some camera attributes
        let VIEW_ANGLE = 45,
            ASPECT = WIDTH / HEIGHT,
            NEAR = 0.1,
            FAR = 1000000;

        // create a WebGL renderer, camera
        // and a scene
        if (this.testWebGL() === false) {
            alert("Sorry. Please use WebGL-enabled browser (Chrome, Firefox, Safari, IE 11+)");
            return;
        }

        this.renderer = new WebGLRenderer();

        this.camera =
            new PerspectiveCamera(
                VIEW_ANGLE,
                ASPECT,
                NEAR,
                FAR);

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
        this.light.position.x = 100;
        this.light.position.y = 400;
        this.light.position.z = 1000;

        // add to the scene
        this.camera.add(this.light);

        // attach the render-supplied DOM element
        this.domElement.appendChild(this.renderer.domElement);

        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.controls.rotateSpeed = 0.5;
        this.controls.addEventListener('change', () => this.render);
        window.addEventListener('resize', () => {
            this.onWindowResize()
        }, false);

        this.objects = [];

        this.animate();
    }


    reset(): void {
        //this.camera.position = new Vector3(0,0,1000);
        //this.camera.lookAt(new Vector3(0,0,0));
        let value: Object3D | undefined;
        while (value = this.objects.pop()) {
            this.scene.remove(value);
        }
        while (value = this.selections.pop()) {
            this.scene.remove(value);
        }
        //this.renderer.clear(true, true, true);
        this.objects = [];
        this.selections = [];
    }


    addRenderableObject(modelObject: RenderableObject): void {


        let vo: ViewObject | null;

        if (modelObject instanceof Atom) {
            vo = this.renderAtom(<Atom>modelObject);
            vo.modelObject = modelObject;
            this.objects.push(vo);
        }
        else if (modelObject instanceof Bond) {
            vo = this.renderBond(<Bond>modelObject);
            vo.modelObject = modelObject;
            this.objects.push(vo);
        }

    }


    select(modelObject: RenderableObject): void {

        let viewObject: ViewObject = <ViewObject>modelObject.viewObject;

        if (!viewObject) throw new Error("cannot find view object for " + modelObject);

        for (let i: number = 0; i < this.selections.length; i++) {
            if (this.selections[i].modelObject === modelObject) {
                // we've already selected.. unselect
                this.deselect(modelObject);
                return;
            }
        }

        if (modelObject instanceof Atom) {
            this.selections.push(this.renderAtomSelection(<Atom>modelObject));
        }
        else if (modelObject instanceof Bond) {
            this.selections.push(this.renderBondSelection(<Bond>modelObject));
        }
    }


    deselect(modelObject: RenderableObject): void {

        for (let i: number = 0; i < this.selections.length; i++) {
            if (this.selections[i].modelObject === modelObject) {
                let sels: ViewObject[] = this.selections.splice(i, 1);
                this.scene.remove(sels[0]);
            }
        }
    }


    deselectAll(): void {

        for (let i: number = 0; i < this.selections.length; i++) {
            this.scene.remove(this.selections[i]);
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


    private animate(): void {

        requestAnimationFrame(() => {
            this.animate();
        });
        this.controls.update();

        let rot = Date.now() * 0.0004;

        this.light.rotation.x = this.scene.rotation.x = rot;
        this.light.rotation.y = this.scene.rotation.y = rot * 0.7;

        this.render();
    }


    render(): void {
        // draw!
        this.renderer.render(this.scene, this.camera);
    }


    private renderAtom(atom: Atom): ViewObject {

        let quality: string = Configuration.getConfig().renderQuality;

        // set up the sphere vars
        let radius = this.radiusConversion(atom.radius),
            segments = 16,
            rings = 16;

        // create the sphere's material
        let sphereMaterial: MeshLambertMaterial = new MeshLambertMaterial({color: atom.color});
        // create a new mesh with sphere geometry
        let geometry: SphereGeometry = new SphereGeometry(radius, segments, rings);
        let sphere: ViewObject = new ViewObject(geometry, sphereMaterial);

        sphere.position = atom.loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);

        // add the sphere to the scene
        this.scene.add(sphere);

        return <ViewObject>sphere;
    }


    private renderBond(bond: Bond): ViewObject {

        let quality: string = Configuration.getConfig().renderQuality;
        let mode: string = Configuration.getConfig().renderMode;

        let tubes: ViewObject[] = [];

        let m: number[] = this.getBondMetrics(bond, mode);
        let bondMaterial: MeshLambertMaterial = new MeshLambertMaterial({color: 0x0000FF});
        let bondLength = bond.length; // 10 * m[2];
        switch (bond.type) {
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

        let bondObj: ViewObject = tubes[0];
        for (let i: number = 1; i < tubes.length; i++) {

            GeometryUtils.merge(tubes[0].geometry, tubes[i].geometry, 0);
            //bondObj.add(tubes[i]);
            m
        }

        let v0: Vector3 = bond.atoms[0].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
        let v1: Vector3 = bond.atoms[1].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
        bondObj.position = v0.add(v1).divideScalar(2);
        bondObj.lookAt(v1);

        this.scene.add(bondObj);

        return bondObj;
    }


    private renderAtomSelection(atom: Atom): ViewObject {

        let quality: string = Configuration.getConfig().renderQuality;

        // set up the sphere vars
        let radius = 1.1 * this.radiusConversion(atom.radius),
            segments = 16,
            rings = 16

        // create the sphere's material
        let sphereMaterial: MeshBasicMaterial = new MeshBasicMaterial({
            color: 0xFF0000,
            opacity: 0.5,
            transparent: true
        });
        // create a new mesh with sphere geometry
        let geometry: SphereGeometry = new SphereGeometry(radius, segments, rings);
        let selObj = new ViewObject(geometry, sphereMaterial);

        selObj.position = atom.loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);

        // add the sphere to the scene
        this.scene.add(selObj);

        selObj.modelObject = atom;

        return selObj;
    }


    private renderBondSelection(bond: Bond): ViewObject {

        let quality: string = Configuration.getConfig().renderQuality;
        let mode: string = Configuration.getConfig().renderMode;

        let m: number[] = this.getBondMetrics(bond, mode);
        let selMaterial: MeshBasicMaterial = new MeshBasicMaterial({
            color: 0xFF0000,
            opacity: 0.5,
            transparent: true
        });
        let bondLength = bond.length;

        let selObj: ViewObject = this.makeCylinder(10, bondLength, selMaterial);

        let v0: Vector3 = bond.atoms[0].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
        let v1: Vector3 = bond.atoms[1].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
        selObj.position = v0.add(v1).divideScalar(2);
        selObj.lookAt(v1);

        selObj.modelObject = bond;
        this.scene.add(selObj);

        return selObj;
    }


    private makeCylinder(width: number, height: number, material: any) {

        let g: CylinderGeometry = new CylinderGeometry(width, width, height, 24, 1, true);
        g.applyMatrix(new Matrix4().makeRotationX(Math.PI / 2));
        let m: ViewObject = new ViewObject(g, material);
        return m;
    }

    /*
     * Measure the "empty space" at the ends of bonds, to make it look right with drawing between atoms
     * [length between atom0 & start of bond, length between end of bond & atom1, bond length as drawn]
     */
    private getBondMetrics(bond: Bond, mode: string): number[] {

        if (mode === Constants.RENDERMODE_STICKS) {
            return [0, bond.length, bond.length];
        }
        else {
            return [bond.atoms[0].radius,
                bond.length - bond.atoms[1].radius,
                bond.length - (bond.atoms[1].radius + bond.atoms[0].radius)];
        }
    }


    private onWindowResize(): void {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.controls.handleResize();

        this.render();
    }


    public getSelectedObject(event: MouseEvent): RenderableObject | undefined {

        event.preventDefault();

        //console.info("event.clientX " + event.clientX);
        //console.info("event.clientY " + event.clientY);

        let vector: Vector3 = new Vector3(( (event.clientX - this.renderer.domElement.offsetLeft) / this.renderer.domElement.clientWidth ) * 2 - 1,
            -( (event.clientY - this.renderer.domElement.offsetTop) / this.renderer.domElement.clientHeight) * 2 + 1, 0.5);
        let ray = this.projector.pickingRay(vector, this.camera);
        let intersects: Intersection[] = ray.intersectObjects(this.objects);

        if (intersects.length > 0) {
            let viewObject: ViewObject = <ViewObject>intersects[0].object;
            let modelObject: RenderableObject = viewObject.modelObject;
            return modelObject;
        }

        return undefined;
    }


    private radiusConversion(radius: number): number {

        return 5 * Math.log(8 * radius);
    }


    private testWebGL(): Boolean {
        //  try { return !! window. && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; }
        return true;
    }

}