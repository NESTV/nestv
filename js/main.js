$(function() {

var gl;
var canvas;
var buffer;
var iGlobalTime;
var iResolution;
var uNesTexture;
var dimensions = [640, 480];
var nesTexture;
var tempCanvasContext;
var tempCanvas;

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
    iResolution = gl.getUniformLocation(program, "iResolution");
    uNesTexture = gl.getUniformLocation(program, "uNesTexture");

    tempCanvas = document.createElement('canvas');
    tempCanvas.width = 256;
    tempCanvas.height = 256;

    tempCanvasContext = tempCanvas.getContext('2d');

    nesTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, nesTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    render();

    document.getElementById("fullScreen").onclick = function(){

        //can adjust size here
        dimensions[0] = 1024;
        dimensions[1] = 1024*480/640;
        canvas.width = dimensions[0];
        canvas.height = dimensions[1];
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

    copyNesScreenToTexture();

    gl.uniform1f(iGlobalTime, (Date.now() / 1000 ) % 1);
    gl.uniform2fv(iResolution, dimensions);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, nesTexture);
    gl.uniform1i(uNesTexture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

var copyNesScreenToTexture = function(){
    var nesCanvas = $('.nes-screen')[0];
    gl.bindTexture(gl.TEXTURE_2D, nesTexture);

    tempCanvasContext.drawImage(nesCanvas, 0, 0);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

});