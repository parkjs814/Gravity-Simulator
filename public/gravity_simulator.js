/**
 * Gravity Simulator - Universal Gravity and Elastic Collision Simulator
 * @version v0.0.1
 * @author Jason Park
 * @link https://github.com/parkjs814/Gravity-Simulator
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var presets = require('./preset');
var Simulator = require('./simulator');

var simulator = new Simulator();
var selected = 1;
simulator.init(presets[selected]);

var $select = $('select');
for (var i = 0; i < presets.length; i++) {
    var preset = presets[i];
    $select.append('<option value="' + i + '"' + (i == selected ? ' selected' : '') + '>' + preset.prototype.title + '</option>');
}
$select.change(function () {
    selected = parseInt($select.find(':selected').val());
    simulator.init(presets[selected]);
});
$select.focus(function () {
    $select.blur();
});
$('#reset').click(function () {
    simulator.init(presets[selected]);
});

var $moving = null;
var px = void 0,
    py = void 0;

$('body').on('mousedown', '.control-box .title-bar', function (e) {
    px = e.pageX;
    py = e.pageY;
    $moving = $(this).parent('.control-box');
    $moving.nextUntil('.control-box.template').insertBefore($moving);
    return false;
});

$('body').mousemove(function (e) {
    if (!$moving) return;
    var x = e.pageX;
    var y = e.pageY;
    $moving.css('left', parseInt($moving.css('left')) + (x - px) + 'px');
    $moving.css('top', parseInt($moving.css('top')) + (y - py) + 'px');
    px = e.pageX;
    py = e.pageY;
});

$('body').mouseup(function (e) {
    $moving = null;
});

},{"./preset":2,"./simulator":7}],2:[function(require,module,exports){
'use strict';

var _$ = $,
    extend = _$.extend;


function EMPTY_2D(c) {
    return extend(true, c, {
        BACKGROUND: 'white',
        DIMENSION: 2,
        MAX_PATHS: 1000,
        CAMERA_COORD_STEP: 5,
        CAMERA_ANGLE_STEP: 1,
        CAMERA_ACCELERATION: 1.1,
        G: 0.1,
        MASS_MIN: 1,
        MASS_MAX: 4e4,
        RADIUS_MIN: 1,
        RADIUS_MAX: 2e2,
        VELOCITY_MAX: 10,
        DIRECTION_LENGTH: 50,
        CAMERA_DISTANCE: 100,
        INPUT_TYPE: 'range'
    });
}
EMPTY_2D.prototype.title = '2D Gravity Simulator';

function EMPTY_3D(c) {
    return extend(true, EMPTY_2D(c), {
        DIMENSION: 3,
        G: 0.001,
        MASS_MIN: 1,
        MASS_MAX: 8e6,
        RADIUS_MIN: 1,
        RADIUS_MAX: 2e2,
        VELOCITY_MAX: 10
    });
}
EMPTY_3D.prototype.title = '3D Gravity Simulator';

function MANUAL_2D(c) {
    return extend(true, EMPTY_2D(c), {
        INPUT_TYPE: 'number'
    });
}
MANUAL_2D.prototype.title = '2D Manual';

function MANUAL_3D(c) {
    return extend(true, EMPTY_3D(c), {
        INPUT_TYPE: 'number'
    });
}
MANUAL_3D.prototype.title = '3D Manual';

function ORBITING(c) {
    return extend(true, EMPTY_3D(c), {
        init: function init(engine) {
            engine.createObject('Sun', [0, 0, 0], 1000000, 100, [0, 0, 0], 'blue');
            engine.createObject('Mercury', [180, 0, 0], 1, 20, [0, 2.4, 0], 'red');
            engine.createObject('Venus', [240, 0, 0], 1, 20, [0, 2.1, 0], 'yellow');
            engine.createObject('Earth', [300, 0, 0], 1, 20, [0, 1.9, 0], 'green');
            engine.toggleAnimating();
        }
    });
}
ORBITING.prototype.title = 'Orbiting';

function COLLISION(c) {
    return extend(true, EMPTY_3D(c), {
        init: function init(engine) {
            engine.createObject('Ball A', [-100, 0, 0], 100000, 50, [.5, .5, 0], 'blue');
            engine.createObject('Ball B', [100, 0, 0], 100000, 50, [-.5, -.5, 0], 'red');
            engine.createObject('Ball C', [0, 100, 0], 100000, 50, [0, 0, 0], 'green');
            engine.toggleAnimating();
        }
    });
}
COLLISION.prototype.title = 'Elastic Collision';

module.exports = [EMPTY_2D, EMPTY_3D, MANUAL_2D, MANUAL_3D, ORBITING, COLLISION];

},{}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ControlBox = function () {
    function ControlBox(object, title, controllers, x, y) {
        _classCallCheck(this, ControlBox);

        var $templateControlBox = $('.control-box.template');
        var $controlBox = $templateControlBox.clone();
        $controlBox.removeClass('template');
        $controlBox.find('.title').text(title);
        var $inputContainer = $controlBox.find('.input-container');
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = controllers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var controller = _step.value;

                $inputContainer.append(controller.$inputWrapper);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        $controlBox.find('.close').click(function () {
            $controlBox.remove();
        });
        $controlBox.find('.remove').click(function () {
            object.destroy();
        });
        $controlBox.insertBefore($templateControlBox);
        $controlBox.css('left', x + 'px');
        $controlBox.css('top', y + 'px');

        this.$controlBox = $controlBox;
    }

    _createClass(ControlBox, [{
        key: 'close',
        value: function close() {
            this.$controlBox.remove();
        }
    }, {
        key: 'isOpen',
        value: function isOpen() {
            return this.$controlBox[0].parentNode;
        }
    }]);

    return ControlBox;
}();

module.exports = ControlBox;

},{}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Controller = function () {
    function Controller(object, name, min, max, value, func) {
        var _this = this;

        _classCallCheck(this, Controller);

        var $inputWrapper = this.$inputWrapper = $('.control-box.template .input-wrapper.template').clone();
        $inputWrapper.removeClass('template');
        $inputWrapper.find('.name').text(name);
        var $input = this.$input = $inputWrapper.find('input');
        $input.attr('type', object.config.INPUT_TYPE);
        $input.attr('min', min);
        $input.attr('max', max);
        $input.attr('value', value);
        $input.attr('step', 0.01);
        var $value = $inputWrapper.find('.value');
        $value.text(this.get());
        $input.on('input', function (e) {
            $value.text(_this.get());
            func.call(object, e);
        });
    }

    _createClass(Controller, [{
        key: 'get',
        value: function get() {
            return parseFloat(this.$input.val());
        }
    }]);

    return Controller;
}();

module.exports = Controller;

},{}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Circle = require('../object/circle');

var _require = require('../util'),
    rotate = _require.rotate,
    now = _require.now,
    random = _require.random,
    polar2cartesian = _require.polar2cartesian,
    randColor = _require.randColor,
    _getRotationMatrix = _require.getRotationMatrix,
    cartesian2auto = _require.cartesian2auto;

var _require2 = require('../matrix'),
    zeros = _require2.zeros,
    mag = _require2.mag,
    add = _require2.add,
    sub = _require2.sub;

var min = Math.min,
    PI = Math.PI,
    atan2 = Math.atan2,
    pow = Math.pow;

var Engine2D = function () {
    function Engine2D(config, renderer) {
        _classCallCheck(this, Engine2D);

        this.config = config;
        this.objs = [];
        this.animating = false;
        this.controlBoxes = [];
        this.fpsLastTime = now();
        this.fpsCount = 0;
        this.lastObjNo = 0;
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, config.W / config.H, 0.1, 1e5);
        this.camera.position.z = 500;
        this.camera.lookAt(this.scene.position);

        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        this.scene.add(hemiLight);

        var dirLight = new THREE.DirectionalLight(0xffffff, 0.2);
        dirLight.position.set(-1, 1, 1);
        dirLight.position.multiplyScalar(50);
        this.scene.add(dirLight);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.15;
        this.controls.enableRotate = false;
    }

    _createClass(Engine2D, [{
        key: 'toggleAnimating',
        value: function toggleAnimating() {
            this.animating = !this.animating;
            document.title = this.config.TITLE + ' (' + (this.animating ? "Simulating" : "Paused") + ')';
        }
    }, {
        key: 'destroyControlBoxes',
        value: function destroyControlBoxes() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.controlBoxes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var controlBox = _step.value;

                    controlBox.close();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this.controlBoxes = [];
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.renderer = null;
            this.destroyControlBoxes();
        }
    }, {
        key: 'animate',
        value: function animate() {
            if (!this.renderer) return;
            this.printFps();
            if (this.animating) {
                this.calculateAll();
            }
            this.redrawAll();
            requestAnimationFrame(this.animate.bind(this));
        }
    }, {
        key: 'userCreateObject',
        value: function userCreateObject(x, y) {
            var vector = new THREE.Vector3();
            vector.set(x / this.config.W * 2 - 1, -(y / this.config.H) * 2 + 1, 0.5);
            vector.unproject(this.camera);
            var dir = vector.sub(this.camera.position).normalize();
            var distance = -this.camera.position.z / dir.z;
            var position = this.camera.position.clone().add(dir.multiplyScalar(distance));
            var pos = [position.x, position.y];

            var maxR = this.config.RADIUS_MAX;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.objs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _obj = _step2.value;

                    maxR = min(maxR, (mag(sub(_obj.pos, pos)) - _obj.r) / 1.5);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            var m = random(this.config.MASS_MIN, this.config.MASS_MAX);
            var r = random(this.config.RADIUS_MIN, maxR);
            var v = polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180));
            var color = randColor();
            var tag = 'circle' + ++this.lastObjNo;
            var obj = new Circle(this.config, m, r, pos, v, color, tag, this);
            obj.showControlBox(x, y);
            this.objs.push(obj);
        }
    }, {
        key: 'createObject',
        value: function createObject(tag, pos, m, r, v, color) {
            var obj = new Circle(this.config, m, r, pos, v, color, tag, this);
            this.objs.push(obj);
        }
    }, {
        key: 'getRotationMatrix',
        value: function getRotationMatrix(angles) {
            var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return _getRotationMatrix(angles[0], dir);
        }
    }, {
        key: 'getPivotAxis',
        value: function getPivotAxis() {
            return 0;
        }
    }, {
        key: 'collideElastically',
        value: function collideElastically() {
            var dimension = this.config.DIMENSION;
            for (var i = 0; i < this.objs.length; i++) {
                var o1 = this.objs[i];
                for (var j = i + 1; j < this.objs.length; j++) {
                    var o2 = this.objs[j];
                    var collision = sub(o2.pos, o1.pos);
                    var angles = cartesian2auto(collision);
                    var d = angles.shift();

                    if (d < o1.r + o2.r) {
                        var R = this.getRotationMatrix(angles);
                        var R_ = this.getRotationMatrix(angles, -1);
                        var _i = this.getPivotAxis();

                        var vTemp = [rotate(o1.v, R), rotate(o2.v, R)];
                        var vFinal = [vTemp[0].slice(), vTemp[1].slice()];
                        vFinal[0][_i] = ((o1.m - o2.m) * vTemp[0][_i] + 2 * o2.m * vTemp[1][_i]) / (o1.m + o2.m);
                        vFinal[1][_i] = ((o2.m - o1.m) * vTemp[1][_i] + 2 * o1.m * vTemp[0][_i]) / (o1.m + o2.m);
                        o1.v = rotate(vFinal[0], R_);
                        o2.v = rotate(vFinal[1], R_);

                        var posTemp = [zeros(dimension), rotate(collision, R)];
                        posTemp[0][_i] += vFinal[0][_i];
                        posTemp[1][_i] += vFinal[1][_i];
                        o1.pos = add(o1.pos, rotate(posTemp[0], R_));
                        o2.pos = add(o1.pos, rotate(posTemp[1], R_));
                    }
                }
            }
        }
    }, {
        key: 'calculateAll',
        value: function calculateAll() {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.objs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var obj = _step3.value;

                    obj.calculateVelocity();
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            this.collideElastically();
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.objs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _obj2 = _step4.value;

                    _obj2.calculatePosition();
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }
        }
    }, {
        key: 'redrawAll',
        value: function redrawAll() {
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.objs[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var obj = _step5.value;

                    obj.draw();
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        }
    }, {
        key: 'printFps',
        value: function printFps() {
            this.fpsCount += 1;
            var currentTime = now();
            var timeDiff = currentTime - this.fpsLastTime;
            if (timeDiff > 1) {
                console.log((this.fpsCount / timeDiff | 0) + ' fps');
                this.fpsLastTime = currentTime;
                this.fpsCount = 0;
            }
        }
    }, {
        key: 'resize',
        value: function resize() {
            this.camera.aspect = this.config.W / this.config.H;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.config.W, this.config.H);
        }
    }, {
        key: 'onMouseMove',
        value: function onMouseMove(e) {
            if (!this.mouseDown) {
                return;
            }

            var delta = atan2(e.pageY - this.config.H / 2, e.pageX - this.config.W / 2) - atan2(this.mouseY - this.config.H / 2, this.mouseX - this.config.W / 2);
            if (delta < -PI) delta += 2 * PI;
            if (delta > +PI) delta -= 2 * PI;
            this.mouseX = e.pageX;
            this.mouseY = e.pageY;
            this.camera.rotation.z += delta;
            this.camera.updateProjectionMatrix();
        }
    }, {
        key: 'getCoordStep',
        value: function getCoordStep(key) {
            var currentTime = now();
            if (key == this.lastKey && currentTime - this.lastTime < 1) {
                this.combo += 1;
            } else {
                this.combo = 0;
            }
            this.lastTime = currentTime;
            this.lastKey = key;
            return this.config.CAMERA_COORD_STEP * pow(this.config.CAMERA_ACCELERATION, this.combo);
        }
    }]);

    return Engine2D;
}();

module.exports = Engine2D;

},{"../matrix":8,"../object/circle":9,"../util":11}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Engine2D = require('./2d');
var Sphere = require('../object/sphere');

var _require = require('../util'),
    random = _require.random,
    getYRotationMatrix = _require.getYRotationMatrix,
    getZRotationMatrix = _require.getZRotationMatrix,
    randColor = _require.randColor,
    spherical2cartesian = _require.spherical2cartesian,
    skipInvisibleError = _require.skipInvisibleError;

var _require2 = require('../matrix'),
    mag = _require2.mag,
    sub = _require2.sub,
    dot = _require2.dot;

var min = Math.min;

var Engine3D = function (_Engine2D) {
    _inherits(Engine3D, _Engine2D);

    function Engine3D(config, renderer) {
        _classCallCheck(this, Engine3D);

        var _this = _possibleConstructorReturn(this, (Engine3D.__proto__ || Object.getPrototypeOf(Engine3D)).call(this, config, renderer));

        _this.controls.enableRotate = true;
        return _this;
    }

    _createClass(Engine3D, [{
        key: 'userCreateObject',
        value: function userCreateObject(x, y) {
            var vector = new THREE.Vector3();
            vector.set(x / this.config.W * 2 - 1, -(y / this.config.H) * 2 + 1, 0.5);
            vector.unproject(this.camera);
            var dir = vector.sub(this.camera.position).normalize();
            var distance = this.config.RADIUS_MAX * 3 - this.camera.position.z / dir.z;
            var p = this.camera.position.clone().add(dir.multiplyScalar(distance));
            var pos = [p.x, p.y, p.z];

            var maxR = this.config.RADIUS_MAX;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _obj = _step.value;

                    maxR = min(maxR, (mag(sub(_obj.pos, pos)) - _obj.r) / 1.5);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            var m = random(this.config.MASS_MIN, this.config.MASS_MAX);
            var r = random(this.config.RADIUS_MIN, maxR);
            var v = spherical2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180), random(-180, 180));
            var color = randColor();
            var tag = 'sphere' + ++this.lastObjNo;
            var obj = new Sphere(this.config, m, r, pos, v, color, tag, this);
            obj.showControlBox(x, y);
            this.objs.push(obj);
        }
    }, {
        key: 'createObject',
        value: function createObject(tag, pos, m, r, v, color) {
            var obj = new Sphere(this.config, m, r, pos, v, color, tag, this);
            this.objs.push(obj);
        }
    }, {
        key: 'getRotationMatrix',
        value: function getRotationMatrix(angles) {
            var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return dot(getZRotationMatrix(angles[0], dir), getYRotationMatrix(angles[1], dir), dir);
        }
    }, {
        key: 'getPivotAxis',
        value: function getPivotAxis() {
            return 2;
        }
    }, {
        key: 'onMouseMove',
        value: function onMouseMove(e) {}
    }, {
        key: 'onMouseDown',
        value: function onMouseDown(e) {}
    }, {
        key: 'onMouseUp',
        value: function onMouseUp(e) {}
    }, {
        key: 'updatePosition',
        value: function updatePosition() {
            _get(Engine3D.prototype.__proto__ || Object.getPrototypeOf(Engine3D.prototype), 'updatePosition', this).call(this);
        }
    }]);

    return Engine3D;
}(Engine2D);

module.exports = Engine3D;

},{"../matrix":8,"../object/sphere":10,"../util":11,"./2d":5}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Engine2D = require('./engine/2d');
var Engine3D = require('./engine/3d');

var _require = require('./util'),
    getDistance = _require.getDistance;

var config = null;
var $rendererWrapper = $('.renderer-wrapper');

function onResize(e, engine) {
    config.W = $rendererWrapper.width();
    config.H = $rendererWrapper.height();
    if (engine) engine.resize();
}

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
function onClick(e, engine) {
    var x = e.pageX;
    var y = e.pageY;
    if (!engine.animating) {
        mouse.x = x / config.W * 2 - 1;
        mouse.y = -(y / config.H) * 2 + 1;
        raycaster.setFromCamera(mouse, engine.camera);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = engine.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var obj = _step.value;

                var intersects = raycaster.intersectObject(obj.object);
                if (intersects.length > 0) {
                    obj.showControlBox(x, y);
                    return true;
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        engine.userCreateObject(x, y);
    }
}

function onKeyDown(e, engine) {
    var keyCode = e.keyCode;

    if (keyCode == 32) {
        // space bar
        engine.destroyControlBoxes();
        engine.toggleAnimating();
    }
}

var Simulator = function () {
    function Simulator() {
        var _this = this;

        _classCallCheck(this, Simulator);

        this.renderer = new THREE.WebGLRenderer();
        $rendererWrapper.append(this.renderer.domElement);
        $(window).resize(function (e) {
            onResize(e, _this.engine);
        });
        $(this.renderer.domElement).dblclick(function (e) {
            onClick(e, _this.engine);
        });
        $('body').keydown(function (e) {
            onKeyDown(e, _this.engine);
        });
    }

    _createClass(Simulator, [{
        key: 'init',
        value: function init(preset) {
            if (this.engine) this.engine.destroy();
            config = preset({});
            document.title = config.TITLE = preset.prototype.title;
            this.engine = new (config.DIMENSION == 2 ? Engine2D : Engine3D)(config, this.renderer);
            onResize(null, this.engine);
            if ('init' in config) config.init(this.engine);
            this.engine.animate();
        }
    }]);

    return Simulator;
}();

module.exports = Simulator;

},{"./engine/2d":5,"./engine/3d":6,"./util":11}],8:[function(require,module,exports){
"use strict";

function iter(a, func) {
    var a_r = a.length;
    var m = new Array(a_r);
    for (var i = 0; i < a_r; i++) {
        m[i] = func(i);
    }
    return m;
}

module.exports = {
    zeros: function zeros(N) {
        return new Array(N).fill(0);
    },

    mag: function mag(a) {
        var a_r = a.length;
        var sum = 0;
        for (var i = 0; i < a_r; i++) {
            sum += a[i] * a[i];
        }
        return Math.sqrt(sum);
    },

    add: function add(a, b) {
        return iter(a, function (i) {
            return a[i] + b[i];
        });
    },

    sub: function sub(a, b) {
        return iter(a, function (i) {
            return a[i] - b[i];
        });
    },

    mul: function mul(a, b) {
        return iter(a, function (i) {
            return a[i] * b;
        });
    },

    div: function div(a, b) {
        return iter(a, function (i) {
            return a[i] / b;
        });
    },

    dot: function dot(a, b) {
        var dir = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

        if (dir == -1) {
            var _ref = [b, a];
            a = _ref[0];
            b = _ref[1];
        }
        var a_r = a.length;
        var a_c = a[0].length;
        var b_c = b[0].length;
        var m = new Array(a_r);
        for (var r = 0; r < a_r; r++) {
            m[r] = new Array(b_c);
            for (var c = 0; c < b_c; c++) {
                m[r][c] = 0;
                for (var i = 0; i < a_c; i++) {
                    m[r][c] += a[r][i] * b[i][c];
                }
            }
        }
        return m;
    }
};

},{}],9:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ControlBox = require('../control/control_box');
var Controller = require('../control/controller');

var _require = require('../util'),
    rad2deg = _require.rad2deg,
    deg2rad = _require.deg2rad,
    polar2cartesian = _require.polar2cartesian,
    cartesian2auto = _require.cartesian2auto,
    square = _require.square;

var _require2 = require('../matrix'),
    zeros = _require2.zeros,
    mag = _require2.mag,
    add = _require2.add,
    sub = _require2.sub,
    mul = _require2.mul,
    div = _require2.div;

var max = Math.max;

var Circle = function () {
    /**
     * Polar coordinate system
     * https://en.wikipedia.org/wiki/Polar_coordinate_system
     */

    function Circle(config, m, r, pos, v, color, tag, engine) {
        _classCallCheck(this, Circle);

        this.config = config;
        this.m = m;
        this.r = r;
        this.pos = pos;
        this.prevPos = pos.slice();
        this.v = v;
        this.color = color;
        this.tag = tag;
        this.engine = engine;
        this.object = this.createObject();
        this.controlBox = null;
        this.path = null;
        this.pathVertices = [];
        this.pathMaterial = new THREE.LineBasicMaterial({
            color: 0x888888
        });
        this.direction = null;
        this.directionMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff
        });
    }

    _createClass(Circle, [{
        key: 'getGeometry',
        value: function getGeometry() {
            return new THREE.CircleGeometry(this.r, 32);
        }
    }, {
        key: 'createObject',
        value: function createObject() {
            if (this.object) this.engine.scene.remove(this.object);
            var geometry = this.getGeometry();
            var material = new THREE.MeshStandardMaterial({ color: this.color });
            var object = new THREE.Mesh(geometry, material);
            object.matrixAutoUpdate = false;
            this.engine.scene.add(object);
            return object;
        }
    }, {
        key: 'calculateVelocity',
        value: function calculateVelocity() {
            var F = zeros(this.config.DIMENSION);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.engine.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var obj = _step.value;

                    if (obj == this) continue;
                    var vector = sub(this.pos, obj.pos);
                    var magnitude = mag(vector);
                    var unitVector = div(vector, magnitude);
                    F = add(F, mul(unitVector, obj.m / square(magnitude)));
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            F = mul(F, -this.config.G * this.m);
            var a = div(F, this.m);
            this.v = add(this.v, a);
        }
    }, {
        key: 'calculatePosition',
        value: function calculatePosition() {
            this.pos = add(this.pos, this.v);
            if (mag(sub(this.pos, this.prevPos)) > 1) {
                this.prevPos = this.pos.slice();
                this.pathVertices.push(new THREE.Vector3(this.pos[0], this.pos[1], this.pos[2]));
            }
        }
    }, {
        key: 'draw',
        value: function draw() {
            this.object.position.x = this.pos[0];
            this.object.position.y = this.pos[1];
            this.object.updateMatrix();

            if (this.path) this.engine.scene.remove(this.path);
            var pathGeometry = new THREE.Geometry();
            pathGeometry.vertices = this.pathVertices;
            this.path = new THREE.Line(pathGeometry, this.pathMaterial);
            this.engine.scene.add(this.path);

            if (this.direction) this.engine.scene.remove(this.direction);
            var directionGeometry = new THREE.Geometry();
            if (mag(this.v) == 0) {
                this.direction = null;
            } else {
                var nextPos = add(this.pos, mul(this.v, this.r / mag(this.v) + 20));
                directionGeometry.vertices = [new THREE.Vector3(this.pos[0], this.pos[1], this.pos[2]), new THREE.Vector3(nextPos[0], nextPos[1], nextPos[2])];
                this.direction = new THREE.Line(directionGeometry, this.directionMaterial);
                this.engine.scene.add(this.direction);
            }
        }
    }, {
        key: 'controlM',
        value: function controlM(e) {
            var m = this.mController.get();
            this.m = m;
            this.object = this.createObject();
        }
    }, {
        key: 'controlR',
        value: function controlR(e) {
            var r = this.rController.get();
            this.r = r;
            this.object = this.createObject();
        }
    }, {
        key: 'controlPos',
        value: function controlPos(e) {
            var x = this.posXController.get();
            var y = this.posYController.get();
            this.pos = [x, y];
        }
    }, {
        key: 'controlV',
        value: function controlV(e) {
            var rho = this.vRhoController.get();
            var phi = deg2rad(this.vPhiController.get());
            this.v = polar2cartesian(rho, phi);
        }
    }, {
        key: 'showControlBox',
        value: function showControlBox(x, y) {
            if (this.controlBox && this.controlBox.isOpen()) {
                var $controlBox = this.controlBox.$controlBox;
                $controlBox.css('left', x + 'px');
                $controlBox.css('top', y + 'px');
                $controlBox.nextUntil('.control-box.template').insertBefore($controlBox);
            } else {
                var margin = 1.5;

                var posRange = max(max(this.config.W, this.config.H) / 2, max.apply(null, this.pos.map(Math.abs)) * margin);
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.engine.objs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var obj = _step2.value;

                        posRange = max(posRange, max.apply(null, obj.pos.map(Math.abs)) * margin);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                var v = cartesian2auto(this.v);
                var vRange = max(this.config.VELOCITY_MAX, mag(this.v) * margin);
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this.engine.objs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _obj = _step3.value;

                        vRange = max(vRange, mag(_obj.v) * margin);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                this.setup_controllers(posRange, this.m, this.r, v, vRange);
                this.controlBox = new ControlBox(this, this.tag, this.getControllers(), x, y);
                this.engine.controlBoxes.push(this.controlBox);
            }
        }
    }, {
        key: 'setup_controllers',
        value: function setup_controllers(posRange, m, r, v, vRange) {
            this.mController = new Controller(this, "Mass m", this.config.MASS_MIN, this.config.MASS_MAX, m, this.controlM);
            this.rController = new Controller(this, "Radius r", this.config.RADIUS_MIN, this.config.RADIUS_MAX, r, this.controlR);
            this.posXController = new Controller(this, "Position x", -posRange, posRange, this.pos[0], this.controlPos);
            this.posYController = new Controller(this, "Position y", -posRange, posRange, this.pos[1], this.controlPos);
            this.vRhoController = new Controller(this, "Velocity ρ", 0, vRange, v[0], this.controlV);
            this.vPhiController = new Controller(this, "Velocity φ", -180, 180, rad2deg(v[1]), this.controlV);
        }
    }, {
        key: 'getControllers',
        value: function getControllers() {
            return [this.mController, this.rController, this.posXController, this.posYController, this.vRhoController, this.vPhiController];
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            if (this.object) this.engine.scene.remove(this.object);
            if (this.path) this.engine.scene.remove(this.path);
            var i = this.engine.objs.indexOf(this);
            this.engine.objs.splice(i, 1);
            if (this.controlBox && this.controlBox.isOpen()) {
                this.controlBox.close();
            }
        }
    }, {
        key: 'toString',
        value: function toString() {
            return JSON.stringify({ 'tag': this.tag, 'v': this.v, 'pos': this.pos });
        }
    }]);

    return Circle;
}();

module.exports = Circle;

},{"../control/control_box":3,"../control/controller":4,"../matrix":8,"../util":11}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Circle = require('./circle');
var Controller = require('../control/controller');

var _require = require('../util'),
    rad2deg = _require.rad2deg,
    deg2rad = _require.deg2rad,
    spherical2cartesian = _require.spherical2cartesian;

var Sphere = function (_Circle) {
    _inherits(Sphere, _Circle);

    function Sphere() {
        _classCallCheck(this, Sphere);

        return _possibleConstructorReturn(this, (Sphere.__proto__ || Object.getPrototypeOf(Sphere)).apply(this, arguments));
    }

    _createClass(Sphere, [{
        key: 'getGeometry',

        /**
         * Spherical coordinate system
         * https://en.wikipedia.org/wiki/Spherical_coordinate_system
         */

        value: function getGeometry() {
            return new THREE.SphereGeometry(this.r, 32, 32);
        }
    }, {
        key: 'draw',
        value: function draw() {
            this.object.position.z = this.pos[2];
            _get(Sphere.prototype.__proto__ || Object.getPrototypeOf(Sphere.prototype), 'draw', this).call(this);
        }
    }, {
        key: 'controlPos',
        value: function controlPos(e) {
            var x = this.posXController.get();
            var y = this.posYController.get();
            var z = this.posZController.get();
            this.pos = [x, y, z];
        }
    }, {
        key: 'controlV',
        value: function controlV(e) {
            var phi = deg2rad(this.vPhiController.get());
            var theta = deg2rad(this.vThetaController.get());
            var rho = this.vRhoController.get();
            this.v = spherical2cartesian(rho, phi, theta);
        }
    }, {
        key: 'setup_controllers',
        value: function setup_controllers(pos_range, m, r, v, v_range) {
            _get(Sphere.prototype.__proto__ || Object.getPrototypeOf(Sphere.prototype), 'setup_controllers', this).call(this, pos_range, m, r, v, v_range);
            this.posZController = new Controller(this, "Position z", -pos_range, pos_range, this.pos[2], this.controlPos);
            this.vThetaController = new Controller(this, "Velocity θ", -180, 180, rad2deg(v[2]), this.controlV);
        }
    }, {
        key: 'getControllers',
        value: function getControllers() {
            return [this.mController, this.rController, this.posXController, this.posYController, this.posZController, this.vRhoController, this.vPhiController, this.vThetaController];
        }
    }]);

    return Sphere;
}(Circle);

module.exports = Sphere;

},{"../control/controller":4,"../util":11,"./circle":9}],11:[function(require,module,exports){
'use strict';

var _require = require('./matrix'),
    mag = _require.mag,
    dot = _require.dot;

var Util = {
    square: function square(x) {
        return x * x;
    },

    cube: function cube(x) {
        return x * x * x;
    },

    polar2cartesian: function polar2cartesian(rho, phi) {
        return [rho * Math.cos(phi), rho * Math.sin(phi)];
    },

    cartesian2polar: function cartesian2polar(x, y) {
        return [mag([x, y]), Math.atan2(y, x)];
    },

    spherical2cartesian: function spherical2cartesian(rho, phi, theta) {
        return [rho * Math.sin(theta) * Math.cos(phi), rho * Math.sin(theta) * Math.sin(phi), rho * Math.cos(theta)];
    },

    cartesian2spherical: function cartesian2spherical(x, y, z) {
        var rho = mag([x, y, z]);
        return [rho, Math.atan2(y, x), rho != 0 ? Math.acos(z / rho) : 0];
    },

    cartesian2auto: function cartesian2auto(vector) {
        return vector.length == 2 ? Util.cartesian2polar(vector[0], vector[1]) : Util.cartesian2spherical(vector[0], vector[1], vector[2]);
    },

    rad2deg: function rad2deg(rad) {
        return rad / Math.PI * 180;
    },

    deg2rad: function deg2rad(deg) {
        return deg / 180 * Math.PI;
    },

    getDistance: function getDistance(x0, y0, x1, y1) {
        return mag([x1 - x0, y1 - y0]);
    },

    rotate: function rotate(vector, matrix) {
        return dot([vector], matrix)[0];
    },

    now: function now() {
        return new Date().getTime() / 1000;
    },

    random: function random(min) {
        var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        if (max == null) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    },

    randColor: function randColor() {
        return Math.random() * 0xffffff;
    },

    getRotationMatrix: function getRotationMatrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return [[cos, -sin], [sin, cos]];
    },

    getXRotationMatrix: function getXRotationMatrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return [[1, 0, 0], [0, cos, -sin], [0, sin, cos]];
    },

    getYRotationMatrix: function getYRotationMatrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return [[cos, 0, sin], [0, 1, 0], [-sin, 0, cos]];
    },

    getZRotationMatrix: function getZRotationMatrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return [[cos, -sin, 0], [sin, cos, 0], [0, 0, 1]];
    }
};

module.exports = Util;

},{"./matrix":8}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jb250cm9sL2NvbnRyb2xfYm94LmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbGxlci5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvMmQuanMiLCJqcy9zaW11bGF0b3IvZW5naW5lLzNkLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxVQUFVLFFBQVEsVUFBUixDQUFoQjtBQUNBLElBQU0sWUFBWSxRQUFRLGFBQVIsQ0FBbEI7O0FBRUEsSUFBTSxZQUFZLElBQUksU0FBSixFQUFsQjtBQUNBLElBQUksV0FBVyxDQUFmO0FBQ0EsVUFBVSxJQUFWLENBQWUsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxVQUFVLEVBQUUsUUFBRixDQUFoQjtBQUNBLEtBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3JDLFFBQU0sU0FBUyxRQUFRLENBQVIsQ0FBZjtBQUNBLFlBQVEsTUFBUixxQkFBaUMsQ0FBakMsVUFBc0MsS0FBSyxRQUFMLEdBQWdCLFdBQWhCLEdBQThCLEVBQXBFLFVBQTBFLE9BQU8sU0FBUCxDQUFpQixLQUEzRjtBQUNIO0FBQ0QsUUFBUSxNQUFSLENBQWUsWUFBTTtBQUNqQixlQUFXLFNBQVMsUUFBUSxJQUFSLENBQWEsV0FBYixFQUEwQixHQUExQixFQUFULENBQVg7QUFDQSxjQUFVLElBQVYsQ0FBZSxRQUFRLFFBQVIsQ0FBZjtBQUNILENBSEQ7QUFJ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R0FBaUIsSUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3QgcHJlc2V0cyA9IHJlcXVpcmUoJy4vcHJlc2V0Jyk7XG5jb25zdCBTaW11bGF0b3IgPSByZXF1aXJlKCcuL3NpbXVsYXRvcicpO1xuXG5jb25zdCBzaW11bGF0b3IgPSBuZXcgU2ltdWxhdG9yKCk7XG5sZXQgc2VsZWN0ZWQgPSAxO1xuc2ltdWxhdG9yLmluaXQocHJlc2V0c1tzZWxlY3RlZF0pO1xuXG5jb25zdCAkc2VsZWN0ID0gJCgnc2VsZWN0Jyk7XG5mb3IgKGxldCBpID0gMDsgaSA8IHByZXNldHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBwcmVzZXQgPSBwcmVzZXRzW2ldO1xuICAgICRzZWxlY3QuYXBwZW5kKGA8b3B0aW9uIHZhbHVlPVwiJHtpfVwiJHtpID09IHNlbGVjdGVkID8gJyBzZWxlY3RlZCcgOiAnJ30+JHtwcmVzZXQucHJvdG90eXBlLnRpdGxlfTwvb3B0aW9uPmApO1xufVxuJHNlbGVjdC5jaGFuZ2UoKCkgPT4ge1xuICAgIHNlbGVjdGVkID0gcGFyc2VJbnQoJHNlbGVjdC5maW5kKCc6c2VsZWN0ZWQnKS52YWwoKSk7XG4gICAgc2ltdWxhdG9yLmluaXQocHJlc2V0c1tzZWxlY3RlZF0pO1xufSk7XG4kc2VsZWN0LmZvY3VzKCgpID0+IHtcbiAgICAkc2VsZWN0LmJsdXIoKTtcbn0pO1xuJCgnI3Jlc2V0JykuY2xpY2soKCkgPT4ge1xuICAgIHNpbXVsYXRvci5pbml0KHByZXNldHNbc2VsZWN0ZWRdKTtcbn0pO1xuXG5cbmxldCAkbW92aW5nID0gbnVsbDtcbmxldCBweCwgcHk7XG5cbiQoJ2JvZHknKS5vbignbW91c2Vkb3duJywgJy5jb250cm9sLWJveCAudGl0bGUtYmFyJywgZnVuY3Rpb24gKGUpIHtcbiAgICBweCA9IGUucGFnZVg7XG4gICAgcHkgPSBlLnBhZ2VZO1xuICAgICRtb3ZpbmcgPSAkKHRoaXMpLnBhcmVudCgnLmNvbnRyb2wtYm94Jyk7XG4gICAgJG1vdmluZy5uZXh0VW50aWwoJy5jb250cm9sLWJveC50ZW1wbGF0ZScpLmluc2VydEJlZm9yZSgkbW92aW5nKTtcbiAgICByZXR1cm4gZmFsc2U7XG59KTtcblxuJCgnYm9keScpLm1vdXNlbW92ZShmdW5jdGlvbiAoZSkge1xuICAgIGlmICghJG1vdmluZykgcmV0dXJuO1xuICAgIGNvbnN0IHggPSBlLnBhZ2VYO1xuICAgIGNvbnN0IHkgPSBlLnBhZ2VZO1xuICAgICRtb3ZpbmcuY3NzKCdsZWZ0JywgcGFyc2VJbnQoJG1vdmluZy5jc3MoJ2xlZnQnKSkgKyAoeCAtIHB4KSArICdweCcpO1xuICAgICRtb3ZpbmcuY3NzKCd0b3AnLCBwYXJzZUludCgkbW92aW5nLmNzcygndG9wJykpICsgKHkgLSBweSkgKyAncHgnKTtcbiAgICBweCA9IGUucGFnZVg7XG4gICAgcHkgPSBlLnBhZ2VZO1xufSk7XG5cbiQoJ2JvZHknKS5tb3VzZXVwKGZ1bmN0aW9uIChlKSB7XG4gICAgJG1vdmluZyA9IG51bGw7XG59KTsiLCJjb25zdCB7ZXh0ZW5kfSA9ICQ7XG5cblxuZnVuY3Rpb24gRU1QVFlfMkQoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgYywge1xuICAgICAgICBCQUNLR1JPVU5EOiAnd2hpdGUnLFxuICAgICAgICBESU1FTlNJT046IDIsXG4gICAgICAgIE1BWF9QQVRIUzogMTAwMCxcbiAgICAgICAgQ0FNRVJBX0NPT1JEX1NURVA6IDUsXG4gICAgICAgIENBTUVSQV9BTkdMRV9TVEVQOiAxLFxuICAgICAgICBDQU1FUkFfQUNDRUxFUkFUSU9OOiAxLjEsXG4gICAgICAgIEc6IDAuMSxcbiAgICAgICAgTUFTU19NSU46IDEsXG4gICAgICAgIE1BU1NfTUFYOiA0ZTQsXG4gICAgICAgIFJBRElVU19NSU46IDEsXG4gICAgICAgIFJBRElVU19NQVg6IDJlMixcbiAgICAgICAgVkVMT0NJVFlfTUFYOiAxMCxcbiAgICAgICAgRElSRUNUSU9OX0xFTkdUSDogNTAsXG4gICAgICAgIENBTUVSQV9ESVNUQU5DRTogMTAwLFxuICAgICAgICBJTlBVVF9UWVBFOiAncmFuZ2UnXG4gICAgfSk7XG59XG5FTVBUWV8yRC5wcm90b3R5cGUudGl0bGUgPSAnMkQgR3Jhdml0eSBTaW11bGF0b3InO1xuXG5cbmZ1bmN0aW9uIEVNUFRZXzNEKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzJEKGMpLCB7XG4gICAgICAgIERJTUVOU0lPTjogMyxcbiAgICAgICAgRzogMC4wMDEsXG4gICAgICAgIE1BU1NfTUlOOiAxLFxuICAgICAgICBNQVNTX01BWDogOGU2LFxuICAgICAgICBSQURJVVNfTUlOOiAxLFxuICAgICAgICBSQURJVVNfTUFYOiAyZTIsXG4gICAgICAgIFZFTE9DSVRZX01BWDogMTBcbiAgICB9KTtcbn1cbkVNUFRZXzNELnByb3RvdHlwZS50aXRsZSA9ICczRCBHcmF2aXR5IFNpbXVsYXRvcic7XG5cbmZ1bmN0aW9uIE1BTlVBTF8yRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8yRChjKSwge1xuICAgICAgICBJTlBVVF9UWVBFOiAnbnVtYmVyJ1xuICAgIH0pO1xufVxuTUFOVUFMXzJELnByb3RvdHlwZS50aXRsZSA9ICcyRCBNYW51YWwnO1xuXG5mdW5jdGlvbiBNQU5VQUxfM0QoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgRU1QVFlfM0QoYyksIHtcbiAgICAgICAgSU5QVVRfVFlQRTogJ251bWJlcidcbiAgICB9KTtcbn1cbk1BTlVBTF8zRC5wcm90b3R5cGUudGl0bGUgPSAnM0QgTWFudWFsJztcblxuZnVuY3Rpb24gT1JCSVRJTkcoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgRU1QVFlfM0QoYyksIHtcbiAgICAgICAgaW5pdDogKGVuZ2luZSkgPT4ge1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnU3VuJywgWzAsIDAsIDBdLCAxMDAwMDAwLCAxMDAsIFswLCAwLCAwXSwgJ2JsdWUnKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ01lcmN1cnknLCBbMTgwLCAwLCAwXSwgMSwgMjAsIFswLCAyLjQsIDBdLCAncmVkJyk7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdWZW51cycsIFsyNDAsIDAsIDBdLCAxLCAyMCwgWzAsIDIuMSwgMF0sICd5ZWxsb3cnKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ0VhcnRoJywgWzMwMCwgMCwgMF0sIDEsIDIwLCBbMCwgMS45LCAwXSwgJ2dyZWVuJyk7XG4gICAgICAgICAgICBlbmdpbmUudG9nZ2xlQW5pbWF0aW5nKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbk9SQklUSU5HLnByb3RvdHlwZS50aXRsZSA9ICdPcmJpdGluZyc7XG5cbmZ1bmN0aW9uIENPTExJU0lPTihjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8zRChjKSwge1xuICAgICAgICBpbml0OiAoZW5naW5lKSA9PiB7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdCYWxsIEEnLCBbLTEwMCwgMCwgMF0sIDEwMDAwMCwgNTAsIFsuNSwgLjUsIDBdLCAnYmx1ZScpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnQmFsbCBCJywgWzEwMCwgMCwgMF0sIDEwMDAwMCwgNTAsIFstLjUsIC0uNSwgMF0sICdyZWQnKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ0JhbGwgQycsIFswLCAxMDAsIDBdLCAxMDAwMDAsIDUwLCBbMCwgMCwgMF0sICdncmVlbicpO1xuICAgICAgICAgICAgZW5naW5lLnRvZ2dsZUFuaW1hdGluZygpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5DT0xMSVNJT04ucHJvdG90eXBlLnRpdGxlID0gJ0VsYXN0aWMgQ29sbGlzaW9uJztcblxubW9kdWxlLmV4cG9ydHMgPSBbRU1QVFlfMkQsIEVNUFRZXzNELCBNQU5VQUxfMkQsIE1BTlVBTF8zRCwgT1JCSVRJTkcsIENPTExJU0lPTl07IiwiY2xhc3MgQ29udHJvbEJveCB7XG4gICAgY29uc3RydWN0b3Iob2JqZWN0LCB0aXRsZSwgY29udHJvbGxlcnMsIHgsIHkpIHtcbiAgICAgICAgY29uc3QgJHRlbXBsYXRlQ29udHJvbEJveCA9ICQoJy5jb250cm9sLWJveC50ZW1wbGF0ZScpO1xuICAgICAgICBjb25zdCAkY29udHJvbEJveCA9ICR0ZW1wbGF0ZUNvbnRyb2xCb3guY2xvbmUoKTtcbiAgICAgICAgJGNvbnRyb2xCb3gucmVtb3ZlQ2xhc3MoJ3RlbXBsYXRlJyk7XG4gICAgICAgICRjb250cm9sQm94LmZpbmQoJy50aXRsZScpLnRleHQodGl0bGUpO1xuICAgICAgICBjb25zdCAkaW5wdXRDb250YWluZXIgPSAkY29udHJvbEJveC5maW5kKCcuaW5wdXQtY29udGFpbmVyJyk7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbGxlciBvZiBjb250cm9sbGVycykge1xuICAgICAgICAgICAgJGlucHV0Q29udGFpbmVyLmFwcGVuZChjb250cm9sbGVyLiRpbnB1dFdyYXBwZXIpO1xuICAgICAgICB9XG4gICAgICAgICRjb250cm9sQm94LmZpbmQoJy5jbG9zZScpLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgICRjb250cm9sQm94LnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLnJlbW92ZScpLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIG9iamVjdC5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkY29udHJvbEJveC5pbnNlcnRCZWZvcmUoJHRlbXBsYXRlQ29udHJvbEJveCk7XG4gICAgICAgICRjb250cm9sQm94LmNzcygnbGVmdCcsIHggKyAncHgnKTtcbiAgICAgICAgJGNvbnRyb2xCb3guY3NzKCd0b3AnLCB5ICsgJ3B4Jyk7XG5cbiAgICAgICAgdGhpcy4kY29udHJvbEJveCA9ICRjb250cm9sQm94O1xuICAgIH1cblxuICAgIGNsb3NlKCkge1xuICAgICAgICB0aGlzLiRjb250cm9sQm94LnJlbW92ZSgpO1xuICAgIH1cblxuICAgIGlzT3BlbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGNvbnRyb2xCb3hbMF0ucGFyZW50Tm9kZTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbEJveDsiLCJjbGFzcyBDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihvYmplY3QsIG5hbWUsIG1pbiwgbWF4LCB2YWx1ZSwgZnVuYykge1xuICAgICAgICBjb25zdCAkaW5wdXRXcmFwcGVyID0gdGhpcy4kaW5wdXRXcmFwcGVyID0gJCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlIC5pbnB1dC13cmFwcGVyLnRlbXBsYXRlJykuY2xvbmUoKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5maW5kKCcubmFtZScpLnRleHQobmFtZSk7XG4gICAgICAgIGNvbnN0ICRpbnB1dCA9IHRoaXMuJGlucHV0ID0gJGlucHV0V3JhcHBlci5maW5kKCdpbnB1dCcpO1xuICAgICAgICAkaW5wdXQuYXR0cigndHlwZScsIG9iamVjdC5jb25maWcuSU5QVVRfVFlQRSk7XG4gICAgICAgICRpbnB1dC5hdHRyKCdtaW4nLCBtaW4pO1xuICAgICAgICAkaW5wdXQuYXR0cignbWF4JywgbWF4KTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ3ZhbHVlJywgdmFsdWUpO1xuICAgICAgICAkaW5wdXQuYXR0cignc3RlcCcsIDAuMDEpO1xuICAgICAgICBjb25zdCAkdmFsdWUgPSAkaW5wdXRXcmFwcGVyLmZpbmQoJy52YWx1ZScpO1xuICAgICAgICAkdmFsdWUudGV4dCh0aGlzLmdldCgpKTtcbiAgICAgICAgJGlucHV0Lm9uKCdpbnB1dCcsIGUgPT4ge1xuICAgICAgICAgICAgJHZhbHVlLnRleHQodGhpcy5nZXQoKSk7XG4gICAgICAgICAgICBmdW5jLmNhbGwob2JqZWN0LCBlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh0aGlzLiRpbnB1dC52YWwoKSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xsZXI7IiwiY29uc3QgQ2lyY2xlID0gcmVxdWlyZSgnLi4vb2JqZWN0L2NpcmNsZScpO1xuY29uc3Qge3JvdGF0ZSwgbm93LCByYW5kb20sIHBvbGFyMmNhcnRlc2lhbiwgcmFuZENvbG9yLCBnZXRSb3RhdGlvbk1hdHJpeCwgY2FydGVzaWFuMmF1dG99ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3VifSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21pbiwgUEksIGF0YW4yLCBwb3d9ID0gTWF0aDtcblxuY2xhc3MgRW5naW5lMkQge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgcmVuZGVyZXIpIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgICAgIHRoaXMub2JqcyA9IFtdO1xuICAgICAgICB0aGlzLmFuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbnRyb2xCb3hlcyA9IFtdO1xuICAgICAgICB0aGlzLmZwc0xhc3RUaW1lID0gbm93KCk7XG4gICAgICAgIHRoaXMuZnBzQ291bnQgPSAwO1xuICAgICAgICB0aGlzLmxhc3RPYmpObyA9IDA7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgICAgICAgdGhpcy5zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgY29uZmlnLlcgLyBjb25maWcuSCwgMC4xLCAxZTUpO1xuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi56ID0gNTAwO1xuICAgICAgICB0aGlzLmNhbWVyYS5sb29rQXQodGhpcy5zY2VuZS5wb3NpdGlvbik7XG5cbiAgICAgICAgY29uc3QgaGVtaUxpZ2h0ID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCgweGZmZmZmZiwgMHhmZmZmZmYsIDEpO1xuICAgICAgICB0aGlzLnNjZW5lLmFkZChoZW1pTGlnaHQpO1xuXG4gICAgICAgIGNvbnN0IGRpckxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYsIDAuMik7XG4gICAgICAgIGRpckxpZ2h0LnBvc2l0aW9uLnNldCgtMSwgMSwgMSk7XG4gICAgICAgIGRpckxpZ2h0LnBvc2l0aW9uLm11bHRpcGx5U2NhbGFyKDUwKTtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQoZGlyTGlnaHQpO1xuXG4gICAgICAgIHRoaXMuY29udHJvbHMgPSBuZXcgVEhSRUUuT3JiaXRDb250cm9scyh0aGlzLmNhbWVyYSwgdGhpcy5yZW5kZXJlci5kb21FbGVtZW50KTtcbiAgICAgICAgdGhpcy5jb250cm9scy5lbmFibGVEYW1waW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb250cm9scy5kYW1waW5nRmFjdG9yID0gMC4xNTtcbiAgICAgICAgdGhpcy5jb250cm9scy5lbmFibGVSb3RhdGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0b2dnbGVBbmltYXRpbmcoKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW5nID0gIXRoaXMuYW5pbWF0aW5nO1xuICAgICAgICBkb2N1bWVudC50aXRsZSA9IGAke3RoaXMuY29uZmlnLlRJVExFfSAoJHt0aGlzLmFuaW1hdGluZyA/IFwiU2ltdWxhdGluZ1wiIDogXCJQYXVzZWRcIn0pYDtcbiAgICB9XG5cbiAgICBkZXN0cm95Q29udHJvbEJveGVzKCkge1xuICAgICAgICBmb3IgKGNvbnN0IGNvbnRyb2xCb3ggb2YgdGhpcy5jb250cm9sQm94ZXMpIHtcbiAgICAgICAgICAgIGNvbnRyb2xCb3guY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRyb2xCb3hlcyA9IFtdXG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IG51bGw7XG4gICAgICAgIHRoaXMuZGVzdHJveUNvbnRyb2xCb3hlcygpO1xuICAgIH1cblxuICAgIGFuaW1hdGUoKSB7XG4gICAgICAgIGlmICghdGhpcy5yZW5kZXJlcikgcmV0dXJuO1xuICAgICAgICB0aGlzLnByaW50RnBzKCk7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGluZykge1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVBbGwoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlZHJhd0FsbCgpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHVzZXJDcmVhdGVPYmplY3QoeCwgeSkge1xuICAgICAgICBjb25zdCB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICAgICAgICB2ZWN0b3Iuc2V0KCh4IC8gdGhpcy5jb25maWcuVykgKiAyIC0gMSwgLSh5IC8gdGhpcy5jb25maWcuSCkgKiAyICsgMSwgMC41KTtcbiAgICAgICAgdmVjdG9yLnVucHJvamVjdCh0aGlzLmNhbWVyYSk7XG4gICAgICAgIGNvbnN0IGRpciA9IHZlY3Rvci5zdWIodGhpcy5jYW1lcmEucG9zaXRpb24pLm5vcm1hbGl6ZSgpO1xuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IC10aGlzLmNhbWVyYS5wb3NpdGlvbi56IC8gZGlyLno7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKS5hZGQoZGlyLm11bHRpcGx5U2NhbGFyKGRpc3RhbmNlKSk7XG4gICAgICAgIGNvbnN0IHBvcyA9IFtwb3NpdGlvbi54LCBwb3NpdGlvbi55XTtcblxuICAgICAgICBsZXQgbWF4UiA9IHRoaXMuY29uZmlnLlJBRElVU19NQVg7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgbWF4UiA9IG1pbihtYXhSLCAobWFnKHN1YihvYmoucG9zLCBwb3MpKSAtIG9iai5yKSAvIDEuNSlcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtID0gcmFuZG9tKHRoaXMuY29uZmlnLk1BU1NfTUlOLCB0aGlzLmNvbmZpZy5NQVNTX01BWCk7XG4gICAgICAgIGNvbnN0IHIgPSByYW5kb20odGhpcy5jb25maWcuUkFESVVTX01JTiwgbWF4Uik7XG4gICAgICAgIGNvbnN0IHYgPSBwb2xhcjJjYXJ0ZXNpYW4ocmFuZG9tKHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCAvIDIpLCByYW5kb20oLTE4MCwgMTgwKSk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gcmFuZENvbG9yKCk7XG4gICAgICAgIGNvbnN0IHRhZyA9IGBjaXJjbGUkeysrdGhpcy5sYXN0T2JqTm99YDtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IENpcmNsZSh0aGlzLmNvbmZpZywgbSwgciwgcG9zLCB2LCBjb2xvciwgdGFnLCB0aGlzKTtcbiAgICAgICAgb2JqLnNob3dDb250cm9sQm94KHgsIHkpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGNyZWF0ZU9iamVjdCh0YWcsIHBvcywgbSwgciwgdiwgY29sb3IpIHtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IENpcmNsZSh0aGlzLmNvbmZpZywgbSwgciwgcG9zLCB2LCBjb2xvciwgdGFnLCB0aGlzKTtcbiAgICAgICAgdGhpcy5vYmpzLnB1c2gob2JqKTtcbiAgICB9XG5cbiAgICBnZXRSb3RhdGlvbk1hdHJpeChhbmdsZXMsIGRpciA9IDEpIHtcbiAgICAgICAgcmV0dXJuIGdldFJvdGF0aW9uTWF0cml4KGFuZ2xlc1swXSwgZGlyKTtcbiAgICB9XG5cbiAgICBnZXRQaXZvdEF4aXMoKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGNvbGxpZGVFbGFzdGljYWxseSgpIHtcbiAgICAgICAgY29uc3QgZGltZW5zaW9uID0gdGhpcy5jb25maWcuRElNRU5TSU9OO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub2Jqcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbzEgPSB0aGlzLm9ianNbaV07XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCB0aGlzLm9ianMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvMiA9IHRoaXMub2Jqc1tqXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xsaXNpb24gPSBzdWIobzIucG9zLCBvMS5wb3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFuZ2xlcyA9IGNhcnRlc2lhbjJhdXRvKGNvbGxpc2lvbik7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IGFuZ2xlcy5zaGlmdCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGQgPCBvMS5yICsgbzIucikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBSID0gdGhpcy5nZXRSb3RhdGlvbk1hdHJpeChhbmdsZXMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBSXyA9IHRoaXMuZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzLCAtMSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGkgPSB0aGlzLmdldFBpdm90QXhpcygpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZUZW1wID0gW3JvdGF0ZShvMS52LCBSKSwgcm90YXRlKG8yLnYsIFIpXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdkZpbmFsID0gW3ZUZW1wWzBdLnNsaWNlKCksIHZUZW1wWzFdLnNsaWNlKCldO1xuICAgICAgICAgICAgICAgICAgICB2RmluYWxbMF1baV0gPSAoKG8xLm0gLSBvMi5tKSAqIHZUZW1wWzBdW2ldICsgMiAqIG8yLm0gKiB2VGVtcFsxXVtpXSkgLyAobzEubSArIG8yLm0pO1xuICAgICAgICAgICAgICAgICAgICB2RmluYWxbMV1baV0gPSAoKG8yLm0gLSBvMS5tKSAqIHZUZW1wWzFdW2ldICsgMiAqIG8xLm0gKiB2VGVtcFswXVtpXSkgLyAobzEubSArIG8yLm0pO1xuICAgICAgICAgICAgICAgICAgICBvMS52ID0gcm90YXRlKHZGaW5hbFswXSwgUl8pO1xuICAgICAgICAgICAgICAgICAgICBvMi52ID0gcm90YXRlKHZGaW5hbFsxXSwgUl8pO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc1RlbXAgPSBbemVyb3MoZGltZW5zaW9uKSwgcm90YXRlKGNvbGxpc2lvbiwgUildO1xuICAgICAgICAgICAgICAgICAgICBwb3NUZW1wWzBdW2ldICs9IHZGaW5hbFswXVtpXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zVGVtcFsxXVtpXSArPSB2RmluYWxbMV1baV07XG4gICAgICAgICAgICAgICAgICAgIG8xLnBvcyA9IGFkZChvMS5wb3MsIHJvdGF0ZShwb3NUZW1wWzBdLCBSXykpO1xuICAgICAgICAgICAgICAgICAgICBvMi5wb3MgPSBhZGQobzEucG9zLCByb3RhdGUocG9zVGVtcFsxXSwgUl8pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYWxjdWxhdGVBbGwoKSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgb2JqLmNhbGN1bGF0ZVZlbG9jaXR5KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb2xsaWRlRWxhc3RpY2FsbHkoKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBvYmouY2FsY3VsYXRlUG9zaXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlZHJhd0FsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBvYmouZHJhdygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udHJvbHMudXBkYXRlKCk7XG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcbiAgICB9XG5cbiAgICBwcmludEZwcygpIHtcbiAgICAgICAgdGhpcy5mcHNDb3VudCArPSAxO1xuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IG5vdygpO1xuICAgICAgICBjb25zdCB0aW1lRGlmZiA9IGN1cnJlbnRUaW1lIC0gdGhpcy5mcHNMYXN0VGltZTtcbiAgICAgICAgaWYgKHRpbWVEaWZmID4gMSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7KHRoaXMuZnBzQ291bnQgLyB0aW1lRGlmZikgfCAwfSBmcHNgKTtcbiAgICAgICAgICAgIHRoaXMuZnBzTGFzdFRpbWUgPSBjdXJyZW50VGltZTtcbiAgICAgICAgICAgIHRoaXMuZnBzQ291bnQgPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVzaXplKCkge1xuICAgICAgICB0aGlzLmNhbWVyYS5hc3BlY3QgPSB0aGlzLmNvbmZpZy5XIC8gdGhpcy5jb25maWcuSDtcbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFNpemUodGhpcy5jb25maWcuVywgdGhpcy5jb25maWcuSCk7XG4gICAgfVxuXG4gICAgb25Nb3VzZU1vdmUoZSkge1xuICAgICAgICBpZiAoIXRoaXMubW91c2VEb3duKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGVsdGEgPSBhdGFuMihlLnBhZ2VZIC0gdGhpcy5jb25maWcuSCAvIDIsIGUucGFnZVggLSB0aGlzLmNvbmZpZy5XIC8gMikgLSBhdGFuMih0aGlzLm1vdXNlWSAtIHRoaXMuY29uZmlnLkggLyAyLCB0aGlzLm1vdXNlWCAtIHRoaXMuY29uZmlnLlcgLyAyKTtcbiAgICAgICAgaWYgKGRlbHRhIDwgLVBJKSBkZWx0YSArPSAyICogUEk7XG4gICAgICAgIGlmIChkZWx0YSA+ICtQSSkgZGVsdGEgLT0gMiAqIFBJO1xuICAgICAgICB0aGlzLm1vdXNlWCA9IGUucGFnZVg7XG4gICAgICAgIHRoaXMubW91c2VZID0gZS5wYWdlWTtcbiAgICAgICAgdGhpcy5jYW1lcmEucm90YXRpb24ueiArPSBkZWx0YTtcbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgIH1cblxuICAgIGdldENvb3JkU3RlcChrZXkpIHtcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBub3coKTtcbiAgICAgICAgaWYgKGtleSA9PSB0aGlzLmxhc3RLZXkgJiYgY3VycmVudFRpbWUgLSB0aGlzLmxhc3RUaW1lIDwgMSkge1xuICAgICAgICAgICAgdGhpcy5jb21ibyArPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jb21ibyA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgICAgICB0aGlzLmxhc3RLZXkgPSBrZXk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5DQU1FUkFfQ09PUkRfU1RFUCAqIHBvdyh0aGlzLmNvbmZpZy5DQU1FUkFfQUNDRUxFUkFUSU9OLCB0aGlzLmNvbWJvKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW5naW5lMkQ7IiwiY29uc3QgRW5naW5lMkQgPSByZXF1aXJlKCcuLzJkJyk7XG5jb25zdCBTcGhlcmUgPSByZXF1aXJlKCcuLi9vYmplY3Qvc3BoZXJlJyk7XG5jb25zdCB7cmFuZG9tLCBnZXRZUm90YXRpb25NYXRyaXgsIGdldFpSb3RhdGlvbk1hdHJpeCwgcmFuZENvbG9yLCBzcGhlcmljYWwyY2FydGVzaWFuLCBza2lwSW52aXNpYmxlRXJyb3J9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge21hZywgc3ViLCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWlufSA9IE1hdGg7XG5cblxuY2xhc3MgRW5naW5lM0QgZXh0ZW5kcyBFbmdpbmUyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCByZW5kZXJlcikge1xuICAgICAgICBzdXBlcihjb25maWcsIHJlbmRlcmVyKTtcbiAgICAgICAgdGhpcy5jb250cm9scy5lbmFibGVSb3RhdGUgPSB0cnVlO1xuICAgIH1cblxuICAgIHVzZXJDcmVhdGVPYmplY3QoeCwgeSkge1xuICAgICAgICBjb25zdCB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICAgICAgICB2ZWN0b3Iuc2V0KCh4IC8gdGhpcy5jb25maWcuVykgKiAyIC0gMSwgLSh5IC8gdGhpcy5jb25maWcuSCkgKiAyICsgMSwgMC41KTtcbiAgICAgICAgdmVjdG9yLnVucHJvamVjdCh0aGlzLmNhbWVyYSk7XG4gICAgICAgIGNvbnN0IGRpciA9IHZlY3Rvci5zdWIodGhpcy5jYW1lcmEucG9zaXRpb24pLm5vcm1hbGl6ZSgpO1xuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHRoaXMuY29uZmlnLlJBRElVU19NQVggKiAzIC0gdGhpcy5jYW1lcmEucG9zaXRpb24ueiAvIGRpci56O1xuICAgICAgICBjb25zdCBwID0gdGhpcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKS5hZGQoZGlyLm11bHRpcGx5U2NhbGFyKGRpc3RhbmNlKSk7XG4gICAgICAgIGNvbnN0IHBvcyA9IFtwLngsIHAueSwgcC56XTtcblxuICAgICAgICBsZXQgbWF4UiA9IHRoaXMuY29uZmlnLlJBRElVU19NQVg7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgbWF4UiA9IG1pbihtYXhSLCAobWFnKHN1YihvYmoucG9zLCBwb3MpKSAtIG9iai5yKSAvIDEuNSlcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtID0gcmFuZG9tKHRoaXMuY29uZmlnLk1BU1NfTUlOLCB0aGlzLmNvbmZpZy5NQVNTX01BWCk7XG4gICAgICAgIGNvbnN0IHIgPSByYW5kb20odGhpcy5jb25maWcuUkFESVVTX01JTiwgbWF4Uik7XG4gICAgICAgIGNvbnN0IHYgPSBzcGhlcmljYWwyY2FydGVzaWFuKHJhbmRvbSh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVggLyAyKSwgcmFuZG9tKC0xODAsIDE4MCksIHJhbmRvbSgtMTgwLCAxODApKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSByYW5kQ29sb3IoKTtcbiAgICAgICAgY29uc3QgdGFnID0gYHNwaGVyZSR7Kyt0aGlzLmxhc3RPYmpOb31gO1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgU3BoZXJlKHRoaXMuY29uZmlnLCBtLCByLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICBvYmouc2hvd0NvbnRyb2xCb3goeCwgeSk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgY3JlYXRlT2JqZWN0KHRhZywgcG9zLCBtLCByLCB2LCBjb2xvcikge1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgU3BoZXJlKHRoaXMuY29uZmlnLCBtLCByLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgZGlyID0gMSkge1xuICAgICAgICByZXR1cm4gZG90KGdldFpSb3RhdGlvbk1hdHJpeChhbmdsZXNbMF0sIGRpciksIGdldFlSb3RhdGlvbk1hdHJpeChhbmdsZXNbMV0sIGRpciksIGRpcik7XG4gICAgfVxuXG4gICAgZ2V0UGl2b3RBeGlzKCkge1xuICAgICAgICByZXR1cm4gMjtcbiAgICB9XG5cbiAgICBvbk1vdXNlTW92ZShlKSB7XG4gICAgfVxuXG4gICAgb25Nb3VzZURvd24oZSkge1xuICAgIH1cblxuICAgIG9uTW91c2VVcChlKSB7XG4gICAgfVxuXG4gICAgdXBkYXRlUG9zaXRpb24oKSB7XG4gICAgICAgIHN1cGVyLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTNEOyIsImNvbnN0IEVuZ2luZTJEID0gcmVxdWlyZSgnLi9lbmdpbmUvMmQnKTtcbmNvbnN0IEVuZ2luZTNEID0gcmVxdWlyZSgnLi9lbmdpbmUvM2QnKTtcbmNvbnN0IHtnZXREaXN0YW5jZX0gPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuXG5sZXQgY29uZmlnID0gbnVsbDtcbmNvbnN0ICRyZW5kZXJlcldyYXBwZXIgPSAkKCcucmVuZGVyZXItd3JhcHBlcicpO1xuXG5mdW5jdGlvbiBvblJlc2l6ZShlLCBlbmdpbmUpIHtcbiAgICBjb25maWcuVyA9ICRyZW5kZXJlcldyYXBwZXIud2lkdGgoKTtcbiAgICBjb25maWcuSCA9ICRyZW5kZXJlcldyYXBwZXIuaGVpZ2h0KCk7XG4gICAgaWYgKGVuZ2luZSkgZW5naW5lLnJlc2l6ZSgpO1xufVxuXG5jb25zdCByYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKCk7XG5jb25zdCBtb3VzZSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5mdW5jdGlvbiBvbkNsaWNrKGUsIGVuZ2luZSkge1xuICAgIGNvbnN0IHggPSBlLnBhZ2VYO1xuICAgIGNvbnN0IHkgPSBlLnBhZ2VZO1xuICAgIGlmICghZW5naW5lLmFuaW1hdGluZykge1xuICAgICAgICBtb3VzZS54ID0gKHggLyBjb25maWcuVykgKiAyIC0gMTtcbiAgICAgICAgbW91c2UueSA9IC0oeSAvIGNvbmZpZy5IKSAqIDIgKyAxO1xuICAgICAgICByYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShtb3VzZSwgZW5naW5lLmNhbWVyYSk7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIGVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICB2YXIgaW50ZXJzZWN0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3Qob2JqLm9iamVjdCk7XG4gICAgICAgICAgICBpZiAoaW50ZXJzZWN0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgb2JqLnNob3dDb250cm9sQm94KHgsIHkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVuZ2luZS51c2VyQ3JlYXRlT2JqZWN0KHgsIHkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gb25LZXlEb3duKGUsIGVuZ2luZSkge1xuICAgIGNvbnN0IHtrZXlDb2RlfSA9IGU7XG4gICAgaWYgKGtleUNvZGUgPT0gMzIpIHsgLy8gc3BhY2UgYmFyXG4gICAgICAgIGVuZ2luZS5kZXN0cm95Q29udHJvbEJveGVzKCk7XG4gICAgICAgIGVuZ2luZS50b2dnbGVBbmltYXRpbmcoKTtcbiAgICB9XG59XG5cbmNsYXNzIFNpbXVsYXRvciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuICAgICAgICAkcmVuZGVyZXJXcmFwcGVyLmFwcGVuZCh0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuICAgICAgICAkKHdpbmRvdykucmVzaXplKGUgPT4ge1xuICAgICAgICAgICAgb25SZXNpemUoZSwgdGhpcy5lbmdpbmUpO1xuICAgICAgICB9KTtcbiAgICAgICAgJCh0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpLmRibGNsaWNrKGUgPT4ge1xuICAgICAgICAgICAgb25DbGljayhlLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCdib2R5Jykua2V5ZG93bihlID0+IHtcbiAgICAgICAgICAgIG9uS2V5RG93bihlLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGluaXQocHJlc2V0KSB7XG4gICAgICAgIGlmICh0aGlzLmVuZ2luZSkgdGhpcy5lbmdpbmUuZGVzdHJveSgpO1xuICAgICAgICBjb25maWcgPSBwcmVzZXQoe30pO1xuICAgICAgICBkb2N1bWVudC50aXRsZSA9IGNvbmZpZy5USVRMRSA9IHByZXNldC5wcm90b3R5cGUudGl0bGU7XG4gICAgICAgIHRoaXMuZW5naW5lID0gbmV3IChjb25maWcuRElNRU5TSU9OID09IDIgPyBFbmdpbmUyRCA6IEVuZ2luZTNEKShjb25maWcsIHRoaXMucmVuZGVyZXIpO1xuICAgICAgICBvblJlc2l6ZShudWxsLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIGlmICgnaW5pdCcgaW4gY29uZmlnKSBjb25maWcuaW5pdCh0aGlzLmVuZ2luZSk7XG4gICAgICAgIHRoaXMuZW5naW5lLmFuaW1hdGUoKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2ltdWxhdG9yOyIsImZ1bmN0aW9uIGl0ZXIoYSwgZnVuYykge1xuICAgIGNvbnN0IGFfciA9IGEubGVuZ3RoO1xuICAgIGNvbnN0IG0gPSBuZXcgQXJyYXkoYV9yKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfcjsgaSsrKSB7XG4gICAgICAgIG1baV0gPSBmdW5jKGkpO1xuICAgIH1cbiAgICByZXR1cm4gbTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgemVyb3M6IE4gPT4ge1xuICAgICAgICByZXR1cm4gbmV3IEFycmF5KE4pLmZpbGwoMCk7XG4gICAgfSxcblxuICAgIG1hZzogYSA9PiB7XG4gICAgICAgIGNvbnN0IGFfciA9IGEubGVuZ3RoO1xuICAgICAgICBsZXQgc3VtID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX3I7IGkrKykge1xuICAgICAgICAgICAgc3VtICs9IGFbaV0gKiBhW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoc3VtKTtcbiAgICB9LFxuXG4gICAgYWRkOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldICsgYltpXTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHN1YjogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAtIGJbaV07XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBtdWw6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gKiBiO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZGl2OiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldIC8gYjtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRvdDogKGEsIGIsIGRpciA9IDEpID0+IHtcbiAgICAgICAgaWYgKGRpciA9PSAtMSkge1xuICAgICAgICAgICAgW2EsIGJdID0gW2IsIGFdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFfciA9IGEubGVuZ3RoO1xuICAgICAgICBjb25zdCBhX2MgPSBhWzBdLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYl9jID0gYlswXS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IG0gPSBuZXcgQXJyYXkoYV9yKTtcbiAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCBhX3I7IHIrKykge1xuICAgICAgICAgICAgbVtyXSA9IG5ldyBBcnJheShiX2MpO1xuICAgICAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCBiX2M7IGMrKykge1xuICAgICAgICAgICAgICAgIG1bcl1bY10gPSAwO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYV9jOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbVtyXVtjXSArPSBhW3JdW2ldICogYltpXVtjXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxufTsiLCJjb25zdCBDb250cm9sQm94ID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sX2JveCcpO1xuY29uc3QgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbGxlcicpO1xuY29uc3Qge3JhZDJkZWcsIGRlZzJyYWQsIHBvbGFyMmNhcnRlc2lhbiwgY2FydGVzaWFuMmF1dG8sIHNxdWFyZX0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21heH0gPSBNYXRoO1xuXG5cbmNsYXNzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogUG9sYXIgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Qb2xhcl9jb29yZGluYXRlX3N5c3RlbVxuICAgICAqL1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBtLCByLCBwb3MsIHYsIGNvbG9yLCB0YWcsIGVuZ2luZSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5yID0gcjtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMucHJldlBvcyA9IHBvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnYgPSB2O1xuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgICAgIHRoaXMudGFnID0gdGFnO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICAgICAgdGhpcy5vYmplY3QgPSB0aGlzLmNyZWF0ZU9iamVjdCgpO1xuICAgICAgICB0aGlzLmNvbnRyb2xCb3ggPSBudWxsO1xuICAgICAgICB0aGlzLnBhdGggPSBudWxsO1xuICAgICAgICB0aGlzLnBhdGhWZXJ0aWNlcyA9IFtdO1xuICAgICAgICB0aGlzLnBhdGhNYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7XG4gICAgICAgICAgICBjb2xvcjogMHg4ODg4ODhcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb25NYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7XG4gICAgICAgICAgICBjb2xvcjogMHhmZmZmZmZcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0R2VvbWV0cnkoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVEhSRUUuQ2lyY2xlR2VvbWV0cnkodGhpcy5yLCAzMik7XG4gICAgfVxuXG4gICAgY3JlYXRlT2JqZWN0KCkge1xuICAgICAgICBpZiAodGhpcy5vYmplY3QpIHRoaXMuZW5naW5lLnNjZW5lLnJlbW92ZSh0aGlzLm9iamVjdCk7XG4gICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gdGhpcy5nZXRHZW9tZXRyeSgpO1xuICAgICAgICBjb25zdCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCh7Y29sb3I6IHRoaXMuY29sb3J9KTtcbiAgICAgICAgY29uc3Qgb2JqZWN0ID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgb2JqZWN0Lm1hdHJpeEF1dG9VcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5lbmdpbmUuc2NlbmUuYWRkKG9iamVjdCk7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlVmVsb2NpdHkoKSB7XG4gICAgICAgIGxldCBGID0gemVyb3ModGhpcy5jb25maWcuRElNRU5TSU9OKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgaWYgKG9iaiA9PSB0aGlzKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHZlY3RvciA9IHN1Yih0aGlzLnBvcywgb2JqLnBvcyk7XG4gICAgICAgICAgICBjb25zdCBtYWduaXR1ZGUgPSBtYWcodmVjdG9yKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaXRWZWN0b3IgPSBkaXYodmVjdG9yLCBtYWduaXR1ZGUpO1xuICAgICAgICAgICAgRiA9IGFkZChGLCBtdWwodW5pdFZlY3Rvciwgb2JqLm0gLyBzcXVhcmUobWFnbml0dWRlKSkpXG4gICAgICAgIH1cbiAgICAgICAgRiA9IG11bChGLCAtdGhpcy5jb25maWcuRyAqIHRoaXMubSk7XG4gICAgICAgIGNvbnN0IGEgPSBkaXYoRiwgdGhpcy5tKTtcbiAgICAgICAgdGhpcy52ID0gYWRkKHRoaXMudiwgYSk7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlUG9zaXRpb24oKSB7XG4gICAgICAgIHRoaXMucG9zID0gYWRkKHRoaXMucG9zLCB0aGlzLnYpO1xuICAgICAgICBpZiAobWFnKHN1Yih0aGlzLnBvcywgdGhpcy5wcmV2UG9zKSkgPiAxKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZQb3MgPSB0aGlzLnBvcy5zbGljZSgpO1xuICAgICAgICAgICAgdGhpcy5wYXRoVmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMyh0aGlzLnBvc1swXSwgdGhpcy5wb3NbMV0sIHRoaXMucG9zWzJdKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICB0aGlzLm9iamVjdC5wb3NpdGlvbi54ID0gdGhpcy5wb3NbMF07XG4gICAgICAgIHRoaXMub2JqZWN0LnBvc2l0aW9uLnkgPSB0aGlzLnBvc1sxXTtcbiAgICAgICAgdGhpcy5vYmplY3QudXBkYXRlTWF0cml4KCk7XG5cbiAgICAgICAgaWYgKHRoaXMucGF0aCkgdGhpcy5lbmdpbmUuc2NlbmUucmVtb3ZlKHRoaXMucGF0aCk7XG4gICAgICAgIGNvbnN0IHBhdGhHZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuICAgICAgICBwYXRoR2VvbWV0cnkudmVydGljZXMgPSB0aGlzLnBhdGhWZXJ0aWNlcztcbiAgICAgICAgdGhpcy5wYXRoID0gbmV3IFRIUkVFLkxpbmUocGF0aEdlb21ldHJ5LCB0aGlzLnBhdGhNYXRlcmlhbCk7XG4gICAgICAgIHRoaXMuZW5naW5lLnNjZW5lLmFkZCh0aGlzLnBhdGgpO1xuXG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGlvbikgdGhpcy5lbmdpbmUuc2NlbmUucmVtb3ZlKHRoaXMuZGlyZWN0aW9uKTtcbiAgICAgICAgY29uc3QgZGlyZWN0aW9uR2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcbiAgICAgICAgaWYgKG1hZyh0aGlzLnYpID09IDApIHtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG5leHRQb3MgPSBhZGQodGhpcy5wb3MsIG11bCh0aGlzLnYsIHRoaXMuciAvIG1hZyh0aGlzLnYpICsgMjApKTtcbiAgICAgICAgICAgIGRpcmVjdGlvbkdlb21ldHJ5LnZlcnRpY2VzID0gW25ldyBUSFJFRS5WZWN0b3IzKHRoaXMucG9zWzBdLCB0aGlzLnBvc1sxXSwgdGhpcy5wb3NbMl0pLCBuZXcgVEhSRUUuVmVjdG9yMyhuZXh0UG9zWzBdLCBuZXh0UG9zWzFdLCBuZXh0UG9zWzJdKV07XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IG5ldyBUSFJFRS5MaW5lKGRpcmVjdGlvbkdlb21ldHJ5LCB0aGlzLmRpcmVjdGlvbk1hdGVyaWFsKTtcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLnNjZW5lLmFkZCh0aGlzLmRpcmVjdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb250cm9sTShlKSB7XG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm1Db250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLm0gPSBtO1xuICAgICAgICB0aGlzLm9iamVjdCA9IHRoaXMuY3JlYXRlT2JqZWN0KCk7XG4gICAgfVxuXG4gICAgY29udHJvbFIoZSkge1xuICAgICAgICBjb25zdCByID0gdGhpcy5yQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5yID0gcjtcbiAgICAgICAgdGhpcy5vYmplY3QgPSB0aGlzLmNyZWF0ZU9iamVjdCgpO1xuICAgIH1cblxuICAgIGNvbnRyb2xQb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NYQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgeSA9IHRoaXMucG9zWUNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMucG9zID0gW3gsIHldO1xuICAgIH1cblxuICAgIGNvbnRyb2xWKGUpIHtcbiAgICAgICAgY29uc3QgcmhvID0gdGhpcy52UmhvQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgcGhpID0gZGVnMnJhZCh0aGlzLnZQaGlDb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgdGhpcy52ID0gcG9sYXIyY2FydGVzaWFuKHJobywgcGhpKTtcbiAgICB9XG5cbiAgICBzaG93Q29udHJvbEJveCh4LCB5KSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRyb2xCb3ggJiYgdGhpcy5jb250cm9sQm94LmlzT3BlbigpKSB7XG4gICAgICAgICAgICBjb25zdCAkY29udHJvbEJveCA9IHRoaXMuY29udHJvbEJveC4kY29udHJvbEJveDtcbiAgICAgICAgICAgICRjb250cm9sQm94LmNzcygnbGVmdCcsIHggKyAncHgnKTtcbiAgICAgICAgICAgICRjb250cm9sQm94LmNzcygndG9wJywgeSArICdweCcpO1xuICAgICAgICAgICAgJGNvbnRyb2xCb3gubmV4dFVudGlsKCcuY29udHJvbC1ib3gudGVtcGxhdGUnKS5pbnNlcnRCZWZvcmUoJGNvbnRyb2xCb3gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbWFyZ2luID0gMS41O1xuXG4gICAgICAgICAgICB2YXIgcG9zUmFuZ2UgPSBtYXgobWF4KHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpIC8gMiwgbWF4LmFwcGx5KG51bGwsIHRoaXMucG9zLm1hcChNYXRoLmFicykpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICBwb3NSYW5nZSA9IG1heChwb3NSYW5nZSwgbWF4LmFwcGx5KG51bGwsIG9iai5wb3MubWFwKE1hdGguYWJzKSkgKiBtYXJnaW4pO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGNvbnN0IHYgPSBjYXJ0ZXNpYW4yYXV0byh0aGlzLnYpO1xuICAgICAgICAgICAgdmFyIHZSYW5nZSA9IG1heCh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVgsIG1hZyh0aGlzLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICB2UmFuZ2UgPSBtYXgodlJhbmdlLCBtYWcob2JqLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXR1cF9jb250cm9sbGVycyhwb3NSYW5nZSwgdGhpcy5tLCB0aGlzLnIsIHYsIHZSYW5nZSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xCb3ggPSBuZXcgQ29udHJvbEJveCh0aGlzLCB0aGlzLnRhZywgdGhpcy5nZXRDb250cm9sbGVycygpLCB4LCB5KTtcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLmNvbnRyb2xCb3hlcy5wdXNoKHRoaXMuY29udHJvbEJveCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXR1cF9jb250cm9sbGVycyhwb3NSYW5nZSwgbSwgciwgdiwgdlJhbmdlKSB7XG4gICAgICAgIHRoaXMubUNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIk1hc3MgbVwiLCB0aGlzLmNvbmZpZy5NQVNTX01JTiwgdGhpcy5jb25maWcuTUFTU19NQVgsIG0sIHRoaXMuY29udHJvbE0pO1xuICAgICAgICB0aGlzLnJDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJSYWRpdXMgclwiLCB0aGlzLmNvbmZpZy5SQURJVVNfTUlOLCB0aGlzLmNvbmZpZy5SQURJVVNfTUFYLCByLCB0aGlzLmNvbnRyb2xSKTtcbiAgICAgICAgdGhpcy5wb3NYQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24geFwiLCAtcG9zUmFuZ2UsIHBvc1JhbmdlLCB0aGlzLnBvc1swXSwgdGhpcy5jb250cm9sUG9zKTtcbiAgICAgICAgdGhpcy5wb3NZQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24geVwiLCAtcG9zUmFuZ2UsIHBvc1JhbmdlLCB0aGlzLnBvc1sxXSwgdGhpcy5jb250cm9sUG9zKTtcbiAgICAgICAgdGhpcy52UmhvQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgz4FcIiwgMCwgdlJhbmdlLCB2WzBdLCB0aGlzLmNvbnRyb2xWKTtcbiAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgz4ZcIiwgLTE4MCwgMTgwLCByYWQyZGVnKHZbMV0pLCB0aGlzLmNvbnRyb2xWKTtcbiAgICB9XG5cbiAgICBnZXRDb250cm9sbGVycygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRoaXMubUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnJDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NYQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZSaG9Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlclxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIGlmICh0aGlzLm9iamVjdCkgdGhpcy5lbmdpbmUuc2NlbmUucmVtb3ZlKHRoaXMub2JqZWN0KTtcbiAgICAgICAgaWYgKHRoaXMucGF0aCkgdGhpcy5lbmdpbmUuc2NlbmUucmVtb3ZlKHRoaXMucGF0aCk7XG4gICAgICAgIGNvbnN0IGkgPSB0aGlzLmVuZ2luZS5vYmpzLmluZGV4T2YodGhpcyk7XG4gICAgICAgIHRoaXMuZW5naW5lLm9ianMuc3BsaWNlKGksIDEpO1xuICAgICAgICBpZiAodGhpcy5jb250cm9sQm94ICYmIHRoaXMuY29udHJvbEJveC5pc09wZW4oKSkge1xuICAgICAgICAgICAgdGhpcy5jb250cm9sQm94LmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsndGFnJzogdGhpcy50YWcsICd2JzogdGhpcy52LCAncG9zJzogdGhpcy5wb3N9KTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2lyY2xlOyIsImNvbnN0IENpcmNsZSA9IHJlcXVpcmUoJy4vY2lyY2xlJyk7XG5jb25zdCBDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sbGVyJyk7XG5jb25zdCB7cmFkMmRlZywgZGVnMnJhZCwgc3BoZXJpY2FsMmNhcnRlc2lhbn0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cblxuY2xhc3MgU3BoZXJlIGV4dGVuZHMgQ2lyY2xlIHtcbiAgICAvKipcbiAgICAgKiBTcGhlcmljYWwgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TcGhlcmljYWxfY29vcmRpbmF0ZV9zeXN0ZW1cbiAgICAgKi9cblxuICAgIGdldEdlb21ldHJ5KCl7XG4gICAgICAgIHJldHVybiBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkodGhpcy5yLCAzMiwgMzIpO1xuICAgIH1cblxuICAgIGRyYXcoKSB7XG4gICAgICAgIHRoaXMub2JqZWN0LnBvc2l0aW9uLnogPSB0aGlzLnBvc1syXTtcbiAgICAgICAgc3VwZXIuZHJhdygpO1xuICAgIH1cblxuICAgIGNvbnRyb2xQb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NYQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgeSA9IHRoaXMucG9zWUNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHogPSB0aGlzLnBvc1pDb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnBvcyA9IFt4LCB5LCB6XTtcbiAgICB9XG5cbiAgICBjb250cm9sVihlKSB7XG4gICAgICAgIGNvbnN0IHBoaSA9IGRlZzJyYWQodGhpcy52UGhpQ29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHRoZXRhID0gZGVnMnJhZCh0aGlzLnZUaGV0YUNvbnRyb2xsZXIuZ2V0KCkpO1xuICAgICAgICBjb25zdCByaG8gPSB0aGlzLnZSaG9Db250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnYgPSBzcGhlcmljYWwyY2FydGVzaWFuKHJobywgcGhpLCB0aGV0YSk7XG4gICAgfVxuXG4gICAgc2V0dXBfY29udHJvbGxlcnMocG9zX3JhbmdlLCBtLCByLCB2LCB2X3JhbmdlKSB7XG4gICAgICAgIHN1cGVyLnNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgciwgdiwgdl9yYW5nZSk7XG4gICAgICAgIHRoaXMucG9zWkNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlBvc2l0aW9uIHpcIiwgLXBvc19yYW5nZSwgcG9zX3JhbmdlLCB0aGlzLnBvc1syXSwgdGhpcy5jb250cm9sUG9zKTtcbiAgICAgICAgdGhpcy52VGhldGFDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJWZWxvY2l0eSDOuFwiLCAtMTgwLCAxODAsIHJhZDJkZWcodlsyXSksIHRoaXMuY29udHJvbFYpO1xuICAgIH1cblxuICAgIGdldENvbnRyb2xsZXJzKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgdGhpcy5tQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMuckNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc1hDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NZQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWkNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZSaG9Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudlRoZXRhQ29udHJvbGxlclxuICAgICAgICBdO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTcGhlcmU7IiwiY29uc3Qge21hZywgZG90fSA9IHJlcXVpcmUoJy4vbWF0cml4Jyk7XG5cbmNvbnN0IFV0aWwgPSB7XG4gICAgc3F1YXJlOiAoeCkgPT4ge1xuICAgICAgICByZXR1cm4geCAqIHg7XG4gICAgfSxcblxuICAgIGN1YmU6ICh4KSA9PiB7XG4gICAgICAgIHJldHVybiB4ICogeCAqIHg7XG4gICAgfSxcblxuICAgIHBvbGFyMmNhcnRlc2lhbjogKHJobywgcGhpKSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyhwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4ocGhpKVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4ycG9sYXI6ICh4LCB5KSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBtYWcoW3gsIHldKSxcbiAgICAgICAgICAgIE1hdGguYXRhbjIoeSwgeClcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgc3BoZXJpY2FsMmNhcnRlc2lhbjogKHJobywgcGhpLCB0aGV0YSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguc2luKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyh0aGV0YSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMnNwaGVyaWNhbDogKHgsIHksIHopID0+IHtcbiAgICAgICAgY29uc3QgcmhvID0gbWFnKFt4LCB5LCB6XSk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8sXG4gICAgICAgICAgICBNYXRoLmF0YW4yKHksIHgpLFxuICAgICAgICAgICAgcmhvICE9IDAgPyBNYXRoLmFjb3MoeiAvIHJobykgOiAwXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJhdXRvOiAodmVjdG9yKSA9PiB7XG4gICAgICAgIHJldHVybiB2ZWN0b3IubGVuZ3RoID09IDJcbiAgICAgICAgICAgID8gVXRpbC5jYXJ0ZXNpYW4ycG9sYXIodmVjdG9yWzBdLCB2ZWN0b3JbMV0pXG4gICAgICAgICAgICA6IFV0aWwuY2FydGVzaWFuMnNwaGVyaWNhbCh2ZWN0b3JbMF0sIHZlY3RvclsxXSwgdmVjdG9yWzJdKTtcbiAgICB9LFxuXG4gICAgcmFkMmRlZzogKHJhZCkgPT4ge1xuICAgICAgICByZXR1cm4gcmFkIC8gTWF0aC5QSSAqIDE4MDtcbiAgICB9LFxuXG4gICAgZGVnMnJhZDogKGRlZykgPT4ge1xuICAgICAgICByZXR1cm4gZGVnIC8gMTgwICogTWF0aC5QSTtcbiAgICB9LFxuXG4gICAgZ2V0RGlzdGFuY2U6ICh4MCwgeTAsIHgxLCB5MSkgPT4ge1xuICAgICAgICByZXR1cm4gbWFnKFt4MSAtIHgwLCB5MSAtIHkwXSk7XG4gICAgfSxcblxuICAgIHJvdGF0ZTogKHZlY3RvciwgbWF0cml4KSA9PiB7XG4gICAgICAgIHJldHVybiBkb3QoW3ZlY3Rvcl0sIG1hdHJpeClbMF07XG4gICAgfSxcblxuICAgIG5vdzogKCkgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwO1xuICAgIH0sXG5cbiAgICByYW5kb206IChtaW4sIG1heCA9IG51bGwpID0+IHtcbiAgICAgICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICAgICAgICBtYXggPSBtaW47XG4gICAgICAgICAgICBtaW4gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG4gICAgfSxcblxuICAgIHJhbmRDb2xvcjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIDB4ZmZmZmZmO1xuICAgIH0sXG5cbiAgICBnZXRSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgLXNpbl0sXG4gICAgICAgICAgICBbc2luLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFhSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgWzEsIDAsIDBdLFxuICAgICAgICAgICAgWzAsIGNvcywgLXNpbl0sXG4gICAgICAgICAgICBbMCwgc2luLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFlSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgMCwgc2luXSxcbiAgICAgICAgICAgIFswLCAxLCAwXSxcbiAgICAgICAgICAgIFstc2luLCAwLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFpSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgLXNpbiwgMF0sXG4gICAgICAgICAgICBbc2luLCBjb3MsIDBdLFxuICAgICAgICAgICAgWzAsIDAsIDFdXG4gICAgICAgIF07XG4gICAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbDsiXX0=

//# sourceMappingURL=gravity_simulator.js.map
