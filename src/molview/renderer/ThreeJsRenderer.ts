/*
 * =================================================================================================
 *
 * 	WebGL MolView
 * 	Copyright 2013-2024 Eric Mulvihill. All Rights Reserved.
 *
 * 	This program is free software. You can redistribute and/or modify it
 * 	in accordance with the terms of the accompanying license agreement.
 *
 * =================================================================================================
 */

import {
  CylinderGeometry,
  DirectionalLight,
  type Light, Material,
  Matrix4,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SphereGeometry,
  Vector2,
  type Vector3,
  WebGLRenderer,
} from "three";
import {Configuration} from "../Configuration";
import {Constants} from "../Constants";

import {Atom} from "../model/Atom";
import {Bond} from "../model/Bond";
import type {RenderableObject} from "../model/RenderableObject";
import type {IMolRenderer} from "./IMolRenderer";
import {ViewObject} from "./ViewObject";
import {TrackballControls} from "../../three/examples/controls/TrackballControls";

/**
 * Renderer for ThreeJS framework by Mr. Doob
 * (http://threejs.org)
 */
export class ThreeJsRenderer implements IMolRenderer {
  private static readonly SCALE: number = 100;
  private static readonly ANTI_ALIAS = 4;

  // camera attributes
  private static readonly VIEW_ANGLE = 45;
  private static readonly NEAR = 0.1;
  private static readonly FAR = 1000000;

  private static readonly SELECTION_COLOR = 0xff0000;
  private static readonly SELECTION_OPACITY = 0.5;

  private scene: Scene | undefined;
  private webGLRenderer: WebGLRenderer | undefined;
  private camera: PerspectiveCamera | undefined;
  private controls: TrackballControls | undefined;
  private domElement: HTMLDivElement | undefined;
  private lights: Light[] = [];
  private objects: ViewObject[] = [];
  private selections: ViewObject[] = [];

  init(domElement: HTMLElement): void {
    this.domElement = domElement as HTMLDivElement;

    // create a WebGL renderer, camera
    // and a scene
    if (!this.testWebGL()) {
      alert("Sorry. Please use WebGL-enabled browser (Chrome, Firefox, Safari, IE 11+)");
      return;
    }

    const w = this.domElement.clientWidth;
    const h = this.domElement.clientHeight;
    const aspect = w / h;
    this.webGLRenderer = new WebGLRenderer();
    this.webGLRenderer.setPixelRatio(ThreeJsRenderer.ANTI_ALIAS);
    this.camera = new PerspectiveCamera(ThreeJsRenderer.VIEW_ANGLE, aspect, ThreeJsRenderer.NEAR, ThreeJsRenderer.FAR);
    this.scene = new Scene();

    // add the camera to the scene
    this.scene.add(this.camera);

    // the camera starts at 0,0,0
    // so pull it back
    this.camera.position.z = 1000;

    // start the renderer
    this.webGLRenderer.setSize(w, h);

    // create directional light
    const light = new DirectionalLight(0xFFFFFF, 2.5);
    light.position.set(50, 50, 1000);
    this.lights.push(light);
    this.camera.add(light);

    // attach the render-supplied DOM element
    this.domElement.appendChild(this.webGLRenderer.domElement);

    this.controls = new TrackballControls(this.camera, this.webGLRenderer.domElement);
    this.controls.rotateSpeed = 2.5;
    window.addEventListener(
      "resize",
      () => {
        this.onWindowResize();
      },
      false,
    );

    this.objects = [];

    this.animate(0);
  }

  reset(): void {
    for (const value of this.objects) {
      this.scene.remove(value);
    }
    for (const value of this.selections) {
      this.scene.remove(value);
    }
    this.webGLRenderer.clear();
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
    // NOTE: This will not work for deeply nested/offset canvas layer
    const layerX = event.clientX - this.domElement.offsetLeft;
    const layerY = event.clientY - this.domElement.offsetTop;
    // Translate dom coords into GL coords
    mouse.x = (layerX / this.webGLRenderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(layerY / this.webGLRenderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.objects, false);

    if (intersects.length > 0) {
      const vo: ViewObject = intersects[0].object as ViewObject;
      return vo.modelObject;
    }

    return undefined;
  }

  deselect(modelObject: RenderableObject): void {
    for (let i = 0; i < this.selections.length; i++) {
      if (this.selections[i].modelObject === modelObject) {
        const sels: ViewObject[] = this.selections.splice(i, 1);
        this.scene?.remove(sels[0]);
      }
    }
  }

  deselectAll(): void {
    for (const sel of this.selections) {
      this.scene?.remove(sel);
    }
    this.selections = [];
  }

  render(): void {
    // draw!
    this.webGLRenderer?.render(this.scene, this.camera);
  }

  public animate(step: number): void {
    const rot = step * 0.0004;

    this.controls?.update();

    this.lights[0].rotation.x = rot;
    this.lights[0].rotation.y = rot * 0.7;

    this.render();
    requestAnimationFrame((value) => {
      this.animate(value);
    });
  }

  private renderAtom(modelObject: Atom): ViewObject {
    // determine the sphere geometry
    const radius = this.radiusConversion(modelObject.radius);
    const segments = Configuration.renderQuality === Constants.RENDERQUALITY_HIGH ? 24 : 12;

    // create the sphere's material
    const sphereMaterial = new MeshPhongMaterial({color: modelObject.color});
    // create a new mesh with sphere geometry
    const geometry: SphereGeometry = new SphereGeometry(radius, segments, segments);
    const viewObject: ViewObject = new ViewObject(geometry, sphereMaterial);
    const p: Vector3 = modelObject.loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);

    viewObject.position.set(p.x, p.y, p.z);

    viewObject.modelObject = modelObject;
    modelObject.viewObject = viewObject;

    this.scene?.add(viewObject);
    return viewObject;
  }

  private renderBond(modelObject: Bond): ViewObject {
    const tubes: ViewObject[] = [];

    // const m: number[] = this.getBondMetrics(modelObject, Configuration.renderMode);
    const bondLength = modelObject.length;

    const bondWidth = 6;
    const bondSeparation = 10;
    switch (modelObject.type) {
      case 1: {
        const m1 = new MeshPhongMaterial({color: 0x0000ff});
        tubes.push(this.makeCylinder(bondWidth, bondLength, m1));
        break;
      }

      case 2:
        // double cylinders side-by-side
      {
        const m2 = new MeshPhongMaterial({color: 0x5500dd});
        tubes.push(this.makeCylinder(bondWidth - 1, bondLength, m2));
        tubes.push(this.makeCylinder(bondWidth - 1, bondLength, m2));
        // tubes[0].translateX(bondSeparation);
        tubes[1].translateX(-bondSeparation);
        break;
      }

      case 3:
        // triple cylinders in triangle formation
      {
        const m3 = new MeshPhongMaterial({color: 0x990099});
        tubes.push(this.makeCylinder(bondWidth - 2, bondLength, m3));
        tubes.push(this.makeCylinder(bondWidth - 2, bondLength, m3));
        tubes.push(this.makeCylinder(bondWidth - 2, bondLength, m3));
        // tubes[0].translateY(bondSeparation * 0.5 * Math.sqrt(3));
        tubes[1].translateX(-bondSeparation / 2);
        tubes[1].translateY((-bondSeparation * Math.sqrt(3)) / 2);
        tubes[2].translateX(bondSeparation / 2);
        tubes[2].translateY((-bondSeparation * Math.sqrt(3)) / 2);
        break;
      }
    }

    const viewObject: ViewObject = tubes[0];
    viewObject.updateMatrix();
    /* This broke in r125
       const mergedTubes = BufferGeometryUtils.mergeBufferGeometries(tubes.map((t) => t.geometry as BufferGeometry));
        for (let i = 1; i < tubes.length; i++) {
          // Merge additional bond tube geometries into a single geometry object
          tubes[i].updateMatrix();
          viewGeometry.merge(tubes[i].geometry as Geometry, tubes[i].matrix, 0); // breaks in r125
          console.log(`merging geometry ${i}`);
        }
        viewObject.updateMatrix();
     */
    const v0: Vector3 = modelObject.atoms[0].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
    const v1: Vector3 = modelObject.atoms[1].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
    const p: Vector3 = v0.add(v1).divideScalar(2);

    viewObject.position.set(p.x, p.y, p.z);
    viewObject.lookAt(v1);

    viewObject.modelObject = modelObject;
    modelObject.viewObject = viewObject;

    this.scene?.add(viewObject);
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
      transparent: true,
    });
    // create a new mesh with sphere geometry
    const geometry: SphereGeometry = new SphereGeometry(radius, segments, segments);
    const viewObject = new ViewObject(geometry, sphereMaterial);

    const p: Vector3 = modelObject.loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
    viewObject.position.set(p.x, p.y, p.z);

    // add the sphere to the scene
    this.scene?.add(viewObject);

    viewObject.modelObject = modelObject;

    return viewObject;
  }

  private renderBondSelection(bond: Bond): ViewObject {
    // const m: number[] = this.getBondMetrics(bond, mode);
    const selMaterial: MeshBasicMaterial = new MeshBasicMaterial({
      color: ThreeJsRenderer.SELECTION_COLOR,
      opacity: ThreeJsRenderer.SELECTION_OPACITY,
      transparent: true,
    });
    const bondLength = bond.length;
    const selObj: ViewObject = this.makeCylinder(10, bondLength, selMaterial);
    const v0: Vector3 = bond.atoms[0].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
    const v1: Vector3 = bond.atoms[1].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);

    const p = v0.add(v1).divideScalar(2);
    selObj.position.set(p.x, p.y, p.z);
    selObj.lookAt(v1);
    selObj.modelObject = bond;
    this.scene?.add(selObj);

    return selObj;
  }

  private makeCylinder(width: number, height: number, material: Material | Material[]) {
    const segments = Configuration.renderQuality === Constants.RENDERQUALITY_HIGH ? 24 : 12;
    const g: CylinderGeometry = new CylinderGeometry(width, width, height, segments, 1, true);
    g.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2));
    return new ViewObject(g, material);
  }

  private onWindowResize(): void {
    if (!this.domElement || !this.camera) {
      return;
    }
    const w = this.domElement.clientWidth;
    const h = this.domElement.clientHeight;
    this.camera.aspect = w / h; //window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.webGLRenderer?.setSize(w, h);
    this.controls?.reset();

    this.render();
  }

  private radiusConversion(radius: number): number {
    // visualization of atomic boundary based mostly on aesthetics
    switch (Configuration.renderMode) {
      case Constants.RENDERMODE_BALL_AND_STICK:
        return 5 * Math.log(8 * radius);

      case Constants.RENDERMODE_SPACE_FILL:
        return 16 * Math.log(8 * radius);

      default:
        return 0;
    }
  }

  private testWebGL(): boolean {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    // Report the result.
    return gl !== undefined && gl instanceof WebGLRenderingContext;
  }
}
