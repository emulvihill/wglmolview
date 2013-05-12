var console;
function init() {
    makeLog();
    var WIDTH = 400, HEIGHT = 300;
    var VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.1, FAR = 10000;
    var $container = $('#container');
    var renderer = new THREE.WebGLRenderer();
    var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    var scene = new THREE.Scene();
    scene.add(camera);
    camera.position.z = 300;
    renderer.setSize(WIDTH, HEIGHT);
    $container.append(renderer.domElement);
    var radius = 50, segments = 16, rings = 16;
    var sphereMaterial = new THREE.MeshLambertMaterial({
        color: 0xCC0000
    });
    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;
    scene.add(pointLight);
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
    sphere.geometry.dynamic = true;
    sphere.geometry.verticesNeedUpdate = true;
    sphere.geometry.normalsNeedUpdate = true;
    scene.add(sphere);
    renderer.render(scene, camera);
}
function makeLog() {
    if(!window.console) {
        console = {
        };
    }
    console.log = console.log || function () {
    };
    console.warn = console.warn || function () {
    };
    console.error = console.error || function () {
    };
    console.info = console.info || function () {
    };
}
//@ sourceMappingURL=Main.js.map
