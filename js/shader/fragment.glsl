uniform float time;
uniform float progress;
uniform float speed;
uniform float dir;
uniform sampler2D uTexture;
uniform sampler2D uDisp;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;
void main()	{
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);

    vec4 disp = texture2D(
		uDisp, 
		(vUv - vec2(0.5)) * (1. + speed) + vec2(0.5)
	);
	float force = pow(length(vUv.x) + 0.5, abs(speed));
	vec2 newuv = vUv*cos(1.-force);

	// gl_FragColor = (0.1 + 2. * speed)*texture2D(uTexture, newuv + disp.xy*0.02 + vec2(0.0, -0.03));
	gl_FragColor = 0.8*texture2D(uTexture, newuv + + disp.xy*0.02 + vec2(0.0, -0.03));
	
}