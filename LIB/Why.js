class Quaternion {

    constructor(x=0, y=0, z=0, w=0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    normalize() {
        var temp = this.x * this.x + this.y + this.y + this.z + this.z + this.w + this.w;
        if (temp != 0 && Math.abs(temp) > 0.0001) {
            temp = 1 / Math.sqrt(temp);
            this.x *= temp;
            this.y *= temp;
            this.z *= temp;
            this.w *= temp;
        }
    }
    conjugate() {
        return new Quaternion(-this.x, -this.y, -this.z, this.w);
    }
    mutipliedQuat(quat) {
        return new Quaternion(this.w * quat.x + this.x * quat.w + this.y * quat.z - this.z * quaat.y,
            this.w * quat.y + this.y * quat.w + this.z * quat.x - this.x * quat.z,
            this.w * quat.z + this.z * quat.w + this.x * quat.y - this.y * quat.x,
            this.w * quat.w - this.x * quat.x - this.y * quat.y - this.z * quat.z
        );
    }
    

}
class vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    normalize() {
        var value = Math.sqrt(this.x * this.x + this.y * this.y + this.z + this.z);
        return new vec3(this.x / value, this.y / value, this.z / value);
    }
    mutipliedQuat(quat) {
        var p=new Quaternion(
            this.x,
            this.y,
            this.z,
            0.0
        )
        var q2=quat.conjugate();
        p=p.mutipliedQuat(q2);
        p=quat.mutipliedQuat(p);
        return new vec3(p.x,p.y,p.z);
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
    normalize() {
        var value = Math.sqrt(this.x * this.x + this.y * this.y + this.z + this.z + this.w * this.w);
        return new vec4(this.x / value, this.y / value, this.z / value, this.w / value);
    }
}
class vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;

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
class WHYCamera {
    constructor() {

        this.viewMatrix = new Matrix4();
        this.transform = new Transform();


    }
    setLookAt(pos, targetPos, up) {
        this.viewMatrix.setLookAt(pos.x, pos.y, pos.z, targetPos.x, targetPos.y, targetPos.z, up.x, up.y, up.z);
        this.transform.setPosition(new vec3(pos.x, pos.y, pos.z));
        this.transform.setForward(new vec3(targetPos.x, targetPos.y, targetPos.z));
        this.transform.setUp(new vec3(up.x, up.y, up.z));

    }
}
class WHY {

    constructor() {
        this.why = document.createElement("CANVAS");

        this.why.width = window.innerWidth;
        this.why.height = window.innerHeight;
        document.body.appendChild(this.why);
        this.gl = this.why.getContext("webgl");
        if (!this.gl) {
            alert("browser do not support webGL");
            return;
        }
        this.gl.clearColor(0.8, 0.8, 0.8, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.camera = new WHYCamera();
        this.projectionMatrix = new Matrix4();
        this.init();


        console.log(this);
    }
    init() {
        this.setCamera();
        this.setPerspective(30, this.why.width, this.why.height, 1, 100);
    }
    setCamera(Pos = new vec3(0, 0, 100), targetPos = new vec3(0, 0, 0), Up = new vec3(0, 1, 0)) {
        this.camera.setLookAt(Pos, targetPos, Up);
    }
    setPerspective(fov, width, height, near, far) {
        this.projectionMatrix.setPerspective(fov, width / height, near, far);
    }
    Draw(mode, count, elementType, offset) {
        this.gl.drawElements(mode, count, elementType, offset);
    }
}