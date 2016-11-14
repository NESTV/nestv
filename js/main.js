$(function() {

var gl;
var canvas;
var buffer;
var iGlobalTime;
var iResolution;
var uNesTexture;
var uBorderTexture;
var dimensions = [640, 480];
var nesTexture;
var tempCanvasContext;
var tempCanvas;
var nesCanvas;
var borderTexture;

window.onload = init;

function init() {
    canvas        = document.getElementById('glscreen');
    gl            = canvas.getContext('experimental-webgl');
    nesCanvas = $('.nes-screen')[0];

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
    uBorderTexture = gl.getUniformLocation(program, "uBorderTexture");

    tempCanvas = document.createElement('canvas');
    tempCanvas.width = 256;
    tempCanvas.height = 256;

    tempCanvasContext = tempCanvas.getContext('2d');

    nesTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, nesTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    borderTexture = loadTexture("img/tv_border_2.png");

    $('.nes-screen').hide();
    $('.nes-zoom').hide();

    render();

    document.getElementById("fullScreen").onclick = function(){

        //can adjust size here
        dimensions[0] = screen.height * 4 / 3;
        dimensions[1] = screen.height;
        canvas.width = dimensions[0];
        canvas.height = dimensions[1];
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        fullscreen(canvas);
}

    function loadTexture(url) {
        var newTexture = gl.createTexture();
        var image = new Image();
        image.onload = function() { handleTextureLoaded(image, newTexture); };
        image.crossOrigin = '';
        image.src = url;
        return newTexture;
    }

    function handleTextureLoaded(image, texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

function fullscreen(elem){
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

    gl.uniform1f(iGlobalTime, (Date.now() / 1000) % 10000);
    gl.uniform2fv(iResolution, dimensions);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, nesTexture);
    gl.uniform1i(uNesTexture, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, borderTexture);
    gl.uniform1i(uBorderTexture, 1);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

var copyNesScreenToTexture = function(){
    gl.bindTexture(gl.TEXTURE_2D, nesTexture);

    tempCanvasContext.drawImage(nesCanvas, 0, 0);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

});