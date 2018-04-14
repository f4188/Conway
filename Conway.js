

function Conway( gl, width, height, scale ) {

	this.gl = gl
	this.gameWidth = width
	this.gameHeight = height

	this.viewWidth = width * scale
	this.viewHeight = height * scale

	this.quad = [ [0, 0] ]


	this.gameFrameBuffer = //new Framebuffer(gl)
	this.screenFrameBuffer = new Framebuffer(gl)

	this.game = new Texture(null, gl.REPEAT, gl.NEAREST, gl.RGBA)
	this.gameNext = new Texture(null, gl.REPEAT, gl.NEAREST, glRGBA)

	this.step
	this.copy

	
}

Conway.prototype.swap = function() {
	
	let tmp = this.textures.front;
	this.front = this.back;
	this.back = tmp
	return this

}

Conway.prototype.setState = function ( state ) {

	this.front.subset()
}

Conway.prototype.random = function () {

	let size = this.gameHeight * this.gameWidth
	let state = new Uint8Array( size ) 

	for(let i = 0; i < this.gameHeight, i++) {

		for(let j = 0; j < this.gameWidth; j++ ) {

			state[ this.gameWidth * i + j ] = Math.random() < 0.5 ? 1 : 0

		}
	}

	this.setState( state )
	return this

}

Conway.prototype.clear =  function() {}

	this.set( new Uint8Array( this.gameWidth * this.gameHeight ))
	return this

}

Conway.prototype.step = function () {

	let gl = this.gl
	this.framebuffers.

	this.before.bind(0)
	gl.viewport(0, 0, this.gameWidth, this.gameHeight)

	this.step.use()
	.attrib('quad', this.quad, 2)
	.uniform('state', 'uniform2iv', [ this.gameWidth, this.gameHeight ])
	.uniform('scale', 'uniform2fv', [this.scaleWidth, this.scaleHeight ])
	.draw( gl.TRIANGLE_STRIP, 0, 4 )

	this.swap()
	return this
}


Conway.prototype.draw = function () {
	
	let gl = this.gl
	this.framebuffer.bind()
	this.front.bind(0)

	gl.viewport( 0, 0, this.gameHeight, this.gameWidth )

	this.copy.use()
	.attrib('quad', this.quad, 2)
	.uniform('state', 'uniform2iv', [ this.gameWidth, this.gameHeight] )
	.uniform('scale', 'uniform2iv',[ this.scaleWidth, this.scaleHeight] )
	.draw( gl.TRIANGLE_STRIP, 0, 4 )
	return this

}

Conway.prototype.program = function () {
	

}

function Framebuffer = function ( gl ) {
	
	this.gl = gl
	this.framebuffer = gl.createFramebuffer()

}

Framebuffer.prototype.bind = function () {
	
	this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.framebuffer )
	return this

}

Framebuffer.prototype.unbind = function () {
	
	this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null )
	return this

}

Framebuffer.prototype.attach = function (texture) {
	
	let gl = this.gl
	this.bind()
	gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHEMENT0, gl.TEXTURE_2D, texture.texture, 0 )

	return this

}

function Texture ( gl, wrap, filter, type, format, image ) {
	
	this.gl = gl
	this.texture = gl.createTexture()
	gl.bindTexture( gl.TEXTURE_2D, texture )

	this.wrap = wrap = wrap || gl.CLAMP_TO_EDGE
	this.filter = filter = filter || gl.LINEAR
	this.format = format = format || gl.RGBA
	this.type = type = type || gl.UNSIGNED_BYTE

	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap )
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap )
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter ) 
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter )

	//gl.texImage2D( gl.TEXTURE_2D, 0, format, format, type, image )

}

Texture.prototype.setImage = function( image, width, height ) {

	let gl = this.gl
	this.bind()

	gl.texImage2D( gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, image )
	return this

}

Texture.prototype.bind = function( unit ) {
	
	let gl = this.gl
	gl.activeTexture( gl.Texture0 + unit )
	gl.bindTexture( gl.TEXTURE_2D, this.texture )
	return this

}

Texture.prototype.unbind = function () {}

Texture.prototype.copy = function ( x, y, width, height ) {

	let gl = this.gl
	gl.copyTexImage2D( gl.TEXTURE_2D, 0, this.format, x, y, width, height, 0)
	return this

}



function Program( gl, vertexSource, fragmentSource ) {
	
	this.gl = gl
	this.program = gl.createProgram()
	this.variables = {}

	let program = this.program

	gl.attachShader( program, this.createShader( vertexSource, gl.VERTEX_SHADER ))
	gl.attachShader( program, this.createShader( fragmentSource, gl.FRAGMENT_SHADER ))
	gl.linkProgram( program )

	if( !this.check( program, gl.LINK_STATUS ) )
		throw new Error( gl.getShaderInfoLog( program ) )

}

Program.prototype.createShader = function ( source, type ) {
	
	let gl = this.gl
	let shader = gl.createShader( type )
	gl.shaderSource( shader, source )
	gl.compileShader( shader )

	if( !this.check( shader, gl.COMPILE_STATUS ) )
		throw new Error( gl.getShaderInfoLog( program ))

}

Program.prototype.check = function ( arg ) {

	return this.gl.getShaderParameter( arg, gl.COMPILE_STATUS )	

}


Program.prototype.use = function() {

	this.gl.useProgram( this.program )
	return this

}

Program.prototype.setUniform = function( name, value, method ) {

	this.variables[name] = this.variables[name] || this.gl.getUniformLocation( this.program, name )
	gl[method]( this.variables[name], value )

}

/*
	value must be bound
	value.bind()
	program.setAttribute(name, value)

*/
Program.prototype.setAttribute = function( name, value, size, stride ) {

	let gl = this.gl
	this.variables[name] = this.variables[name] || gl.getAttribLocation( this.program, name )


	gl.enableVertexAttribArray( this.variables[name] )
	gl.vertexAttribPoint( this.variables[name], size, gl.FLOAT, false, stride == null ? 0 : stride, 0)

}

Program.prototype.draw = function( mode, offset, count ) {

	let gl = this.gl
	gl.drawArrays( mode, offset, count)
	return this

}