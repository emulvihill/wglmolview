module molview.renderer {

    /// <reference path="../../../ts/DefinitelyTyped/jquery/jquery.d.ts" />
    /// <reference path="../../../ts/DefinitelyTyped/threejs/three.d.ts" />

    /// <reference path="IMolRenderer.ts" />
    /// <reference path="../model/RenderableObject.ts" />
    /// <reference path="../model/Atom.ts" />
    /// <reference path="../model/Bond.ts" />

    export class ThreeJsRenderer implements IMolRenderer {

        private static SCALE:number = 100;

        private scene:THREE.Scene;
        private renderer:THREE.WebGLRenderer;
        private camera:THREE.PerspectiveCamera;
        private projector:THREE.Projector;
        private light:THREE.Light;
        private controls;
        private domElement:JQuery;
        private objects:THREE.Object3D[] = [];
        private selections:THREE.Object3D[] = [];

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
            this.domElement = $('#container');

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

            // create a projector
            this.projector = new THREE.Projector();

            // attach the render-supplied DOM element
            this.domElement.append(this.renderer.domElement);
            this.domElement.click(null, (event)=>{this.onDocumentMouseDown(event)});

            this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
            this.controls.rotateSpeed = 0.5;
            this.controls.addEventListener( 'change', () => this.render );
            window.addEventListener( 'resize', ()=> {this.onWindowResize()}, false );

            this.objects = [];

            this.animate();
        }


        addRenderableObject(modelObject:molview.model.RenderableObject):void {

            var viewObject:THREE.Object3D;

            if (modelObject instanceof molview.model.Atom) {
                viewObject = this.renderAtom(<molview.model.Atom>modelObject);
            }
            else if (modelObject instanceof molview.model.Bond) {
                viewObject = this.renderBond(<molview.model.Bond>modelObject);
            }

            modelObject['viewObject'] = viewObject;
            viewObject['modelObject'] = modelObject;


            this.objects.push(viewObject);
        }


        select(modelObject:molview.model.RenderableObject):void {

            var viewObject:THREE.Mesh = modelObject['viewObject'];

            if (!viewObject) throw new Error("cannot find view object for " + modelObject);

            for (var i:number = 0; i < this.selections.length; i++) {
                if (this.selections[i]["modelObject"] === modelObject) {
                    // we've already selected.. unselect
                    this.deselect(modelObject);
                    return;
                }
            }

            if (modelObject instanceof molview.model.Atom) {
                this.selections.push(this.renderAtomSelection(<molview.model.Atom>modelObject));
            }
            else if (modelObject instanceof molview.model.Bond) {
                this.selections.push(this.renderBondSelection(<molview.model.Bond>modelObject));
            }
        }


        deselect(modelObject:Object):void {

            for (var i:number = 0; i < this.selections.length; i++) {
                if (this.selections[i]["modelObject"] === modelObject) {
                    var sels:THREE.Object3D[] = this.selections.splice(i,1);
                    this.scene.remove(sels[0]);
                }
            }
        }


        deselectAll():void {

            for (var i:number = 0; i < this.selections.length; i++) {
                this.scene.remove(this.selections[i]);
            }
            this.selections = [];
        }


        setRenderMode(mode:string):void {

            switch (mode)
            {
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

            render();
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


        private renderAtom(atom:molview.model.Atom):THREE.Object3D {

            var quality:string = Configuration.getConfig().renderQuality;

            // set up the sphere vars
            var radius = this.radiusConversion(atom.radius),
                segments = 16,
                rings = 16

            // create the sphere's material
            var sphereMaterial = new THREE.MeshLambertMaterial({ color: atom.color });
            // create a new mesh with sphere geometry
            var geometry:THREE.SphereGeometry = new THREE.SphereGeometry(radius, segments, rings);
            var sphere:THREE.Mesh = new THREE.Mesh(geometry, sphereMaterial);

            sphere.position = atom.loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);

            // add the sphere to the scene
            this.scene.add(sphere);

            return <THREE.Object3D>sphere;
        }


        private renderBond(bond:molview.model.Bond):THREE.Object3D {

            var quality:string = Configuration.getConfig().renderQuality;
            var mode:string = Configuration.getConfig().renderMode;

            var tubes:THREE.Mesh[] = [];

            var m:number[] = this.getBondMetrics(bond, mode);
            var bondMaterial:THREE.MeshLambertMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
            //var bondObj:THREE.Mesh = new THREE.Mesh();
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

            var bondObj:THREE.Mesh = tubes[0];
            for (var i:number = 1; i < tubes.length; i++) {

                THREE.GeometryUtils.merge(tubes[0].geometry, tubes[i].geometry, 0);
                //bondObj.add(tubes[i]);
m            }

            var v0:THREE.Vector3 = bond.atoms[0].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
            var v1:THREE.Vector3 = bond.atoms[1].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
            bondObj.position = v0.add(v1).divideScalar(2);
            bondObj.lookAt(v1);

            this.scene.add(bondObj);

            return <THREE.Object3D>bondObj;
        }


        private renderAtomSelection(atom:molview.model.Atom):THREE.Mesh {

            var quality:string = Configuration.getConfig().renderQuality;

            // set up the sphere vars
            var radius = 1.1 * this.radiusConversion(atom.radius),
                segments = 16,
                rings = 16

            // create the sphere's material
            var sphereMaterial:THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000, opacity:0.5, transparent:true });
            // create a new mesh with sphere geometry
            var geometry:THREE.SphereGeometry = new THREE.SphereGeometry(radius, segments, rings);
            var selObj = new THREE.Mesh(geometry, sphereMaterial);

            selObj.position = atom.loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);

            // add the sphere to the scene
            this.scene.add(selObj);

            selObj["modelObject"] = atom;

            return selObj;
        }


        private renderBondSelection(bond:molview.model.Bond):THREE.Object3D {

            var quality:string = Configuration.getConfig().renderQuality;
            var mode:string = Configuration.getConfig().renderMode;

            var m:number[] = this.getBondMetrics(bond, mode);
            var selMaterial:THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000, opacity:0.5, transparent:true });
            var selObj:THREE.Mesh = this.makeCylinder(10, bondLength, selMaterial);
            var bondLength = bond.length;

            var v0:THREE.Vector3 = bond.atoms[0].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
            var v1:THREE.Vector3 = bond.atoms[1].loc.clone().multiplyScalar(ThreeJsRenderer.SCALE);
            selObj.position = v0.add(v1).divideScalar(2);
            selObj.lookAt(v1);

            selObj["modelObject"] = bond;
            this.scene.add(selObj);

            return <THREE.Object3D>selObj;
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
        private getBondMetrics(bond:molview.model.Bond, mode:string):number[] {

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


        private onWindowResize():void {

            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
            this.controls.handleResize();

            this.render();
        }


        private onDocumentMouseDown(event):void {

            event.preventDefault();

            console.info("event.clientX " + event.clientX);
            console.info("event.clientY " + event.clientY);

            var vector:THREE.Vector3 = new THREE.Vector3( ( (event.clientX-this.renderer.domElement.offsetLeft) / this.renderer.domElement.clientWidth ) * 2 - 1,
                - ( (event.clientY-this.renderer.domElement.offsetTop) / this.renderer.domElement.clientHeight) * 2 + 1, 0.5 );
            var ray = this.projector.pickingRay(vector, this.camera);
            var intersects:THREE.Intersection[] = ray.intersectObjects( this.objects );

            if ( intersects.length > 0 ) {
                var viewObject:THREE.Mesh = <THREE.Mesh>intersects[0].object;
                var modelObject:molview.model.RenderableObject = viewObject['modelObject'];
                this.select(modelObject);
            }
        }

        private radiusConversion(radius:number):number {

            return 5 * Math.log(8 * radius);
        }

    }
}