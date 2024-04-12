
// These import statements get the source code for the shaders and store them in variables.
import vertShaderSource from './shader/hello.vert.glsl';
import fragShaderSource from './shader/hello.frag.glsl';

import * as THREE from 'three';
import {GUI} from 'lil-gui';

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("resize", resize, false);

let canvas : HTMLCanvasElement;

let renderer : THREE.WebGLRenderer;
let scene : THREE.Scene;
let camera : THREE.PerspectiveCamera;

function main() : void {
    // Get the canvas element
    canvas = document.querySelector('#main-canvas');

    renderer = new THREE.WebGLRenderer( {canvas} );
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45.0, canvas.width / canvas.height, 0.5, 2000 );
    camera.position.z = 8.0;

    // Create geometry for a mesh containing a single triangle
    const pos = [ -3, -3, 0, 3, -3, 0, 0, 3, 0];
    const posBuf = new THREE.BufferAttribute(Float32Array.from(pos), 3);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", posBuf);

    // The material for the triangle will be our shader program
    const material = new THREE.ShaderMaterial( { 
        vertexShader: vertShaderSource,
        fragmentShader: fragShaderSource 
    } );
    
    // Add the triangle mesh to the scene
    const tri = new THREE.Mesh(geom, material);
    scene.add(tri);

    resize();  // Call directly once to initially size the canvas
    window.requestAnimationFrame(draw);
}

function draw(time : number) : void {
    renderer.render(scene, camera);
    window.requestAnimationFrame(draw);
}

function resize() {
    // Get the dimensions of the canvas' parent
    const canvasContainer = canvas.parentElement;
    const w = canvasContainer.clientWidth;
    const h = canvasContainer.clientHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}