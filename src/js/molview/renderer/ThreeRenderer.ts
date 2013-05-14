module molview.renderer {

    /// <reference path="../../../ts/DefinitelyTyped/jquery/jquery.d.ts" />
    /// <reference path="../../../ts/DefinitelyTyped/threejs/three.d.ts" />

    /// <reference path="IMolRenderer.ts" />
    /// <reference path="../model/RenderableObject.ts" />
    /// <reference path="../model/Atom.ts" />
    /// <reference path="../model/Bond.ts" />

    export class ThreeRenderer implements IMolRenderer {

        private static SCALE:number = 100;

        private scene:THREE.Scene;
        private renderer:THREE.WebGLRenderer;
        private camera:THREE.PerspectiveCamera;
        private light:THREE.Light;
        private controls;

        init():void {
            // set the scene size
            var WIDTH = 800,
                HEIGHT = 600;

            // set some camera attributes
            var VIEW_ANGLE = 45,
                ASPECT = WIDTH / HEIGHT,
                NEAR = 0.1,
                FAR = 10000;

            // get the DOM element to attach to
            // - assume we've got jQuery to hand
            var $container = $('#container');

            // create a WebGL renderer, camera
            // and a scene
            this.renderer = new THREE.WebGLRenderer();
            this.camera =
                new THREE.PerspectiveCamera(
                    VIEW_ANGLE,
                    ASPECT,
                    NEAR,
                    FAR);

            this.scene = new THREE.Scene();

            // add the camera to the scene
            this.scene.add(this.camera);

            // the camera starts at 0,0,0
            // so pull it back
            this.camera.position.z = 1000;

            // start the renderer
            this.renderer.setSize(WIDTH, HEIGHT);

            // create a point light
            this.light = new THREE.PointLight(0xFFFFFF);

            // set its position
            this.light.position.x = 100;
            this.light.position.y = 400;
            this.light.position.z = 1000;

            // add to the scene
            this.camera.add(this.light);

            // attach the render-supplied DOM element
            $container.append(this.renderer.domElement);

            this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
            this.controls.rotateSpeed = 0.5;
            this.controls.addEventListener( 'change', () => this.render );
            window.addEventListener( 'resize', ()=> {this.onWindowResize()}, false );

            this.animate();
        }

        private onWindowResize():void {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
            this.controls.handleResize();

            this.render();
        }

        addRenderableObject(obj:molview.model.RenderableObject):void {
            var view_obj:THREE.Mesh;

            if (obj instanceof molview.model.Atom) {
                view_obj = this.renderAtom(<molview.model.Atom>obj);
            }
            else if (obj instanceof molview.model.Bond) {
                view_obj = this.renderBond(<molview.model.Bond>obj);
            }
        }


        private animate():void {
            requestAnimationFrame( ()=> {this.animate();}, <HTMLCanvasElement>this.renderer.domElement);
            this.controls.update();

            var rot = Date.now() * 0.0004;

            this.light.rotation.x = this.scene.rotation.x = rot;
            this.light.rotation.y = this.scene.rotation.y = rot * 0.7;

            this.render();
        }


        render():void {
            // draw!
            this.renderer.render(this.scene, this.camera);
        }


        private renderAtom(atom:molview.model.Atom):THREE.Mesh
        {
            var quality:string = Configuration.getConfig().renderQuality;

            // set up the sphere vars
            var radius = atom.radius,
                segments = 12,
                rings = 12

            // create the sphere's material
            var sphereMaterial = new THREE.MeshLambertMaterial({ color: parseInt(atom.color, 16) });
            // create a new mesh with sphere geometry
            var sphere = new THREE.Mesh(
                new THREE.SphereGeometry(radius, segments, rings),
                sphereMaterial);

            // set the geometry to dynamic so that it allow updates
            sphere.geometry.dynamic = true;

            // changes to the vertices
            sphere.geometry.verticesNeedUpdate = true;

            // changes to the normals
            sphere.geometry.normalsNeedUpdate = true;

            sphere.position = atom.loc.clone().multiplyScalar(ThreeRenderer.SCALE);

            // add the sphere to the scene
            this.scene.add(sphere);

            return sphere;
        }


        private renderBond(bond:molview.model.Bond):THREE.Mesh {
            var quality:string = Configuration.getConfig().renderQuality;
            var mode:string = Configuration.getConfig().renderMode;

            var tubes:THREE.Mesh[] = [];

            var m:number[] = this.getBondMetrics(bond, mode);
            var bondMaterial:THREE.MeshNormalMaterial = new THREE.MeshNormalMaterial();
            var bondObj:THREE.Mesh = new THREE.Mesh();
            var bondLength = bond.length; // 10 * m[2];
            switch (bond.type)
            {
                case 1:
                    tubes.push( this.makeCylinder(6, bondLength, bondMaterial) );
                    break;

                case 2:
                    tubes.push( this.makeCylinder(5, bondLength, bondMaterial) );
                    tubes.push(  this.makeCylinder(5, bondLength, bondMaterial) );
                    tubes[0].translateX(6);
                    tubes[1].translateX(-6);
                    break;

                case 3:
                    tubes.push( this.makeCylinder(4, bondLength, bondMaterial) );
                    tubes.push( this.makeCylinder(4, bondLength, bondMaterial) );
                    tubes.push( this.makeCylinder(4, bondLength, bondMaterial) );
                    tubes[0].translateX(6);
                    tubes[0].translateY(-3.5);
                    tubes[1].translateX(-6);
                    tubes[1].translateY(-3.5);
                    tubes[2].translateY(3.5);
                    break;
            }

            for (var i:number = 0; i < tubes.length; i++) {
                bondObj.add(tubes[i]);
m            }

            var v0:THREE.Vector3 = bond.atoms[0].loc.clone().multiplyScalar(ThreeRenderer.SCALE);
            var v1:THREE.Vector3 = bond.atoms[1].loc.clone().multiplyScalar(ThreeRenderer.SCALE);
            bondObj.position = v0.add(v1).divideScalar(2);
            bondObj.lookAt(v1);

            this.scene.add(bondObj);

            return bondObj;
        }

        private makeCylinder(width:number, height:number, material:any) {

            var g:THREE.CylinderGeometry = new THREE.CylinderGeometry(width, width, height, 24, 1, true);
            g.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );
            var m:THREE.Mesh = new THREE.Mesh(g, material);
            return m;
        }

        /*
         * Measure the "empty space" at the ends of bonds, to make it look right with drawing between atoms
         * [length between atom0 & start of bond, length between end of bond & atom1, bond length as drawn]
         */
        private getBondMetrics(bond:molview.model.Bond, mode:string):number[]
        {
            if (mode === Constants.RENDERMODE_STICKS)
            {
                return [0, bond.length, bond.length];
            }
            else
            {
                return [bond.atoms[0].radius,
                        bond.length - bond.atoms[1].radius,
                        bond.length - (bond.atoms[1].radius + bond.atoms[0].radius)];
            }
        }

    }
}