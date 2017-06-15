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
    DirectionalLight, Geometry,
    GeometryUtils,
    Light, Matrix,
    Matrix4,
    MeshBasicMaterial,
    MeshLambertMaterial,
    PerspectiveCamera,
    Raycaster,
    Scene,
    SphereGeometry,
    Vector2,
    Vector3,
    WebGLRenderer
} from "three";
import {OrbitControls} from "../../three/OrbitControls";
import {Configuration} from "../Configuration";
import {Constants} from "../Constants";

import {Atom} from "../model/Atom";
import {Bond} from "../model/Bond";
import {RenderableObject} from "../model/RenderableObject";
import {IMolRenderer} from "./IMolRenderer";
import {ViewObject} from "./ViewObject";

/**
 * Renderer for ThreeJS framework by Mr. Doob
 * (http://threejs.org)
 */
export class ThreeJsRenderer implements IMolRenderer {

    private static readonly SCALE: number = 100;
    // scene size
    private static readonly WIDTH = 800;
    private static readonly HEIGHT = 600;
    private static readonly ANTI_ALIAS = 4;

    // camera attributes
    private static readonly VIEW_ANGLE = 45;
    private static readonly ASPECT = ThreeJsRenderer.WIDTH / ThreeJsRenderer.HEIGHT;
    private static readonly NEAR = 0.1;
    private static readonly FAR = 1000000;

    private static readonly SELECTION_COLOR = 0xFF0000;
    private static readonly SELECTION_OPACITY = 0.5;

    private scene: Scene;
    private renderer: WebGLRenderer;
    private camera: PerspectiveCamera;
    private controls: OrbitControls;
    private domElement: HTMLDivElement;
    private lights: Light[] = [];
    private objects: ViewObject[] = [];
    private selections: ViewObject[] = [];

    init(domElement: HTMLElement): void {
        this.domElement = domElement as HTMLDivElement;

        // create a WebGL renderer, camera
        // and a scene
        if (this.testWebGL() === false) {
            alert("Sorry. Please use WebGL-enabled browser (Chrome, Firefox, Safari, IE 11+)");
            return;
        }

        this.renderer = new WebGLRenderer();
        this.renderer.setPixelRatio(ThreeJsRenderer.ANTI_ALIAS);
        this.camera = new PerspectiveCamera(ThreeJsRenderer.VIEW_ANGLE, ThreeJsRenderer.ASPECT,
            ThreeJsRenderer.NEAR, ThreeJsRenderer.FAR);
        this.scene = new Scene();

        // add the camera to the scene
        this.scene.add(this.camera);

        // the camera starts at 0,0,0
        // so pull it back
        this.camera.position.z = 1000;

        // start the renderer
        this.renderer.setSize(ThreeJsRenderer.WIDTH, ThreeJsRenderer.HEIGHT);

        // create a point light
        /*        let light: Light = new PointLight(0xFFFFFF);
         light.position.set(100, 400, 1000);
         this.lights.push(light);
         this.camera.add(light);*/

        // create directional light
        const light = new DirectionalLight(0xffffff, 1.0);
        this.lights.push(light);
        this.camera.add(light);

        // attach the render-supplied DOM element
        this.domElement.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.rotateSpeed = 0.5;
        this.controls.addEventListener("change", () => this.render);
        window.addEventListener("resize", () => {
            this.onWindowResize();
        }, false);

        this.objects = [];

        this.animate(0);
    }

    reset(): void {
        // this.camera.position.set(0,0,1000);
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

    public animate(step: number): void {

        const rot = step * 0.0004;

        this.controls.update();

        //this.lights[0].rotation.x = rot;
        //this.lights[0].rotation.y = rot * 0.7;

        this.render();
        requestAnimationFrame(step => {
            this.animate(step);
        });
    }

    private renderAtom(modelObject: Atom): ViewObject {

        // determine the sphere geometry
        const radius = this.radiusConversion(modelObject.radius);
        const segments = Configuration.renderQuality === Constants.RENDERQUALITY_HIGH ? 24 : 12;

        // create the sphere's material
        const sphereMaterial: MeshLambertMaterial = new MeshLambertMaterial({color: modelObject.color});
        // create a new mesh with sphere geometry
        const geometry: SphereGeometry = new SphereGeometry(radius, segments, segments);
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

        // const m: number[] = this.getBondMetrics(modelObject, Configuration.renderMode);
        const bondLength = modelObject.length;

        const bondWidth = 6;
        const bondSeparation = 10;
        switch (modelObject.type) {

            case 1:
                const m1: MeshLambertMaterial = new MeshLambertMaterial({color: 0x0000FF});
                tubes.push(this.makeCylinder(bondWidth, bondLength, m1));
                break;

            case 2:
                // double cylinders side-by-side
                const m2: MeshLambertMaterial = new MeshLambertMaterial({color: 0x5500DD});
                tubes.push(this.makeCylinder(bondWidth - 1, bondLength, m2));
                tubes.push(this.makeCylinder(bondWidth - 1, bondLength, m2));
                // tubes[0].translateX(bondSeparation);
                tubes[1].translateX(-bondSeparation);
                break;

            case 3:
                // triple cylinders in triangle formation
                const m3: MeshLambertMaterial = new MeshLambertMaterial({color: 0x990099});
                tubes.push(this.makeCylinder(bondWidth - 2, bondLength, m3));
                tubes.push(this.makeCylinder(bondWidth - 2, bondLength, m3));
                tubes.push(this.makeCylinder(bondWidth - 2, bondLength, m3));
                // tubes[0].translateY(bondSeparation * 0.5 * Math.sqrt(3));
                tubes[1].translateX(-bondSeparation / 2);
                tubes[1].translateY(-bondSeparation * Math.sqrt(3) / 2);
                tubes[2].translateX(bondSeparation / 2);
                tubes[2].translateY(-bondSeparation * Math.sqrt(3) / 2);
                break;
        }

        const viewObject: ViewObject = tubes[0];
        const viewGeometry: Geometry = viewObject.geometry as Geometry;
        viewObject.updateMatrix();
        for (let i: number = 1; i < tubes.length; i++) {
            // Merge additional bond tube geometries into a single geometry object
            tubes[i].updateMatrix();
            viewGeometry.merge(tubes[i].geometry as Geometry, tubes[i].matrix, 0);
        }
        viewObject.updateMatrix();

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
        const segments = Configuration.renderQuality === Constants.RENDERQUALITY_HIGH ? 20 : 10;

        // create the sphere's material
        const sphereMaterial: MeshBasicMaterial = new MeshBasicMaterial({
            color: ThreeJsRenderer.SELECTION_COLOR,
            opacity: ThreeJsRenderer.SELECTION_OPACITY,
            transparent: true
        });
        // create a new mesh with sphere geometry
        const geometry: SphereGeometry = new SphereGeometry(radius, segments, segments);
        const viewObject = new ViewObject(geometry, sphereMaterial);

        const p: Vector3 = modelObject.loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
        viewObject.position.set(p.x, p.y, p.z);

        // add the sphere to the scene
        this.scene.add(viewObject);

        viewObject.modelObject = modelObject;

        return viewObject;
    }

    private renderBondSelection(bond: Bond): ViewObject {

        // const m: number[] = this.getBondMetrics(bond, mode);
        const selMaterial: MeshBasicMaterial = new MeshBasicMaterial({
            color: ThreeJsRenderer.SELECTION_COLOR,
            opacity: ThreeJsRenderer.SELECTION_OPACITY,
            transparent: true
        });
        const bondLength = bond.length;
        const selObj: ViewObject = this.makeCylinder(10, bondLength, selMaterial);
        const v0: Vector3 = bond.atoms[0].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
        const v1: Vector3 = bond.atoms[1].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);

        let p = v0.add(v1).divideScalar(2);
        selObj.position.set(p.x, p.y, p.z);
        selObj.lookAt(v1);
        selObj.modelObject = bond;
        this.scene.add(selObj);

        return selObj;
    }

    private makeCylinder(width: number, height: number, material: any) {

        const segments = Configuration.renderQuality === Constants.RENDERQUALITY_HIGH ? 24 : 12;
        const g: CylinderGeometry = new CylinderGeometry(width, width, height, segments, 1, true);
        g.applyMatrix(new Matrix4().makeRotationX(Math.PI / 2));
        return new ViewObject(g, material);
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
