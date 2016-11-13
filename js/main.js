var gl;
var canvas;
var buffer;
var iGlobalTime;
var iDimensions;
var dimensions = [640, 480];

window.onload = init;

function init() {
    canvas        = document.getElementById('glscreen');
    gl            = canvas.getContext('experimental-webgl');
    canvas.width  = dimensions[0];
    canvas.height = dimensions[1];

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    var shaderScript = document.getElementById("2d-vertex-shader");
    var shaderSource = shaderScript.text;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, shaderSource);
    gl.compileShader(vertexShader);

    shaderScript   = document.getElementById("2d-fragment-shader");
    shaderSource   = shaderScript.text;
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, shaderSource);
    gl.compileShader(fragmentShader);

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0,  1.0,
            -1.0,  1.0,
            1.0, -1.0,
            1.0,  1.0]),
        gl.STATIC_DRAW
    );

    positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    iGlobalTime = gl.getUniformLocation(program, "iGlobalTime");
    iDimensions = gl.getUniformLocation(program, "iDimensions");

    render();

    document.getElementById("fullScreen").onclick = function(){

        dimensions[0] = 1024;
        canvas.width = dimensions[0];
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        var elem = document.getElementById("glscreen");
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }}
}

function render() {
    window.requestAnimationFrame(render, canvas);

    gl.uniform1f(iGlobalTime, (Date.now() / 1000 ) % 1);
    gl.uniform2fv(iDimensions, dimensions);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}