// webgl + video demo

// gl buffers
var vertBuffer;
var texCoordBuffer;
var vertIndexBuffer;

var gl;
var shaderProgram;
var vertexPositionAttribute;
var texCoordAttribute;

var videoTexture;

// video and canvas html element
var videoElement;
var canvasElement;

var intervalID;

var wrapx = 0.01;
var scaleR = 0.60;

var clickCoord = [0.25,0.8];
var clickAmp = [1.0];

var videoFrame = 0;


function start(v,c) {
	canvasElement = document.getElementById(c);
	videoElement = document.getElementById(v);

	gl = canvasElement.getContext('webgl') || canvasElement.getContext('experimental-webgl');
	if (!gl) {
		alert("WebGL failed.");
		return;
	}

	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program.");
	}

	gl.useProgram(shaderProgram);

	vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(vertexPositionAttribute);

	texCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(texCoordAttribute);

	initBuffers();
	refresh();

	videoElement.addEventListener("canplaythrough", function(){
		videoElement.play();
		clearInterval(intervalID);
		intervalID = setInterval(drawScene, 40);
		videoFrame = 0;
	}, true);
	videoElement.addEventListener("ended", function() {
		clearInterval(intervalID);
	}, true);
}


function refresh() {

	// uniforms
	var u_aspectRatio = gl.getUniformLocation(shaderProgram, "u_aspectRatio");
	gl.uniform1f(u_aspectRatio, 16/9);

	var u_scaleR = gl.getUniformLocation(shaderProgram, "u_scaleR");
	gl.uniform1f(u_scaleR, scaleR);

	var u_wrapx = gl.getUniformLocation(shaderProgram, "u_wrapx");
	gl.uniform1f(u_wrapx, wrapx);

}

function initBuffers() {

	var w = 2.0;
	var h = 2.0;

	// vertex
	var vertices = [
		-w/2, -h/2,
		w/2, -h/2,
		w/2,  h/2,
		-w/2,  h/2
	];
	vertBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	// texCoord
	var textureCoordinates = [
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0
	];
	texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

	// index
	var cubeVertexIndices = [
		0,  1,  2,      0,  2,  3,    // r
	]
	vertIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);

	// texture
	videoTexture = createTexture();

}

function createTexture() {
	// NPOT textures may be ok...
	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return tex;
}

function updateTexture(tex, video) {
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
}



function drawScene() {

	updateTexture(videoTexture, videoElement);

	var uVideoFrame = gl.getUniformLocation(shaderProgram, "u_videoFrame");
	gl.uniform1f(uVideoFrame, videoFrame);

	var u_clickCoord = gl.getUniformLocation(shaderProgram, "u_clickCoord");
	gl.uniform2fv(u_clickCoord, clickCoord);

	var u_clickAmp = gl.getUniformLocation(shaderProgram, "u_clickAmp");
	gl.uniform1fv(u_clickAmp, clickAmp);

	var u_clickCount = gl.getUniformLocation(shaderProgram, "u_clickCount");
	gl.uniform1i(u_clickCount, clickCoord.length/2);


	for (var i = 0; i< clickAmp.length; i++) {
		clickAmp[i] *= 0.98;
	}

	videoFrame ++;


	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// vertex
	gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

	// texCoord
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.vertexAttribPointer(texCoordAttribute, 2, gl.FLOAT, false, 0, 0);

	// texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, videoTexture);
	gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_sampler"), 0);

	// index
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertIndexBuffer);

	// draw
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}


  function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
      return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
      if (k.nodeType == 3) {
        str += k.textContent;
      }
      k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }


