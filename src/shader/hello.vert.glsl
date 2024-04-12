
// The available uniforms in ThreeJS: https://threejs.org/docs/index.html?q=shaderma#api/en/renderers/webgl/WebGLProgram

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
