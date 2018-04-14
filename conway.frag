
precision mediump float;

uniform sampler2D state;
uniform vec2 scale;

int at(vec2 coord)
{
	
	return int( texture2D( state, (gl_FragCoord.xy + coord) * scale ).r );

}

void main() 
{
	
	int sum = 

}

