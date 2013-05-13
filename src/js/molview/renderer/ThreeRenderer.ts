module molview.renderer {

    /// <reference path="../../../ts/DefinitelyTyped/jquery/jquery.d.ts" />
    /// <reference path="../../../ts/DefinitelyTyped/threejs/three.d.ts" />

    /// <reference path="IMolRenderer.ts" />
    /// <reference path="../model/RenderableObject.ts" />

    export class ThreeRenderer implements IMolRenderer {

        private scene:THREE.Scene;
        private renderer:THREE.WebGLRenderer;
        private camera:THREE.PerspectiveCamera;

        init():void {
            // set the scene size
            var WIDTH = 400,
                HEIGHT = 300;

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
            this.camera.position.z = 300;

            // start the renderer
            this.renderer.setSize(WIDTH, HEIGHT);

            // attach the render-supplied DOM element
            $container.append(this.renderer.domElement);
        }

        addRenderableObject(obj:molview.model.RenderableObject):void { }

        render():void {

            // create the sphere's material
            var sphereMaterial =
                new THREE.MeshLambertMaterial(
                    {
                        color: 0xCC0000
                    });

            // create a point light
            var pointLight =
                new THREE.PointLight(0xFFFFFF);

            // set its position
            pointLight.position.x = 10;
            pointLight.position.y = 50;
            pointLight.position.z = 130;

            // add to the scene
            this.scene.add(pointLight);

            // set up the sphere vars
            var radius = 50,
                segments = 16,
                rings = 16;

            // create a new mesh with
            // sphere geometry - we will cover
            // the sphereMaterial next!
            var sphere = new THREE.Mesh(

                new THREE.SphereGeometry(
                    radius,
                    segments,
                    rings),

                sphereMaterial);


            // set the geometry to dynamic
            // so that it allow updates
            sphere.geometry.dynamic = true;

            // changes to the vertices
            sphere.geometry.verticesNeedUpdate = true;

            // changes to the normals
            sphere.geometry.normalsNeedUpdate = true;


            // add the sphere to the scene
            this.scene.add(sphere);

            // draw!
            this.renderer.render(this.scene, this.camera);
        }

    }
}