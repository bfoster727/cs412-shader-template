
// These import statements get the source code for the shaders and store them in variables.
import vertShaderSource from './shader/hello.vert.glsl';
import fragShaderSource from './shader/hello.frag.glsl';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

import * as THREE from 'three';
import {Controller, GUI} from 'lil-gui';

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("resize", resize, false);

//Create Canvas and rendering objects
let canvas : HTMLCanvasElement;
let renderer : THREE.WebGLRenderer;
let scene : THREE.Scene;
let camera : THREE.PerspectiveCamera;

//Create empty particle array
let particles : Array<Particle> = [];

//Create bounding box around spawning region
const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const material = new THREE.MeshStandardMaterial({
    wireframe: true,
    color: new THREE.Color(0xffffff)
});
const cube = new THREE.Mesh(geometry, material);

//Create reference to the color controller for the menu
let color_control : Controller;

//Set values for use in the GUI controls
const state = {
    gravity : 1,
    horizontal_velocity : 1,
    vertical_velocity : 1,
    particle_size : 1,
    num_particles : 50,
    lifetime : 49,
    num_new_particles : 1,
    horizontal_spawn_var : 0,
    vertical_spawn_var : 0,
    spawn_visible : true,
    random_color : true,
    color : [255, 255, 255]
}

//Define particle class
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

    //Add bounding cube to scene
    cube.position.set(0,-0.5,0);
    scene.add(cube);

    //Add light to scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    //Create controls GUI
    const gui = new GUI();
    gui.add(state, 'gravity', 0, 3, 0.1);
    gui.add(state, 'horizontal_velocity', 0, 3, 0.01);
    gui.add(state, 'vertical_velocity', 0, 3, 0.01);
    gui.add(state, 'particle_size', 1, 5, 0.1);
    gui.add(state, 'num_particles', 10, 1000,1);
    gui.add(state, 'lifetime', 5, 1000, 1);
    gui.add(state, 'num_new_particles', 1, 10, 1);
    gui.add(state, 'horizontal_spawn_var', 0, 5, 1);
    gui.add(state, 'vertical_spawn_var', 0, 5, 1);
    gui.add(state, 'spawn_visible');
    gui.add(state, 'random_color');
    color_control = gui.addColor(state, 'color');
    
    const controls = new OrbitControls(camera, canvas);
    
    resize();  // Call directly once to initially size the canvas
    window.requestAnimationFrame(draw);
}

//Function to update particles
function update() : void{
    //Toggle cube
    cube.visible = state.spawn_visible;

    if(state.random_color){
        color_control.disable();
    }
    else{
        color_control.enable();
    }

    canvas = document.querySelector('#main-canvas');

    //Gravity vector
    let g : THREE.Vector3 = new THREE.Vector3(0, -0.0005*state.gravity, 0);

    //Check if max particles reached
    if(particles.length<state.num_particles) {
        //Create particles up to number of new particles
        for (let i = 0; i < state.num_new_particles; i++) {
            let p_color;
            //Set color depending on if it is random or selected
            if(state.random_color){
                p_color = new THREE.Color(Math.random(), Math.random(), Math.random())
            }
            else{
                p_color = color_control.getValue();
            }

            //Create new particle and set fields
            const p = new Particle();
            p.life = 0.0;
            p.position = new THREE.Vector3((2*Math.random()-1)*0.1*state.horizontal_spawn_var, -0.5+(2*Math.random()-1)*0.1*state.vertical_spawn_var, (2*Math.random()-1)*0.1*state.horizontal_spawn_var);
            p.velocity = new THREE.Vector3((2*Math.random()-1)*0.01*state.horizontal_velocity, (Math.random()*0.01+0.01)*state.vertical_velocity,(2*Math.random()-1)*0.01*state.horizontal_velocity);
            const geom = new THREE.CircleGeometry(0.1*state.particle_size, 32);
            const material = new THREE.ShaderMaterial({
                uniforms : {
                    color : { value: p_color }
                },
                vertexShader: vertShaderSource,
                fragmentShader: fragShaderSource
            });

            //Create mesh and add to scene
            const circle = new THREE.Mesh(geom, material);
            circle.position.set(p.position.x, p.position.y, p.position.z);
            circle.lookAt(camera.position);
            scene.add(circle);
            p.mesh = circle;
            particles.push(p);
        }
    }
    //Iterate over all particles
    for(let i = 0; i<particles.length; i++){
        let p = particles[i];

        //Delete particles that have reached their lifetime
        if(p.life>state.lifetime){
            scene.remove(p.mesh);
            particles.splice(i,1);
        }

        //Update live particles
        if(p.life<=state.lifetime){
            p.life++;
            let v = p.velocity.clone();
            p.position.add(v.multiplyScalar(p.life));
            p.mesh.position.set(p.position.x, p.position.y, p.position.z);
            p.mesh.lookAt(camera.position);
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