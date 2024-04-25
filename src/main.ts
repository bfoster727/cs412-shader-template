
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

let num_particles = 500;
let particles : Array<Particle> = [];

class Particle {
    position : THREE.Vector3;
    velocity : THREE.Vector3;
    color : THREE.Color;
    life : number;
    mesh : THREE.Mesh;
    constructor(){
        this.position = new THREE.Vector3(0,0,0);
        this.velocity = new THREE.Vector3(0,1,0);
        this.color = new THREE.Color(255,0,0);
        this.life = 0;
        this.mesh = null;
    }
}

function main() : void {
    // Get the canvas element
    canvas = document.querySelector('#main-canvas');

    renderer = new THREE.WebGLRenderer( {canvas} );
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45.0, canvas.width / canvas.height, 0.5, 2000 );
    camera.position.z = 8.0;


    // Create geometry for a mesh containing a single triangle
    //const pos = [ -3, -3, 0, 3, -3, 0, 0, 3, 0];
    //const posBuf = new THREE.BufferAttribute(Float32Array.from(pos), 3);
    //const geom = new THREE.BufferGeometry();
    const pos = [0,0,0];
    const posBuf = new THREE.BufferAttribute(Float32Array.from(pos),1);
    const geom = new THREE.CircleGeometry(1,32);
    //geom.setAttribute("position", posBuf);

    // The material for the triangle will be our shader program
    const material = new THREE.ShaderMaterial( { 
        vertexShader: vertShaderSource,
        fragmentShader: fragShaderSource 
    } );
    
    // Add the triangle mesh to the scene
    //const circle = new THREE.Mesh(geom, material);
    //circle.position.set(0,2,-10);
    //scene.add(circle);

    resize();  // Call directly once to initially size the canvas
    window.requestAnimationFrame(draw);
}

function update() : void{
    canvas = document.querySelector('#main-canvas');
    const width = canvas.width;
    const height = canvas.height;

    if(particles.length<num_particles) {
        for (let i = 0; i < 2; i++) {
            const p = new Particle();
            p.life = 50.0;
            p.position = new THREE.Vector3((2*Math.random()-1)*5, (2*Math.random()-1)*3, 0);
            const geom = new THREE.CircleGeometry(0.5, 32);
            const material = new THREE.ShaderMaterial({
                uniforms : {
                    color : { value: new THREE.Color(Math.random(), Math.random(), Math.random()) }
                },
                vertexShader: vertShaderSource,
                fragmentShader: fragShaderSource
            });
            const circle = new THREE.Mesh(geom, material);
            circle.position.set(p.position.x, p.position.y, p.position.z);
            scene.add(circle);
            p.mesh = circle;
            particles.push(p);
        }
    }
    for(let i = 0; i<particles.length; i++){
        let p = particles[i];
        if(p.life<0){
            scene.remove(p.mesh);
            particles.splice(i,1);
        }
        if(p.life>=0){
            p.life--;
        }
    }
}

function draw(time : number) : void {
    update();
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