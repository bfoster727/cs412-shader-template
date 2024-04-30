
// These import statements get the source code for the shaders and store them in variables.
import vertShaderSource from './shader/hello.vert.glsl';
import fragShaderSource from './shader/hello.frag.glsl';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

import * as THREE from 'three';
import {GUI} from 'lil-gui';

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("resize", resize, false);

let canvas : HTMLCanvasElement;

let renderer : THREE.WebGLRenderer;
let scene : THREE.Scene;
let camera : THREE.PerspectiveCamera;

let particles : Array<Particle> = [];
const state = {
    gravity : 1,
    velocity : 1,
    num_particles : 50,
    lifetime : 49,
    num_new_particles : 1
}

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
        this.life = 0.0;
        this.mesh = null;
    }
}

function main() : void {
    // Get the canvas element
    canvas = document.querySelector('#main-canvas');

    renderer = new THREE.WebGLRenderer( {canvas} );
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45.0, canvas.width / canvas.height, 0.5, 2000 );
    camera.position.z = 15;
    
    const gui = new GUI();
    gui.add(state, 'gravity', 0, 3, 0.1);
    gui.add(state, 'velocity', 1, 5, 0.1);
    gui.add(state, 'num_particles', 10, 1000,1);
    gui.add(state, 'lifetime', 5, 1000, 1);
    gui.add(state, 'num_new_particles', 1, 10, 1);
    
    const controls = new OrbitControls(camera, canvas);
    
    resize();  // Call directly once to initially size the canvas
    window.requestAnimationFrame(draw);
}

function update() : void{
    canvas = document.querySelector('#main-canvas');
    const width = canvas.width;
    const height = canvas.height;
    let g : THREE.Vector3 = new THREE.Vector3(0, -0.0005*state.gravity, 0);

    if(particles.length<state.num_particles) {
        for (let i = 0; i < state.num_new_particles; i++) {
            const p = new Particle();
            p.life = 0.0;
            p.position = new THREE.Vector3(0, -0.5, 0);
            p.velocity = new THREE.Vector3((2*Math.random()-1)*0.01*state.velocity, Math.random()*0.01*state.velocity+0.01,(2*Math.random()-1)*0.01*state.velocity);
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
            circle.lookAt(camera.position);
            scene.add(circle);
            p.mesh = circle;
            particles.push(p);
        }
    }
    for(let i = 0; i<particles.length; i++){
        let p = particles[i];
        if(p.life>state.lifetime){
            scene.remove(p.mesh);
            particles.splice(i,1);
        }
        if(p.life<=state.lifetime){
            p.life++;
            let v = p.velocity.clone();
            p.position.add(v.multiplyScalar(p.life));
            p.mesh.position.set(p.position.x, p.position.y, p.position.z);
            p.velocity = p.velocity.add(g);
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