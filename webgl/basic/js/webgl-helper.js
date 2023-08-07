export const getCanvas = (id) => {
	return document.querySelector(id);
}
export const getWebGLContext = (canvas) => {
	return canvas.getContext('webgl') || canvas.getContext("experimental-webgl");
}
export const createShaderFromScript = (gl, shaderType, shaderSourceId) => {
	// 获取色器源码
	var shaderSource = document.querySelector(`#${shaderSourceId}`).innerHTML;
	// 创建顶点着色器对象
	var shader = gl.createShader(shaderType);
	// 将源码分配给顶点着色器对象
	gl.shaderSource(shader, shaderSource);
	// 编译顶点着色器程序
	gl.compileShader(shader);
	return shader;
}

export const createProgram = (gl ,vertexShader, fragmentShader) => {
	//创建着色器程序
	var program = gl.createProgram();
	//将顶点着色器挂载在着色器程序上。
	gl.attachShader(program, vertexShader); 
	//将片元着色器挂载在着色器程序上。
	gl.attachShader(program, fragmentShader);
	//链接着色器程序
	gl.linkProgram(program);
	return program;
}

export const randomColor = () => {
	return {
		r: Math.floor(Math.random() * 255),
		g: Math.floor(Math.random() * 255) ,
		b: Math.floor(Math.random() * 255) ,
		a: Math.floor(Math.random() * 10) / 10 + 0.1,
	}
}