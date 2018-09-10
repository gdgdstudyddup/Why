class Quaternion {

    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    identity() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
    }
    normalize() {
        var temp = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
        if (temp != 0 && Math.abs(temp) > 0.00001) {
            temp = 1 / Math.sqrt(temp);

            this.x *= temp;
            this.y *= temp;
            this.z *= temp;
            this.w *= temp;
        }
        else this.identity();

    }
    conjugate(dest) {
        dest = new Quaternion(-this.x, -this.y, -this.z, this.w);
        return dest;
    }
    mutipliedQuat(quat, dest) {//this=left quat=right dest=answer
        dest = new Quaternion(this.w * quat.x + this.x * quat.w + this.y * quat.z - this.z * quat.y,
            this.w * quat.y + this.y * quat.w + this.z * quat.x - this.x * quat.z,
            this.w * quat.z + this.z * quat.w + this.x * quat.y - this.y * quat.x,
            this.w * quat.w - this.x * quat.x - this.y * quat.y - this.z * quat.z
        );
        return dest;
    }
    rotateByAxisAngles(axis, angle, dest) {
        var sq = Math.sqrt(axis.x * axis.x + axis.y * axis.y + axis.z * axis.z);
        if (!sq) { return null; }

        var a = axis.x, b = axis.y, c = axis.z;
        if (sq != 1) { sq = 1 / sq; a *= sq; b *= sq; c *= sq; }
        var s = Math.sin(angle * 0.5);
        dest = new Quaternion(a * s, b * s, c * s, Math.cos(angle * 0.5));
        // console.log("ddd", dest);
        return dest;
    }
    getAxisAng(dest)//1-3 axis 4 angles
    {
        var scale = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);


        dest = new vec4(this.x / scale, this.y / scale, this.z / scale, Math.acos(this.w) * 2.0);
        return dest;
    }
    mutVec3(vec, quat, dest) {
        if (!quat || !vec) return null;
        var p = new Quaternion();
        p.identity();
        p.x = vec.x;
        p.y = vec.y;
        p.z = vec.z;
        var q2 = quat.conjugate(q2);
        var temp = p.mutipliedQuat(q2, temp);
        //  console.log("temp",quat);
        var finalQuat = quat.mutipliedQuat(temp, finalQuat);

        dest = new vec3(finalQuat.x, finalQuat.y, finalQuat.z);
        return dest;
    }
    slerp(b, e, t, dest)//begin end time[0->1]  
    {
        // r=a(t)p+b(t)q
        //a(t)=sin(1-t)a/sina
        //b(t)=sin(t*a)/sina
        var cosa = b.x * e.x + b.y * e.y + b.z * e.z + b.w * e.w;
        if (cosa < 0)//if dot < 0  slerp will go LONG way!!
        {
            e.x = -e.x;
            e.y = -e.y;
            e.z = -e.z;
            e.w = -e.w;
            cosa = -cosa;
        }
        //and if cosa close to 1.0  means sina=0 slerp=(1-t)b+t*e
        var at, bt;
        if (cosa > 0.9995) {
            at = 1 - t;
            bt = t;
        }
        else {
            var sina = Math.sqrt(1.0 - cosa * cosa);
            var a = Math.atan2(sina, cosa);
            at = sin((1.0 - t) * a) / sina;
            bt = sin(t * a) / sina;
        }
        dest.x = b.x * at + e.x * bt;
        dest.y = b.y * at + e.y * bt;
        dest.z = b.z * at + e.z * bt;
        dest.w = b.w * at + e.w * bt;

        return dest;
    }
    fromEuler() {

    }
    getMatrix4() {

    }

}
class vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    getVec3() {

        return new vec3(this.x, this.y, this.z);
    }
    normalize() {
        var value = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

        return new vec3(this.x / value, this.y / value, this.z / value);
    }

    cross(a, b) {
        var temp = new vec3(a.y * b.z - b.y * a.z, b.x * a.z - a.x * b.z, a.x * b.y - b.x * a.y)
        return temp;
    }
    dot(a, b)//get cos
    {
        a = a.normalize();
        b = b.normalize();
        //console.log(a.x * b.x + a.y * b.y + a.z * b.z)
        var temp = a.x * b.x + a.y * b.y + a.z * b.z;
        if (temp > 1) temp = 1;
        if (temp < -1) temp = -1;
        return Math.acos(temp);
    }
}
class vec4 {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.r = x;
        this.g = y;
        this.b = z;
        this.a = w;
    }
    getVec4(vec) {
        return new vec3(vec.x, vec.y, vec.z, vec.w);
    }
    normalize() {
        var value = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        return new vec4(this.x / value, this.y / value, this.z / value, this.w / value);
    }
}
class vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;

    }
    getVec2(vec) {
        return new vec3(vec.x, vec.y);
    }
    normalize() {
        var value = Math.sqrt(this.x * this.x + this.y * this.y);
        return new vec2(this.x / value, this.y / value);
    }
}
class Transform {
    constructor() {
        this.position = new vec3(0, 0, 0);
        this.forward = new vec3(0, 0, 0);
        this.up = new vec3(0, 1, 0);
    }
    getTransform(trans) {
        return new Transform(trans.position, trans.forward, trans.up);
    }
    setPosition(pos) {
        this.position.x = pos.x;
        this.position.y = pos.y;
        this.position.z = pos.z;
    }

    setForward(fo) {
        this.forward.x = fo.x;
        this.forward.y = fo.y;
        this.forward.z = fo.z;
    }
    setUp(up) {
        this.up.x = up.x;
        this.up.y = up.y;
        this.up.z = up.z;
    }
}

class Trackball {
    constructor(scene, camera) {
        this.preP = new vec3(0, 0, 0);
        this.lastP = new vec3(0, 0, 0);

        this.go = false;
        this.delta = 0;
        this.cvs = scene.why;
        this.saveUp = null;
        this.savePosition = null;
        //this.d=0;
        this.cvs.addEventListener('mousedown', (e) => {
            this.go = true;
            var x1 = 2 * e.clientX / window.innerWidth - 1;
            var y1 = 1 - 2 * e.clientY / window.innerHeight;
            this.preP = new vec3(x1, y1, 1.0);


        }, false)
        this.cvs.addEventListener('mousemove', (e) => {
            if (!this.go) return;

            var x1 = 2 * e.clientX / this.cvs.width - 1;
            var y1 = 1 - 2 * e.clientY / this.cvs.height;
            this.lastP = new vec3(x1, y1, 1.0);
            var p1 = new vec3(1, 1, 1.0), p2 = new vec3(1, 1, 1.0);

            p2 = this.getMapCoordinates(this.lastP, p2);
            p1 = this.getMapCoordinates(this.preP, p1);
            var axis = preP.cross(p1, p2);
            axis = axis.normalize();

            //console.log(axis.x,axis.y,axis.z);

            this.delta = 2 * lastP.dot(this.preP, this.lastP);


            var q = new Quaternion();
            var quat = q.rotateByAxisAngles(axis, (-this.delta), quat);
            var pos = q.mutVec3(camera.position, quat, pos);
            var up = q.mutVec3(camera.up, quat, up);
            var judgeWithTargetUp = p1.dot(camera.up, new vec3(0, 1, 0));
            // if(this.targetUp)
            // console.log(p1.dot(camera.up, new vec3(0, 1, 0)),p1.dot(this.targetUp, new vec3(0, 1, 0)))
            //console.log(this.targetUp,this.savePosition);
            if (judgeWithTargetUp > 1.57079) {//PI/2
                // up.x-=0.01;
                // up.y-=0.01;
                // up.z-=0.01;
                // this.preP = this.lastP;
                // return;
                camera.setLookAt(this.savePosition, camera.lookat, this.targetUp);
                this.preP = this.lastP;

                return;

            }
            //this.d=judgeWithTargetUp;
            if (judgeWithTargetUp <=1.57079) {
               
            this.savePosition = camera.position;
            this.targetUp = camera.up;
        }
            camera.setLookAt(pos, camera.lookat, up);
            //console.log(camera.position.x,camera.position.y,camera.position.z);
            this.preP = this.lastP;



        }, false)
        this.cvs.addEventListener('mouseup', (e) => {
            this.go = false;
        }, false)
    }
    getMapCoordinates(v, dest) {
        if (!v) return dest;
        var distance = 1 - v.x * v.x - v.y * v.y;
        if (distance <= 1) {
            dest.x = v.x;
            dest.y = v.y;
            // dest.z=Math.sqrt(1-distance);
            dest.z = Math.sqrt(distance);
        }
        else {

            var temp = 1 / Math.sqrt(distance);
            dest.x = v.x * temp;
            dest.y = v.y * temp;
            dest.z = 0;
        }

        return dest;
    }
    over() {
        this.cvs.removEventListener('mousedown');
        this.cvs.removEventListener('mousemove');
        this.cvs.removEventListener('mouseup');
    }
}
class WHYCamera {
    constructor() {

        this.position = new vec3(0, 0, 0);
        this.up = new vec3(0, 1, 0);
        this.lookat = new vec3(0, 0, 0);
        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(this.position.x, this.position.y, this.position.z,
            this.lookat.x, this.lookat.y, this.lookat.z,
            this.up.x, this.up.y, this.up.z);
    }
    instance() {
        return this;
    }

    setLookAt(pos, targetPos, Up) {
        // console.log("200",pos,up);
        if (pos && targetPos && Up) {
            this.viewMatrix.setLookAt(pos.x, pos.y, pos.z, targetPos.x, targetPos.y, targetPos.z, Up.x, Up.y, Up.z);
            this.position = pos;
            this.up = Up;
            this.lookat = targetPos;
        }


    }
}

class WHYScene {

    constructor() {

        //test value

        // 
        this.init();
        console.log(this);
    }

    init() {
        this.why = document.createElement("CANVAS");
        this.why.width = window.innerWidth;
        this.why.height = window.innerHeight;
        document.body.appendChild(this.why);
        this.gl = this.why.getContext("webgl");
        if (!this.gl) {
            alert("browser do not support webGL");
            return;
        }
        //check webgl support
        this.camera = new WHYCamera();
        this.projectionMatrix = new Matrix4();
        this.gl.clearColor(0.8, 0.8, 0.8, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        //gl.clear(gl.DEPTH_BUFFER_BIT);
        this.setCamera();
        this.setPerspective(30, this.why.width, this.why.height, 1, 1000);
        window.onresize=function(){
            if(!this.why)return;
            this.why.width=window.innerWidth;
            this.why.height=window.innerHeight;
            }
    }
    setCamera(Pos = new vec3(0, 0, 20), targetPos = new vec3(0, 0, 0), Up = new vec3(0, 1, 0)) {
        this.camera.setLookAt(Pos, targetPos, Up);
    }
    setPerspective(fov, width, height, near, far) {
        this.projectionMatrix.setPerspective(fov, width / height, near, far);
    }
    Draw() {//mode, count, elementType, offset

    }
    useTrackballCamera() {
        this.cameraController = new Trackball(scene, scene.camera);
    }
    trackballCameraOver() {
        this.cameraController.over();
        this.cameraController = null;
    }
    drawSimpleCube() {
        var program = createProgram(this.gl, document.getElementById("vertex-shader").innerHTML, document.getElementById("fragment-shader").innerHTML);
        if (!program) {
            console.log("err  shader");
            return;
        }
        var vertices = new Float32Array([1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 front
            1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 right
            1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
            -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 left
            -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 down
            1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0]);
        var indices = new Uint8Array([0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // right
            8, 9, 10, 8, 10, 11,    // up
            12, 13, 14, 12, 14, 15,    // left
            16, 17, 18, 16, 18, 19,    // down
            20, 21, 22, 20, 22, 23]);
        var vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        var ibo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

        program.pos = this.gl.getAttribLocation(program, "a_pos");
        program.p = this.gl.getUniformLocation(program, "pro");
        program.m = this.gl.getUniformLocation(program, "model");
        program.v = this.gl.getUniformLocation(program, "view");

        this.gl.vertexAttribPointer(program.pos, 3, this.gl.FLOAT, false, 0, 0);//3个float
        this.gl.enableVertexAttribArray(program.pos);
        this.gl.useProgram(program);
        var modelMatrix = new Matrix4();
        this.gl.uniformMatrix4fv(program.m, false, modelMatrix.elements);
        this.gl.uniformMatrix4fv(program.v, false, this.camera.viewMatrix.elements);
        this.gl.uniformMatrix4fv(program.p, false, this.projectionMatrix.elements);

        this.gl.drawElements(this.gl.TRIANGLES, indices.length, this.gl.UNSIGNED_BYTE, 0);

    }
    drawSimpleCube2() {
        var program = createProgram(this.gl, document.getElementById("vertex-shader").innerHTML, document.getElementById("fragment-shader").innerHTML);
        if (!program) {
            console.log("err  shader");
            return;
        }
        var vertices = new Float32Array([1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 front
            1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 right
            1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
            -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 left
            -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 down
            1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0]);
        var indices = new Uint8Array([0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // right
            8, 9, 10, 8, 10, 11,    // up
            12, 13, 14, 12, 14, 15,    // left
            16, 17, 18, 16, 18, 19,    // down
            20, 21, 22, 20, 22, 23]);
        var vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        var ibo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

        program.pos = this.gl.getAttribLocation(program, "a_pos");
        program.p = this.gl.getUniformLocation(program, "pro");
        program.m = this.gl.getUniformLocation(program, "model");
        program.v = this.gl.getUniformLocation(program, "view");

        this.gl.vertexAttribPointer(program.pos, 3, this.gl.FLOAT, false, 0, 0);//3个float
        this.gl.enableVertexAttribArray(program.pos);
        this.gl.useProgram(program);
        var modelMatrix = new Matrix4();
        modelMatrix.translate(3, 0, 0);
        this.gl.uniformMatrix4fv(program.m, false, modelMatrix.elements);
        this.gl.uniformMatrix4fv(program.v, false, this.camera.viewMatrix.elements);
        this.gl.uniformMatrix4fv(program.p, false, this.projectionMatrix.elements);

        this.gl.drawElements(this.gl.TRIANGLES, indices.length, this.gl.UNSIGNED_BYTE, 0);

    }
}