class IrradianceMaker {
    constructor(sourceTexture, near, far, cubeResolution, options) {
        //
        this.cubes = [];
        this.sourceTexture = sourceTexture;
        this.resolution = (cubeResolution !== undefined) ? cubeResolution : 256; // NODE: 256 is currently hard coded in the glsl code for performance reasons

        var monotonicEncoding = (this.sourceTexture.encoding === THREE.LinearEncoding) ||
            (this.sourceTexture.encoding === THREE.GammaEncoding) || (this.sourceTexture.encoding === THREE.sRGBEncoding);

        this.sourceTexture.minFilter = (monotonicEncoding) ? THREE.LinearFilter : THREE.NearestFilter;
        this.sourceTexture.magFilter = (monotonicEncoding) ? THREE.LinearFilter : THREE.NearestFilter;
        this.sourceTexture.generateMipmaps = false;
        //
        this.scene = new THREE.Scene();
        var fov = 90, aspect = 1;
        this.cameras = [];
        this.shader = this.makeIrradianceMap(sourceTexture);
        var BoxMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(2, 2, 2), this.shader);
        BoxMesh.material.side = THREE.BackSide;
        this.scene.add(BoxMesh);
        //
        var cameraPX = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraPX.up.set(0, - 1, 0);
        cameraPX.lookAt(new THREE.Vector3(-1, 0, 0));
        this.scene.add(cameraPX);
        this.cameras.push(cameraPX)
        var cameraNX = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraNX.up.set(0, - 1, 0);
        cameraNX.lookAt(new THREE.Vector3( 1, 0, 0));
        this.scene.add(cameraNX);
        this.cameras.push(cameraNX)

        var cameraPY = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraPY.up.set(0, 0, 1);
        cameraPY.lookAt(new THREE.Vector3(0, 1, 0));
        this.scene.add(cameraPY);
        this.cameras.push(cameraPY)

        var cameraNY = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraNY.up.set(0, 0, - 1);
        cameraNY.lookAt(new THREE.Vector3(0, - 1, 0));
        this.scene.add(cameraNY);
        this.cameras.push(cameraNY)

        var cameraPZ = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraPZ.up.set(0, - 1, 0);
        cameraPZ.lookAt(new THREE.Vector3(0, 0, 1));
        this.scene.add(cameraPZ);
        this.cameras.push(cameraPZ)

        var cameraNZ = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraNZ.up.set(0, - 1, 0);
        cameraNZ.lookAt(new THREE.Vector3(0, 0, - 1));
        this.scene.add(cameraNZ);
        this.cameras.push(cameraNZ)
        //
        var params = {
            format: this.sourceTexture.format,
            magFilter: this.sourceTexture.magFilter,
            minFilter: this.sourceTexture.minFilter,
            type: this.sourceTexture.type,
            generateMipmaps: this.sourceTexture.generateMipmaps,
            anisotropy: this.sourceTexture.anisotropy,
            encoding: this.sourceTexture.encoding
        };
        if ( params.encoding === THREE.RGBM16Encoding ) {

			params.magFilter = THREE.LinearFilter;
			params.minFilter = THREE.LinearFilter;

		}
        //var options = options || { format: THREE.RGBFormat, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter };
        var renderTarget = new THREE.WebGLRenderTargetCube(cubeResolution, cubeResolution, params);
        renderTarget.texture.name = "Cube";
        this.cubes.push(renderTarget)
    }
    update(renderer) {
        var that = this;
        var gammaInput = renderer.gammaInput;
        var gammaOutput = renderer.gammaOutput;
        var toneMapping = renderer.toneMapping;
        var toneMappingExposure = renderer.toneMappingExposure;
        var currentRenderTarget = renderer.getRenderTarget();
        that.shader.uniforms[ 'envMap' ].value = that.sourceTexture;
		that.shader.envMap = that.sourceTexture;
		that.shader.needsUpdate = true;

        renderer.toneMapping = THREE.LinearToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.gammaInput = false;
        renderer.gammaOutput = false;
        //
        that.renderToCubeMapTarget(renderer, that.cubes[0])
        //
        renderer.setRenderTarget(currentRenderTarget);
        renderer.toneMapping = toneMapping;
        renderer.toneMappingExposure = toneMappingExposure;
        renderer.gammaInput = gammaInput;
        renderer.gammaOutput = gammaOutput;
    }
    renderToCubeMapTarget(renderer, renderTarget) {
        var that = this;
        for (var i = 0; i < 6; i++) {

            that.renderToCubeMapTargetFace(renderer, renderTarget, i);

        }
    }
    renderToCubeMapTargetFace(renderer, renderTarget, faceIndex) {
        var that = this;
        renderer.setRenderTarget(renderTarget, faceIndex);
        renderer.clear();
        renderer.render(that.scene, that.cameras[faceIndex]);
    }
    makeIrradianceMap(hdrCubeMap) {
        var uniform = {
            'envMap': { value: null }
        };
        uniform['envMap'].value = hdrCubeMap;
        return new THREE.ShaderMaterial(
            {
                side: THREE.BackSide,
                depthTest: true,
                uniforms: uniform,
                vertexShader: "varying vec2 vUv;\n\
				varying vec3 vWorldPos;\n\
				void main() {\n\
					vUv = uv;\n\
					vWorldPos= position;\n\
					gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);\n\
					gl_Position.z = gl_Position.w;\n\
				}",
                fragmentShader: "varying vec2 vUv;\
				varying vec3 vWorldPos;\n\
				uniform vec3 begin;\
				uniform vec3 end;\
				uniform samplerCube envMap;\
				uniform float iTime;\
                const float PI=3.1415926;\
                void main() {\
                    vec3 irradiance=vec3(0.);\
                    vec3 N=normalize(vWorldPos);\
                    vec3 U=vec3(0.0,1.0,0.0);\
                    vec3 R=cross(U,N);\
                    U=cross(N,R);\
                    const float sampleDelta=0.025;\
                    float nrSamples=0.;\
                    for(float phi=0.0;phi<2.*PI;phi+=sampleDelta)\
                    {\
                      for(float theta=0.0;theta<0.5*PI;theta+=sampleDelta)\
                      {\
                        vec3 tangentSample=vec3(sin(theta)*cos(phi),sin(theta)*sin(phi),cos(theta));\
                        vec3 sampleVec=tangentSample.x*R+tangentSample.y*U+tangentSample.z*N;\
                        irradiance+=textureCube(envMap,sampleVec).rgb*cos(theta)*sin(theta);\
                        nrSamples+=1.0;\
                      }\
                    }\
                    irradiance=PI*irradiance*(1./nrSamples);\
                    gl_FragColor=(vec4(irradiance,1.0));\
                }",
            }
        )
    }
}

