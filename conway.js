
function setup() {

	const canvas = document.getElementById("glCanvas")
	const gl = canvas.getContext("webgl")

	if(!gl) {
		alert("Cannot initialize webgl.")
		return
	}

	//console.log(gl)

	let width = canvas.height
	let height = canvas.width

	let vertShader1 = document.getElementById("vert1").text
	let fragShader1 = document.getElementById("frag1").text
	let fragShader2 = document.getElementById("frag2").text

	//console.log(document.getElementById("vert1").text)

	const conway = new Conway(gl, height, width, 1, fragShader1, fragShader2, vertShader1)

	function animate(timestamp) {

		conway.next()
		conway.draw()
		requestAnimationFrame(animate)
	
	}

	conway.draw()

	//requestAnimationFrame(animate)

}

function Conway( gl, height, width, scale, fragShader1, fragShader2, vertShader ) {

	this.gl = gl

	this.gameWidth = width
	this.gameHeight = height

	this.viewWidth = width * scale
	this.viewHeight = height * scale

	this.scaleWidth = scale
	this.scaleHeight = scale

	this.quad = new ArrayBuffer(gl, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]))

	this.step = new Program(gl, vertShader, fragShader1)
	this.diplay = new Program(gl, vertShader, fragShader2)

	this.gameFrameBuffer = new Framebuffer(gl)

	/*
		each step renders to texture

	*/
	//wrap, filter, type, format 
	this.back = new Texture(gl, gl.REPEAT, gl.NEAREST, null, gl.RGBA, width, height)
	this.front = new Texture(gl, gl.REPEAT, gl.NEAREST, null, gl.RGBA, width, height)
	this.random()

	gl.disable(gl.DEPTH_TEST)
	
}

Conway.prototype.swap = function() {
	
	let tmp = this.front;
	this.front = this.back;
	this.back = tmp
	return this

}

/*Conway.prototype.setState = function ( state ) {

	this.front.subset()
}*/

Conway.prototype.random = function () {

	let size = this.gameHeight * this.gameWidth
	let state = new Uint8Array(size) 

	for(let i = 0; i < this.gameHeight; i++) {

		for(let j = 0; j < this.gameWidth; j++ ) {

			state[this.gameWidth * i + j] = Math.random() < 0.5 ? 1 : 0

		}
	}

	this.set(state)
	return this

}

/*
	state is C ordered
	
*/
Conway.prototype.set = function(state) {

	if(state.length != this.gameWidth * this.gameHeight)
		throw new Error("state wrong size")

	let gl = this.gl
	let newState = new Uint8Array(this.gameWidth * this.gameHeight * 4)

	for(let i = 0; i < (this.gameWidth * this.gameHeight); i++) {

		let j = 4 * i
		newState[j] = newState[j+1] = newState[j+2] = state[i] ? 255 : 0;
		newState[j+3] = 255 

	}
	//console.log(newState.slice(0,100) )
	this.front.setImage(newState, this.viewWidth, this.viewHeight)
	return this

}

Conway.prototype.clear =  function() {

	this.set(new Uint8Array(this.gameWidth * this.gameHeight))
	return this

}

/*
	Render to back texture attached to gameFrameBuffer
	Bind front texture

*/

Conway.prototype.next = function () {

	let gl = this.gl

	this.gameFrameBuffer.attach(this.back)

	this.front.bind()

	gl.viewport(0, 0, this.gameWidth, this.gameHeight)

	this.step.use()
	.setAttribute('quad', this.quad, 2)
	.setUniform('state', 'uniform1i', 0)
	.setUniform('scale', 'uniform2fv', new Float32Array([this.scaleWidth, this.scaleHeight]))
	.draw(gl.TRIANGLE_STRIP, 0, 4)

	this.swap()

	this.gameFrameBuffer.unbind()

	return this
}


Conway.prototype.draw = function () {
	
	let gl = this.gl

	//this.screenFrameBuffer.bind()
	this.front.bind()

	gl.viewport(0, 0, this.viewWidth, this.viewHeight)

	this.diplay.use()
	.setAttribute('quad', this.quad, 2)
	.setUniform('state', 'uniform1i', 0)
	.setUniform('scale', 'uniform2fv', new Float32Array([this.scaleWidth, this.scaleHeight]) )
	.draw(gl.TRIANGLE_STRIP, 0, 4)

	if( gl.getError() !== gl.NO_ERROR )
		throw new Error("rendering error")
	return this

}

function Framebuffer(gl) {
	
	this.gl = gl
	//this.framebuffer = arguments.length == 2 ? framebuffer : gl.createFramebuffer()
	this.framebuffer = gl.createFramebuffer()

}

Framebuffer.prototype.bind = function () {
	
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer)
	return this

}

Framebuffer.prototype.unbind = function () {
	
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
	return this

}

Framebuffer.prototype.attach = function (texture) {
	
	let gl = this.gl
	this.bind()
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHEMENT0, gl.TEXTURE_2D, texture.texture, 0)
	return this

}

//format, wrap, filter
//repeat, nearest, null, rgba
function Texture (gl, wrap, filter, type, format, width, height) {

	
	this.gl = gl
	this.texture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, this.texture)

	this.wrap = wrap = wrap || gl.REPEAT
	this.filter = filter = filter || gl.NEAREST
	this.format = format = format || gl.RGBA
	this.type = type = type || gl.UNSIGNED_BYTE

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter) 
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)

	//gl.bindTexture(gl.TEXTURE_2D, null)

	gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null)

	return this
	

}

Texture.prototype.setImage = function(image, width, height) {

	let gl = this.gl
	
	//console.log(width, height)
	gl.bindTexture(gl.TEXTURE_2D, this.texture)
	gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, image)
	return this

}

Texture.prototype.bind = function() {
	
	let gl = this.gl
	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D, this.texture)
	return this

}

Texture.prototype.unbind = function () {

	gl.bindTexture(gl.TEXTURE_2D, null)

}

Texture.prototype.copy = function ( x, y, width, height ) {

	let gl = this.gl
	gl.copyTexImage2D(gl.TEXTURE_2D, 0, this.format, x, y, width, height, 0)
	return this

}

Texture.prototype.clear = function( width, height ) {

	let gl = this.gl
	this.bind()
	gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null)
	return this

}



function Program (gl, vertexSource, fragmentSource) {
	
	this.gl = gl
	let program = this.program = gl.createProgram()
	this.variables = {}

	gl.attachShader(program, this.createShader(vertexSource, gl.VERTEX_SHADER))
	gl.attachShader(program, this.createShader(fragmentSource, gl.FRAGMENT_SHADER))
	gl.linkProgram(program)

	if(!this.gl.getProgramParameter(program, gl.LINK_STATUS))
		throw new Error(this.gl.getProgramInfoLog(program))
	//this.check(program, this.gl.getProgramParameter, gl.LINK_STATUS)

}

Program.prototype.createShader = function (source, type) {
	
	let gl = this.gl
	let shader = gl.createShader(type)
	gl.shaderSource(shader, source)
	gl.compileShader(shader)

	//this.check(shader, this.gl.getShaderParameter, gl.COMPILE_STATUS)
	if(!this.gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		throw new Error(this.gl.getShaderInfoLog(shader))

	return shader

}

Program.prototype.check = function (shader, func, arg) {

	if(! func(shader, arg))
		throw new Error(this.gl.getShaderInfoLog(shader))

}


Program.prototype.use = function() {

	this.gl.useProgram(this.program)
	return this

}

Program.prototype.setUniform = function( name, method, value ) {

	this.variables[name] = this.variables[name] || this.gl.getUniformLocation(this.program, name)

	console.log(this.variables)
	
	this.gl[method](this.variables[name], value)

	return this

}

Program.prototype.setAttribute = function( name, value, size ) {

	let gl = this.gl
	this.variables[name] = this.variables[name] || gl.getAttribLocation( this.program, name )

	gl.enableVertexAttribArray(this.variables[name])
	// stride offset
	gl.vertexAttribPointer(this.variables[name], size, gl.FLOAT, false, 0, 0)

	return this

}

Program.prototype.draw = function( mode, offset, count ) {

	let gl = this.gl
	gl.drawArrays(mode, offset, count)
	return this

}

function ArrayBuffer(gl, data) {

	this.gl = gl
	this.buffer = gl.createBuffer()
	this.bind( this.buffer )
	this.set(data)

}

ArrayBuffer.prototype.bind = function( ) {

	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)
	return this

}

ArrayBuffer.prototype.set = function( data ) {

	let gl = this.gl
	//this.bind()
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
	return this

}

console.log("running setup")

try {

	setup()

} catch(error) {

	console.log(error)

}