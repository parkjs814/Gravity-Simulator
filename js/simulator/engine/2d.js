const Circle = require('../object/circle');
const {rotate, now, random, polar2cartesian, randColor, getRotationMatrix, cartesian2auto} = require('../util');
const {zeros, mag, add, sub} = require('../matrix');
const {min, PI, atan2, pow} = Math;

class Engine2D {
    constructor(config, renderer) {
        this.config = config;
        this.objs = [];
        this.animating = false;
        this.controlBoxes = [];
        this.fpsLastTime = now();
        this.fpsCount = 0;
        this.lastObjNo = 0;
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-this.config.W / 2, this.config.W / 2, -this.config.H / 2, this.config.H / 2, 1, 1000);
        this.camera.position.z = 100;

        this.mouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
    }

    toggleAnimating() {
        this.animating = !this.animating;
        document.title = `${this.config.TITLE} (${this.animating ? "Simulating" : "Paused"})`;
    }

    destroyControlBoxes() {
        for (const controlBox of this.controlBoxes) {
            controlBox.close();
        }
        this.controlBoxes = []
    }

    destroy() {
        this.renderer = null;
        this.destroyControlBoxes();
    }

    animate() {
        if (!this.renderer) return;
        this.printFps();
        if (this.animating) {
            this.calculateAll();
        }
        this.redrawAll();
        requestAnimationFrame(this.animate.bind(this));
    }

    userCreateObject(x, y) {
        const pos = [(x - this.config.W / 2) / this.camera.zoom, (y - this.config.H / 2) / this.camera.zoom];
        let maxR = this.config.RADIUS_MAX;
        for (const obj of this.objs) {
            maxR = min(maxR, (mag(sub(obj.pos, pos)) - obj.r) / 1.5)
        }
        const m = random(this.config.MASS_MIN, this.config.MASS_MAX);
        const r = random(this.config.RADIUS_MIN, maxR);
        const v = polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180));
        const color = randColor();
        const tag = `circle${++this.lastObjNo}`;
        const obj = new Circle(this.config, m, r, pos, v, color, tag, this);
        obj.showControlBox(x, y);
        this.objs.push(obj);
    }

    createObject(tag, pos, m, r, v, color) {
        const obj = new Circle(this.config, m, r, pos, v, color, tag, this);
        this.objs.push(obj);
    }

    getRotationMatrix(angles, dir = 1) {
        return getRotationMatrix(angles[0], dir);
    }

    getPivotAxis() {
        return 0;
    }

    collideElastically() {
        const dimension = this.config.DIMENSION;
        for (let i = 0; i < this.objs.length; i++) {
            const o1 = this.objs[i];
            for (let j = i + 1; j < this.objs.length; j++) {
                const o2 = this.objs[j];
                const collision = sub(o2.pos, o1.pos);
                const angles = cartesian2auto(collision);
                const d = angles.shift();

                if (d < o1.r + o2.r) {
                    const R = this.getRotationMatrix(angles);
                    const R_ = this.getRotationMatrix(angles, -1);
                    const i = this.getPivotAxis();

                    const vTemp = [rotate(o1.v, R), rotate(o2.v, R)];
                    const vFinal = [vTemp[0].slice(), vTemp[1].slice()];
                    vFinal[0][i] = ((o1.m - o2.m) * vTemp[0][i] + 2 * o2.m * vTemp[1][i]) / (o1.m + o2.m);
                    vFinal[1][i] = ((o2.m - o1.m) * vTemp[1][i] + 2 * o1.m * vTemp[0][i]) / (o1.m + o2.m);
                    o1.v = rotate(vFinal[0], R_);
                    o2.v = rotate(vFinal[1], R_);

                    const posTemp = [zeros(dimension), rotate(collision, R)];
                    posTemp[0][i] += vFinal[0][i];
                    posTemp[1][i] += vFinal[1][i];
                    o1.pos = add(o1.pos, rotate(posTemp[0], R_));
                    o2.pos = add(o1.pos, rotate(posTemp[1], R_));
                }
            }
        }
    }

    calculateAll() {
        for (const obj of this.objs) {
            obj.calculateVelocity();
        }
        this.collideElastically();
        for (const obj of this.objs) {
            obj.calculatePosition();
        }
    }

    redrawAll() {
        for (const obj of this.objs) {
            obj.draw();
        }
        this.renderer.render(this.scene, this.camera);
    }

    printFps() {
        this.fpsCount += 1;
        const currentTime = now();
        const timeDiff = currentTime - this.fpsLastTime;
        if (timeDiff > 1) {
            console.log(`${(this.fpsCount / timeDiff) | 0} fps`);
            this.fpsLastTime = currentTime;
            this.fpsCount = 0;
        }
    }

    resize() {
        this.camera.left = -this.config.W / 2;
        this.camera.right = this.config.W / 2;
        this.camera.top = -this.config.H / 2;
        this.camera.bottom = this.config.H / 2;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.config.W, this.config.H);
    }

    onMouseMove(e) {
        if (!this.mouseDown) {
            return;
        }

        var delta = atan2(e.clientY - this.config.H / 2, e.clientX - this.config.W / 2) - atan2(this.mouseY - this.config.H / 2, this.mouseX - this.config.W / 2);
        if (delta < -PI) delta += 2 * PI;
        if (delta > +PI) delta -= 2 * PI;
        this.mouseX = e.pageX;
        this.mouseY = e.pageY;
        this.camera.rotation.z += delta;
        this.camera.updateProjectionMatrix();
    }

    onMouseDown(e) {
        this.mouseDown = true;
        this.mouseX = e.pageX;
        this.mouseY = e.pageY;
    }

    onMouseUp(e) {
        this.mouseDown = false;
    }

    getCoordStep(key) {
        const currentTime = now();
        if (key == this.lastKey && currentTime - this.lastTime < 1) {
            this.combo += 1;
        } else {
            this.combo = 0;
        }
        this.lastTime = currentTime;
        this.lastKey = key;
        return this.config.CAMERA_COORD_STEP * pow(this.config.CAMERA_ACCELERATION, this.combo);
    }

    up(key) {
        this.camera.translateY(-this.getCoordStep(key));
        this.camera.updateProjectionMatrix();
    }

    down(key) {
        this.camera.translateY(+this.getCoordStep(key));
        this.camera.updateProjectionMatrix();
    }

    left(key) {
        this.camera.translateX(-this.getCoordStep(key));
        this.camera.updateProjectionMatrix();
    }

    right(key) {
        this.camera.translateX(+this.getCoordStep(key));
        this.camera.updateProjectionMatrix();
    }

    zoomIn(key) {
        this.camera.zoom += this.getCoordStep(key) / 100;
        this.camera.updateProjectionMatrix();
    }

    zoomOut(key) {
        this.camera.zoom -= this.getCoordStep(key) / 100;
        if (this.camera.zoom < 0.01)this.camera.zoom = 0.01;
        this.camera.updateProjectionMatrix();
    }
}

module.exports = Engine2D;