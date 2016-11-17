/**
 * Gravity Simulator - Universal Gravity and Elastic Collision Simulator
 * @version v0.0.1
 * @author Jason Park
 * @link https://github.com/parkjs814/Gravity-Simulator
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _$ = $,
    extend = _$.extend;


module.exports = function () {};

},{}],2:[function(require,module,exports){
"use strict";

module.exports = {};

},{}],3:[function(require,module,exports){
'use strict';

var app = require('./app');
var App = require('./app/constructor');
var preset = require('./preset');
var Simulator = require('./simulator');
var _$ = $,
    extend = _$.extend;

// set global promise error handler

RSVP.on('error', function (reason) {
    console.assert(false, reason);
});

extend(true, app, new App());

var simulator = Simulator(preset.DEFAULT);
simulator.animate();

extend(true, window, {});

},{"./app":2,"./app/constructor":1,"./preset":4,"./simulator":12}],4:[function(require,module,exports){
'use strict';

var _$ = $,
    extend = _$.extend;


function EMPTY_2D(c) {
    return extend(true, c, {
        'TITLE': 'Gravity Simulator',
        'W': 1000,
        'H': 750,
        'BACKGROUND': "white",
        'DIMENSION': 2,
        'MAX_PATHS': 1000,
        'CAMERA_COORD_STEP': 5,
        'CAMERA_ANGLE_STEP': 1,
        'CAMERA_ACCELERATION': 1.1,
        'G': 0.1,
        'MASS_MIN': 1,
        'MASS_MAX': 4e4,
        'VELOCITY_MAX': 10
    });
}

function EMPTY_3D(c) {
    return extend(true, EMPTY_2D(c), {
        'DIMENSION': 3,
        'G': 0.001,
        'MASS_MIN': 1,
        'MASS_MAX': 8e6,
        'VELOCITY_MAX': 10
    });
}

module.exports = EMPTY_2D;

},{}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InvisibleError = require('../error/invisible');

var _require = require('../util'),
    deg2rad = _require.deg2rad,
    rotate = _require.rotate,
    now = _require.now,
    get_rotation_matrix = _require.get_rotation_matrix;

var pow = Math.pow;

var Camera2D = function () {
    function Camera2D(config, engine) {
        _classCallCheck(this, Camera2D);

        this.config = config;
        this.x = 0;
        this.y = 0;
        this.z = 100;
        this.phi = 0;
        this.engine = engine;
        this.last_time = 0;
        this.last_key = null;
        this.combo = 0;
        this.center = nj.array([config.W / 2, config.H / 2]);
    }

    _createClass(Camera2D, [{
        key: 'get_coord_step',
        value: function get_coord_step(key) {
            var current_time = now();
            if (key == this.last_key && current_time - this.last_time < 1) {
                this.combo += 1;
            } else {
                this.combo = 0;
            }
            this.last_time = current_time;
            this.last_key = key;
            return this.config.CAMERA_COORD_STEP * pow(this.config.CAMERA_ACCELERATION, this.combo);
        }
    }, {
        key: 'up',
        value: function up(key) {
            this.y -= this.get_coord_step(key);
            this.refresh();
        }
    }, {
        key: 'down',
        value: function down(key) {
            this.y += this.get_coord_step(key);
            this.refresh();
        }
    }, {
        key: 'left',
        value: function left(key) {
            this.x -= this.get_coord_step(key);
            this.refresh();
        }
    }, {
        key: 'right',
        value: function right(key) {
            this.x += this.get_coord_step(key);
            this.refresh();
        }
    }, {
        key: 'zoom_in',
        value: function zoom_in(key) {
            this.z -= this.get_coord_step(key);
            this.refresh();
        }
    }, {
        key: 'zoom_out',
        value: function zoom_out(key) {
            this.z += this.get_coord_step(key);
            this.refresh();
        }
    }, {
        key: 'rotate_left',
        value: function rotate_left(key) {
            this.phi -= this.config.CAMERA_ANGLE_STEP;
            this.refresh();
        }
    }, {
        key: 'rotate_right',
        value: function rotate_right(key) {
            this.phi += this.config.CAMERA_ANGLE_STEP;
            this.refresh();
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.engine.camera_changed = true;
        }
    }, {
        key: 'get_zoom',
        value: function get_zoom() {
            var z = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var allow_invisible = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var distance = this.z - z;
            if (distance <= 0) {
                if (!allow_invisible) throw InvisibleError;
                distance = Infinity;
            }
            return 100 / distance;
        }
    }, {
        key: 'adjust_coord',
        value: function adjust_coord(coord) {
            var allow_invisible = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var R = get_rotation_matrix(deg2rad(this.phi));
            var zoom = this.get_zoom();
            return this.center + (rotate(coord, R) - [this.x, this.y]) * zoom;
        }
    }, {
        key: 'adjust_radius',
        value: function adjust_radius(coord, radius) {
            var zoom = this.get_zoom();
            return radius * zoom;
        }
    }, {
        key: 'actual_point',
        value: function actual_point(x, y) {
            var R_ = get_rotation_matrix(deg2rad(this.phi), -1);
            var zoom = this.get_zoom();
            return rotate(([x, y] - this.center) / zoom + [this.x, this.y], R_);
        }
    }]);

    return Camera2D;
}();

module.exports = Camera2D;

},{"../error/invisible":11,"../util":15}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Camera2D = require('./2d');

var _require = require('../util'),
    deg2rad = _require.deg2rad,
    rotate = _require.rotate,
    get_rotation_x_matrix = _require.get_rotation_x_matrix,
    get_rotation_y_matrix = _require.get_rotation_y_matrix;

var Camera3D = function (_Camera2D) {
    _inherits(Camera3D, _Camera2D);

    function Camera3D(config, engine) {
        _classCallCheck(this, Camera3D);

        var _this = _possibleConstructorReturn(this, (Camera3D.__proto__ || Object.getPrototypeOf(Camera3D)).call(this, config, engine));

        _this.theta = 0;
        return _this;
    }

    _createClass(Camera3D, [{
        key: 'rotate_up',
        value: function rotate_up(key) {
            this.theta -= this.config.CAMERA_ANGLE_STEP;
            this.refresh();
        }
    }, {
        key: 'rotate_down',
        value: function rotate_down(key) {
            this.theta += this.config.CAMERA_ANGLE_STEP;
            this.refresh();
        }
    }, {
        key: 'adjust_coord',
        value: function adjust_coord(coord) {
            var allow_invisible = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : False;

            var Rx = get_rotation_x_matrix(deg2rad(this.theta));
            var Ry = get_rotation_y_matrix(deg2rad(this.phi));
            var c = rotate(rotate(coord, Rx), Ry);
            var zoom = this.get_zoom(c.pop(), allow_invisible);
            return this.center + (c - [this.x, this.y]) * zoom;
        }
    }, {
        key: 'adjust_radius',
        value: function adjust_radius(coord, radius) {
            var Rx = get_rotation_x_matrix(deg2rad(this.theta));
            var Ry = get_rotation_y_matrix(deg2rad(this.phi));
            var c = rotate(rotate(coord, Rx), Ry);
            var zoom = this.get_zoom(c.pop());
            return radius * zoom;
        }
    }, {
        key: 'actual_point',
        value: function actual_point(x, y) {
            var Rx_ = get_rotation_x_matrix(deg2rad(this.theta), -1);
            var Ry_ = get_rotation_y_matrix(deg2rad(this.phi), -1);
            var c = ([x, y] - this.center + [this.x, this.y]).concat(0);
            return rotate(rotate(c, Ry_), Rx_);
        }
    }]);

    return Camera3D;
}(Camera2D);

module.exports = Camera3D;

},{"../util":15,"./2d":5}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ControlBox = function () {
    function ControlBox(title, controllers) {
        _classCallCheck(this, ControlBox);

        var $controlBox = $('.control-box.template').clone();
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

        this.$controlBox = $controlBox;
    }

    _createClass(ControlBox, [{
        key: 'destroy',
        value: function destroy() {
            this.$controlBox.remove();
        }
    }]);

    return ControlBox;
}();

},{}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Controller = function () {
    function Controller(name, min, max, value, func) {
        _classCallCheck(this, Controller);

        var $inputWrapper = $('.input-wrapper.template').clone();
        $inputWrapper.removeClass('template');
        $inputWrapper.find('span').text(name);
        var $input = $inputWrapper.find('input');
        $input.attr('min', min);
        $input.attr('max', max);
        $input.attr('value', value);
        $input.change(func);

        this.$inputWrapper = $inputWrapper;
        this.$input = $input;
    }

    _createClass(Controller, [{
        key: 'get',
        value: function get() {
            return this.$input.val();
        }
    }]);

    return Controller;
}();

module.exports = Controller;

},{}],9:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Circle = require('../object/circle');
var Camera2D = require('../camera/2d');
var InvisibleError = require('../error/invisible');

var _require = require('../util'),
    vector_magnitude = _require.vector_magnitude,
    rotate = _require.rotate,
    now = _require.now,
    random = _require.random,
    polar2cartesian = _require.polar2cartesian,
    rand_color = _require.rand_color,
    _get_rotation_matrix = _require.get_rotation_matrix;

var min = Math.min;

var Path = function Path(tag, obj) {
    _classCallCheck(this, Path);

    this.tag = tag;
    this.prev_pos = nj.copy(obj.prev_pos);
    this.pos = nj.copy(obj.pos);
};

var Engine2D = function () {
    function Engine2D(config, canvas) {
        _classCallCheck(this, Engine2D);

        this.config = config;
        this.canvas = canvas;
        this.objs = [];
        this.animating = false;
        this.controlboxes = [];
        this.paths = [];
        this.camera = Camera2D(config, this);
        this.camera_changed = false;
        this.fps_last_time = now();
        this.fps_count = 0;
    }

    _createClass(Engine2D, [{
        key: 'destroy_controlboxes',
        value: function destroy_controlboxes() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.controlboxes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var controlbox = _step.value;

                    controlbox.destroy();
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

            this.controlboxes = [];
        }
    }, {
        key: 'animate',
        value: function animate() {
            this.print_fps();
            if (this.camera_changed) {
                this.camera_changed = false;
                this.move_paths();
            }
            if (this.animating) {
                this.calculate_all();
            }
            this.redraw_all();
            this.canvas.after(10, this.animate);
        }
    }, {
        key: 'object_coords',
        value: function object_coords(obj) {
            var r = this.camera.adjust_radius(obj.pos, obj.get_r());

            var _camera$adjust_coord = this.camera.adjust_coord(obj.pos);

            var _camera$adjust_coord2 = _slicedToArray(_camera$adjust_coord, 2);

            x = _camera$adjust_coord2[0];
            y = _camera$adjust_coord2[1];

            return [x - r, y - r, x + r, y + r];
        }
    }, {
        key: 'direction_coords',
        value: function direction_coords(obj) {
            var _camera$adjust_coord3 = this.camera.adjust_coord(obj.pos),
                _camera$adjust_coord4 = _slicedToArray(_camera$adjust_coord3, 2),
                cx = _camera$adjust_coord4[0],
                cy = _camera$adjust_coord4[1];

            var _camera$adjust_coord5 = this.camera.adjust_coord(obj.pos + obj.v * 50, true),
                _camera$adjust_coord6 = _slicedToArray(_camera$adjust_coord5, 2),
                dx = _camera$adjust_coord6[0],
                dy = _camera$adjust_coord6[1];

            return [cx, cy, dx, dy];
        }
    }, {
        key: 'path_coords',
        value: function path_coords(obj) {
            var _camera$adjust_coord7 = this.camera.adjust_coord(obj.prev_pos),
                _camera$adjust_coord8 = _slicedToArray(_camera$adjust_coord7, 2),
                fx = _camera$adjust_coord8[0],
                fy = _camera$adjust_coord8[1];

            var _camera$adjust_coord9 = this.camera.adjust_coord(obj.pos),
                _camera$adjust_coord10 = _slicedToArray(_camera$adjust_coord9, 2),
                tx = _camera$adjust_coord10[0],
                ty = _camera$adjust_coord10[1];

            return [fx, fy, tx, ty];
        }
    }, {
        key: 'draw_object',
        value: function draw_object(obj) {
            var c = void 0;
            try {
                c = this.object_coords(obj);
            } catch (e) {
                if (e instanceof InvisibleError) {
                    c = [0, 0, 0, 0];
                } else {
                    throw e;
                }
            }
            return this.canvas.create_oval(c[0], c[1], c[2], c[3], fill = obj.color, tag = obj.tag, width = 0);
        }
    }, {
        key: 'draw_direction',
        value: function draw_direction(obj) {
            var c = void 0;
            try {
                c = this.object_coords(obj);
            } catch (e) {
                if (e instanceof InvisibleError) {
                    c = [0, 0, 0, 0];
                } else {
                    throw e;
                }
            }
            return this.canvas.create_line(c[0], c[1], c[2], c[3], fill = "black", tag = obj.dir_tag);
        }
    }, {
        key: 'draw_path',
        value: function draw_path(obj) {
            if (vector_magnitude(obj.pos - obj.prev_pos) > 5) {
                var c = void 0;
                try {
                    c = this.object_coords(obj);
                } catch (e) {
                    if (e instanceof InvisibleError) {
                        c = [0, 0, 0, 0];
                    } else {
                        throw e;
                    }
                }
                this.paths.append(Path(this.canvas.create_line(c[0], c[1], c[2], c[3], fill = "grey"), obj));
                obj.prev_pos = nj.copy(obj.pos);
                if (this.paths.length > this.config.MAX_PATHS) {
                    this.canvas.delete(this.paths[0].tag);
                    this.paths = this.paths.slice(1);
                }
            }
        }
    }, {
        key: 'move_object',
        value: function move_object(obj) {
            try {
                var c = this.object_coords(obj);
                this.canvas.coords(obj.tag, c[0], c[1], c[2], c[3]);
                this.canvas.itemconfigure(obj.tag, state = 'normal');
            } catch (e) {
                if (e instanceof InvisibleError) {
                    this.canvas.itemconfigure(obj.tag, state = 'hidden');
                } else {
                    throw e;
                }
            }
        }
    }, {
        key: 'move_direction',
        value: function move_direction(obj) {
            try {
                var c = this.direction_coords(obj);
                this.canvas.coords(obj.dir_tag, c[0], c[1], c[2], c[3]);
                this.canvas.itemconfigure(obj.dir_tag, state = 'normal');
            } catch (e) {
                if (e instanceof InvisibleError) {
                    this.canvas.itemconfigure(obj.dir_tag, state = 'hidden');
                } else {
                    throw e;
                }
            }
        }
    }, {
        key: 'move_paths',
        value: function move_paths() {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.paths[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var path = _step2.value;

                    try {
                        var c = this.path_coords(path);
                        this.canvas.coords(path.tag, c[0], c[1], c[2], c[3]);
                        this.canvas.itemconfigure(path.tag, state = 'normal');
                    } catch (e) {
                        if (e instanceof InvisibleError) {
                            this.canvas.itemconfigure(path.tag, state = 'hidden');
                        } else {
                            throw e;
                        }
                    }
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
        }
    }, {
        key: 'create_object',
        value: function create_object(x, y) {
            var m = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            var v = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
            var color = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
            var controlbox = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;

            var pos = nj.array(this.camera.actual_point(x, y));
            if (!m) {
                var max_r = Circle.get_r_from_m(this.config.MASS_MAX);
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this.objs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _obj = _step3.value;

                        max_r = min(max_r, (vector_magnitude(_obj.pos - pos) - _obj.get_r()) / 1.5);
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

                m = Circle.get_m_from_r(random(Circle.get_r_from_m(this.config.MASS_MIN), max_r));
            }
            if (!v) {
                v = nj.array(polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180)));
            }
            if (!color) {
                color = rand_color();
            }
            var tag = 'circle' + this.objs.length;
            var dir_tag = tag + "_dir";
            var obj = Circle(this.config, m, pos, v, color, tag, dir_tag, this, controlbox);
            this.objs.append(obj);
            this.draw_object(obj);
            this.draw_direction(obj);
        }
    }, {
        key: 'get_rotation_matrix',
        value: function get_rotation_matrix(angles) {
            var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return _get_rotation_matrix(angles[0], dir);
        }
    }, {
        key: 'elastic_collision',
        value: function elastic_collision() {
            var dimension = this.config.DIMENSION;
            for (var i = 0; i < this.objs.length; i++) {
                var o1 = this.objs[i];
                for (var j = i + 1; j < this.objs.length; j++) {
                    var o2 = this.objs[j];
                    var collision = o2.pos - o1.pos;
                    var angles = cartesian2auto(collision);
                    var d = angles.shift();

                    if (d < o1.get_r() + o2.get_r()) {
                        var R = this.get_rotation_matrix(angles);
                        var R_ = this.get_rotation_matrix(angles, -1);

                        var v_temp = [rotate(o1.v, R), rotate(o2.v, R)];
                        var v_final = nj.copy(v_temp);
                        v_final[0][0] = ((o1.m - o2.m) * v_temp[0][0] + 2 * o2.m * v_temp[1][0]) / (o1.m + o2.m);
                        v_final[1][0] = ((o2.m - o1.m) * v_temp[1][0] + 2 * o1.m * v_temp[0][0]) / (o1.m + o2.m);
                        o1.v = rotate(v_final[0], R_);
                        o2.v = rotate(v_final[1], R_);

                        var pos_temp = [[0] * dimension, rotate(collision, R)];
                        pos_temp[0][0] += v_final[0][0];
                        pos_temp[1][0] += v_final[1][0];
                        o1.pos = o1.pos + rotate(pos_temp[0], R_);
                        o2.pos = o1.pos + rotate(pos_temp[1], R_);
                    }
                }
            }
        }
    }, {
        key: 'calculate_all',
        value: function calculate_all() {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.objs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var obj = _step4.value;

                    obj.calculate_velocity();
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

            this.elastic_collision();

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.objs[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _obj2 = _step5.value;

                    _obj2.calculate_position();
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
        }
    }, {
        key: 'redraw_all',
        value: function redraw_all() {
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this.objs[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var obj = _step6.value;

                    obj.redraw();
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }
        }
    }, {
        key: 'print_fps',
        value: function print_fps() {
            this.fps_count += 1;
            var current_time = now();
            var fps_time_diff = current_time - this.fps_last_time;
            if (fps_time_diff > 1) {
                console.log((this.fps_count / fps_time_diff | 0) + ' fps');
                this.fps_last_time = current_time;
                this.fps_count = 0;
            }
        }
    }]);

    return Engine2D;
}();

module.exports = Engine2D;

},{"../camera/2d":5,"../error/invisible":11,"../object/circle":13,"../util":15}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Engine2D = require('./2d');
var Camera3D = require('../camera/3d');
var Sphere = require('../object/sphere');

var _require = require('../util'),
    vector_magnitude = _require.vector_magnitude,
    random = _require.random,
    get_rotation_x_matrix = _require.get_rotation_x_matrix,
    get_rotation_z_matrix = _require.get_rotation_z_matrix,
    rand_color = _require.rand_color,
    spherical2cartesian = _require.spherical2cartesian;

var min = Math.min;

var Engine3D = function (_Engine2D) {
    _inherits(Engine3D, _Engine2D);

    function Engine3D(config, canvas) {
        _classCallCheck(this, Engine3D);

        var _this = _possibleConstructorReturn(this, (Engine3D.__proto__ || Object.getPrototypeOf(Engine3D)).call(this, config, canvas));

        _this.camera = Camera3D(config, _this);
        return _this;
    }

    _createClass(Engine3D, [{
        key: 'create_object',
        value: function create_object(x, y) {
            var m = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : None;
            var v = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : None;
            var color = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : None;
            var controlbox = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : True;

            var pos = nj.array(this.camera.actual_point(x, y));
            if (!m) {
                var max_r = Sphere.get_r_from_m(this.config.MASS_MAX);
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _obj = _step.value;

                        max_r = min(max_r, (vector_magnitude(_obj.pos - pos) - _obj.get_r()) / 1.5);
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

                m = Sphere.get_m_from_r(random(Sphere.get_r_from_m(this.config.MASS_MIN), max_r));
            }
            if (!v) {
                v = nj.array(spherical2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180), random(-180, 180)));
            }
            if (!color) {
                color = rand_color();
            }
            var tag = 'sphere' + this.objs.length;
            var dir_tag = tag + "_dir";
            var obj = Sphere(this.config, m, pos, v, color, tag, dir_tag, this, controlbox);
            this.objs.append(obj);
            this.draw_object(obj);
            this.draw_direction(obj);
        }
    }, {
        key: 'get_rotation_matrix',
        value: function get_rotation_matrix(angles) {
            var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return dir == 1 ? get_rotation_z_matrix(angles[0]) * get_rotation_x_matrix(angles[1]) : get_rotation_x_matrix(angles[1], -1) * get_rotation_z_matrix(angles[0], -1);
        }
    }]);

    return Engine3D;
}(Engine2D);

module.exports = Engine3D;

},{"../camera/3d":6,"../object/sphere":14,"../util":15,"./2d":9}],11:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InvisibleError = function (_Error) {
  _inherits(InvisibleError, _Error);

  function InvisibleError() {
    _classCallCheck(this, InvisibleError);

    return _possibleConstructorReturn(this, (InvisibleError.__proto__ || Object.getPrototypeOf(InvisibleError)).apply(this, arguments));
  }

  return InvisibleError;
}(Error);

module.exports = InvisibleError;

},{}],12:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

var Engine2D = require('./engine/2d');
var Engine3D = require('./engine/3d');

var _require = require('./util');

_objectDestructuringEmpty(_require);

var config = {};
var keymap = {
    '\uF700': 'up',
    '\uF701': 'down',
    '\uF702': 'left',
    '\uF703': 'right',
    'z': 'zoom_in',
    'x': 'zoom_out',
    'w': 'rotate_up',
    's': 'rotate_down',
    'a': 'rotate_left',
    'd': 'rotate_right'
};

var Simulator = function () {
    function Simulator(preset) {
        _classCallCheck(this, Simulator);

        preset(config);
        var $canvas = $('canvas');
        var ctx = $canvas.getContext('2d');
        this.engine = (config.DIMENSION == 2 ? Engine2D : Engine3D)(config, ctx);
        $canvas.keypress(this.on_key_press());
        $canvas.click(this.on_click());
    }

    _createClass(Simulator, [{
        key: 'animate',
        value: function animate() {
            this.engine.animate();
        }
    }, {
        key: 'on_click',
        value: function on_click(event) {
            var x = event.x,
                y = event.y;

            var engine = this.engine;
            if (!engine.animating) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = engine.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var obj = _step.value;

                        c = engine.object_coords(obj);
                        cx = (c[0] + c[2]) / 2;
                        cy = (c[1] + c[3]) / 2;
                        r = (c[2] - c[0]) / 2;
                        if (get_distance(cx, cy, x, y) < r) {
                            obj.show_controlbox();
                            return;
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

                engine.create_object(event.x, event.y);
            }
        }
    }, {
        key: 'on_key_press',
        value: function on_key_press(event) {
            var char = event.char;

            var engine = this.engine;
            if (char == ' ') {
                engine.destroy_controlboxes();
                engine.animating = !engine.animating;
                document.title = config.TITLE + ' (' + (engine.animating ? "Simulating" : "Paused") + ')';
            } else if (char in keymap && keymap[char] in engine.camera) {
                engine.camera[keymap[char]](char);
            }
        }
    }]);

    return Simulator;
}();

module.exports = Simulator;

},{"./engine/2d":9,"./engine/3d":10,"./util":15}],13:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ControlBox = require('../control/control_box');
var Controller = require('../control/controller');

var _require = require('../util'),
    vector_magnitude = _require.vector_magnitude,
    rad2deg = _require.rad2deg,
    deg2rad = _require.deg2rad,
    polar2cartesian = _require.polar2cartesian,
    cartesian2auto = _require.cartesian2auto,
    square = _require.square;

var max = Math.max,
    pow = Math.pow;

var Circle = function () {
    /**
     * Polar coordinate system
     * https://en.wikipedia.org/wiki/Polar_coordinate_system
     */

    function Circle(config, m, pos, v, color, tag, dir_tag, engine, controlbox) {
        _classCallCheck(this, Circle);

        this.config = config;
        this.m = m;
        this.pos = pos;
        this.prev_pos = nj.copy(pos);
        this.v = v;
        this.color = color;
        this.tag = tag;
        this.dir_tag = dir_tag;
        this.engine = engine;

        this.controlbox = null;
        if (controlbox) {
            this.show_controlbox();
        }
    }

    _createClass(Circle, [{
        key: 'get_r',
        value: function get_r() {
            return Circle.get_r_from_m(this.m);
        }
    }, {
        key: 'calculate_velocity',
        value: function calculate_velocity() {
            var F = 0;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.engine.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var obj = _step.value;

                    if (obj == this) continue;
                    var vector = this.pos - obj.pos;
                    var magnitude = vector_magnitude(vector);
                    var unit_vector = vector / magnitude;
                    F += obj.m / square(magnitude) * unit_vector;
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

            F *= -this.config.G * this.m;
            var a = F / this.m;
            this.v += a;
        }
    }, {
        key: 'calculate_position',
        value: function calculate_position() {
            this.pos += this.v;
        }
    }, {
        key: 'control_m',
        value: function control_m(e) {
            var m = this.m_controller.get();
            this.m = m;
            this.redraw();
        }
    }, {
        key: 'control_pos',
        value: function control_pos(e) {
            var x = this.pos_x_controller.get();
            var y = this.pos_y_controller.get();
            this.pos = nj.array([x, y]);
            this.redraw();
        }
    }, {
        key: 'control_v',
        value: function control_v(e) {
            var phi = deg2rad(this.v_phi_controller.get());
            var rho = this.v_rho_controller.get();
            this.v = nj.array(polar2cartesian(rho, phi));
            this.redraw();
        }
    }, {
        key: 'show_controlbox',
        value: function show_controlbox() {
            try {
                this.controlbox.tk.lift();
            } catch (e) {
                var margin = 1.5;

                var pos_range = max(max(this.config.W, this.config.H) / 2, max.apply(null, this.pos.map(Math.abs)) * margin);
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.engine.objs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var obj = _step2.value;

                        pos_range = max(pos_range, max.apply(null, obj.pos.map(Math.abs)) * margin);
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

                var m = this.m;

                var v = cartesian2auto(this.v);
                var v_range = max(this.config.VELOCITY_MAX, vector_magnitude(this.v) * margin);
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this.engine.objs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _obj = _step3.value;

                        v_range = max(v_range, vector_magnitude(_obj.v) * margin);
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

                this.setup_controllers(pos_range, m, v, v_range);
                this.controlbox = ControlBox(this.tag, this.get_controllers());
                this.engine.controlboxes.append(this.controlbox.tk);
            }
        }
    }, {
        key: 'setup_controllers',
        value: function setup_controllers(pos_range, m, v, v_range) {
            this.m_controller = Controller("Mass m", this.config.MASS_MIN, this.config.MASS_MAX, m, this.control_m);
            this.pos_x_controller = Controller("Position x", -pos_range, pos_range, this.pos[0], this.control_pos);
            this.pos_y_controller = Controller("Position y", -pos_range, pos_range, this.pos[1], this.control_pos);
            this.v_rho_controller = Controller("Velocity ρ", 0, v_range, v[0], this.control_v);
            this.v_phi_controller = Controller("Velocity φ", -180, 180, rad2deg(v[1]), this.control_v);
        }
    }, {
        key: 'get_controllers',
        value: function get_controllers() {
            return [this.m_controller, this.pos_x_controller, this.pos_y_controller, this.v_rho_controller, this.v_phi_controller];
        }
    }, {
        key: 'redraw',
        value: function redraw() {
            this.engine.move_object(this);
            this.engine.move_direction(this);
            this.engine.draw_path(this);
        }
    }, {
        key: 'toString',
        value: function toString() {
            return JSON.stringify({ 'tag': this.tag, 'v': this.v, 'pos': this.pos });
        }
    }], [{
        key: 'get_r_from_m',
        value: function get_r_from_m(m) {
            return pow(m, 1 / 2);
        }
    }, {
        key: 'get_m_from_r',
        value: function get_m_from_r(r) {
            return square(r);
        }
    }]);

    return Circle;
}();

module.exports = Circle;

},{"../control/control_box":7,"../control/controller":8,"../util":15}],14:[function(require,module,exports){
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

var _require2 = require('../util'),
    cube = _require2.cube;

var pow = Math.pow;

var Sphere = function (_Circle) {
    _inherits(Sphere, _Circle);

    function Sphere() {
        _classCallCheck(this, Sphere);

        return _possibleConstructorReturn(this, (Sphere.__proto__ || Object.getPrototypeOf(Sphere)).apply(this, arguments));
    }

    _createClass(Sphere, [{
        key: 'get_r',

        /**
         * Spherical coordinate system
         * https://en.wikipedia.org/wiki/Spherical_coordinate_system
         */

        value: function get_r() {
            return Sphere.get_r_from_m(this.m);
        }
    }, {
        key: 'control_pos',
        value: function control_pos(e) {
            var x = this.pos_x_controller.get();
            var y = this.pos_y_controller.get();
            var z = this.pos_z_controller.get();
            this.pos = nj.array([x, y, z]);
            this.redraw();
        }
    }, {
        key: 'control_v',
        value: function control_v(e) {
            var phi = deg2rad(this.v_phi_controller.get());
            var theta = deg2rad(this.v_theta_controller.get());
            var rho = this.v_rho_controller.get();
            this.v = nj.array(spherical2cartesian(rho, phi, theta));
            this.redraw();
        }
    }, {
        key: 'setup_controllers',
        value: function setup_controllers(pos_range, m, v, v_range) {
            _get(Sphere.prototype.__proto__ || Object.getPrototypeOf(Sphere.prototype), 'setup_controllers', this).call(this, pos_range, m, v, v_range);
            this.pos_z_controller = Controller("Position z", -pos_range, pos_range, this.pos[2], this.control_pos);
            this.v_theta_controller = Controller("Velocity θ", -180, 180, rad2deg(v[2]), this.control_v);
        }
    }, {
        key: 'get_controllers',
        value: function get_controllers() {
            return [this.m_controller, this.pos_x_controller, this.pos_y_controller, this.pos_z_controller, this.v_rho_controller, this.v_phi_controller, this.v_theta_controller];
        }
    }], [{
        key: 'get_r_from_m',
        value: function get_r_from_m(m) {
            return pow(m, 1 / 3);
        }
    }, {
        key: 'get_m_from_r',
        value: function get_m_from_r(r) {
            return cube(r);
        }
    }]);

    return Sphere;
}(Circle);

module.exports = Sphere;

},{"../control/controller":8,"../util":15,"./circle":13}],15:[function(require,module,exports){
'use strict';

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
        return [Math.sqrt(Util.square(x) + Util.square(y)), Math.atan2(x, y)];
    },

    spherical2cartesian: function spherical2cartesian(rho, phi, theta) {
        return [rho * Math.sin(theta) * Math.cos(phi), rho * Math.sin(theta) * Math.sin(phi), rho * Math.cos(theta)];
    },

    cartesian2spherical: function cartesian2spherical(x, y, z) {
        var rho = Math.sqrt(Util.square(x) + Util.square(y) + Util.square(z));
        return [rho, Math.atan2(x, y), rho != 0 ? Math.acos(z / rho) : 0];
    },

    cartesian2auto: function cartesian2auto(vector) {
        return vector.length == 2 ? cartesian2polar(vector[0], vector[1]) : cartesian2spherical(vector[0], vector[1], vector[2]);
    },

    rad2deg: function rad2deg(rad) {
        return rad / Math.pi * 180;
    },

    deg2rad: function deg2rad(deg) {
        return deg / 180 * Math.pi;
    },

    get_distance: function get_distance(x0, y0, x1, y1) {
        return Math.sqrt(Util.square(x1 - x0) + Util.square(y1 - y0));
    },

    vector_magnitude: function vector_magnitude(vector) {
        return nj.linalg.norm(vector);
    },

    c2d: function c2d() {
        return nj.array([0, 0]);
    },

    rotate: function rotate(vector, matrix) {
        return (vector * matrix).getA()[0];
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

    rand_color: function rand_color() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    },

    get_rotation_matrix: function get_rotation_matrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return nj.matrix([[cos, -sin], [sin, cos]]);
    },

    get_rotation_x_matrix: function get_rotation_x_matrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return nj.matrix([[1, 0, 0], [0, cos, -sin], [0, sin, cos]]);
    },

    get_rotation_y_matrix: function get_rotation_y_matrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return nj.matrix([[cos, 0, -sin], [0, 1, 0], [sin, 0, cos]]);
    },

    get_rotation_z_matrix: function get_rotation_z_matrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return nj.matrix([[cos, -sin, 0], [sin, cos, 0], [0, 0, 1]]);
    }
};

module.exports = Util;

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hcHAvY29uc3RydWN0b3IuanMiLCJqcy9hcHAvaW5kZXguanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jYW1lcmEvMmQuanMiLCJqcy9zaW11bGF0b3IvY2FtZXJhLzNkLmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbF9ib3guanMiLCJqcy9zaW11bGF0b3IvY29udHJvbC9jb250cm9sbGVyLmpzIiwianMvc2ltdWxhdG9yL2VuZ2luZS8yZC5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvM2QuanMiLCJqcy9zaW11bGF0b3IvZXJyb3IvaW52aXNpYmxlLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9jaXJjbGUuanMiLCJqcy9zaW11bGF0b3Ivb2JqZWN0L3NwaGVyZS5qcyIsImpzL3NpbXVsYXRvci91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7U0NBaUIsQztJQUFWLE0sTUFBQSxNOzs7QUFFUCxPQUFPLE9BQVAsR0FBaUIsWUFBWSxDQUU1QixDQUZEOzs7OztBQ0ZBLE9BQU8sT0FBUCxHQUFpQixFQUFqQjs7Ozs7QUNBQSxJQUFNLE1BQU0sUUFBUSxPQUFSLENBQVo7QUFDQSxJQUFNLE1BQU0sUUFBUSxtQkFBUixDQUFaO0FBQ0EsSUFBTSxTQUFTLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTSxZQUFZLFFBQVEsYUFBUixDQUFsQjtTQUNpQixDO0lBQVYsTSxNQUFBLE07O0FBRVA7O0FBQ0EsS0FBSyxFQUFMLENBQVEsT0FBUixFQUFpQixVQUFVLE1BQVYsRUFBa0I7QUFDL0IsWUFBUSxNQUFSLENBQWUsS0FBZixFQUFzQixNQUF0QjtBQUNILENBRkQ7O0FBSUEsT0FBTyxJQUFQLEVBQWEsR0FBYixFQUFrQixJQUFJLEdBQUosRUFBbEI7O0FBRUEsSUFBTSxZ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Q0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FGYSxFQUdiLENBQUMsR0FBRCxFQUFNLENBQU4sRUFBUyxHQUFULENBSGEsQ0FBVixDQUFQO0FBS0gsS0FqSFE7O0FBbUhULDJCQUF1QiwrQkFBQyxDQUFELEVBQWdCO0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQ25DLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLGVBQU8sR0FBRyxNQUFILENBQVUsQ0FDYixDQUFDLEdBQUQsRUFBTSxDQUFDLEdBQVAsRUFBWSxDQUFaLENBRGEsRUFFYixDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsQ0FBWCxDQUZhLEVBR2IsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FIYSxDQUFWLENBQVA7QUFLSDtBQTNIUSxDQUFiOztBQThIQSxPQUFPLE9BQVAsR0FBaUIsSUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3Qge2V4dGVuZH0gPSAkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHt9OyIsImNvbnN0IGFwcCA9IHJlcXVpcmUoJy4vYXBwJyk7XG5jb25zdCBBcHAgPSByZXF1aXJlKCcuL2FwcC9jb25zdHJ1Y3RvcicpO1xuY29uc3QgcHJlc2V0ID0gcmVxdWlyZSgnLi9wcmVzZXQnKTtcbmNvbnN0IFNpbXVsYXRvciA9IHJlcXVpcmUoJy4vc2ltdWxhdG9yJyk7XG5jb25zdCB7ZXh0ZW5kfSA9ICQ7XG5cbi8vIHNldCBnbG9iYWwgcHJvbWlzZSBlcnJvciBoYW5kbGVyXG5SU1ZQLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICBjb25zb2xlLmFzc2VydChmYWxzZSwgcmVhc29uKTtcbn0pO1xuXG5leHRlbmQodHJ1ZSwgYXBwLCBuZXcgQXBwKCkpO1xuXG5jb25zdCBzaW11bGF0b3IgPSBTaW11bGF0b3IocHJlc2V0LkRFRkFVTFQpO1xuc2ltdWxhdG9yLmFuaW1hdGUoKTtcblxuZXh0ZW5kKHRydWUsIHdpbmRvdywge30pOyIsImNvbnN0IHtleHRlbmR9ID0gJDtcblxuXG5mdW5jdGlvbiBFTVBUWV8yRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBjLCB7XG4gICAgICAgICdUSVRMRSc6ICdHcmF2aXR5IFNpbXVsYXRvcicsXG4gICAgICAgICdXJzogMTAwMCxcbiAgICAgICAgJ0gnOiA3NTAsXG4gICAgICAgICdCQUNLR1JPVU5EJzogXCJ3aGl0ZVwiLFxuICAgICAgICAnRElNRU5TSU9OJzogMixcbiAgICAgICAgJ01BWF9QQVRIUyc6IDEwMDAsXG4gICAgICAgICdDQU1FUkFfQ09PUkRfU1RFUCc6IDUsXG4gICAgICAgICdDQU1FUkFfQU5HTEVfU1RFUCc6IDEsXG4gICAgICAgICdDQU1FUkFfQUNDRUxFUkFUSU9OJzogMS4xLFxuICAgICAgICAnRyc6IDAuMSxcbiAgICAgICAgJ01BU1NfTUlOJzogMSxcbiAgICAgICAgJ01BU1NfTUFYJzogNGU0LFxuICAgICAgICAnVkVMT0NJVFlfTUFYJzogMTBcbiAgICB9KTtcbn1cblxuXG5mdW5jdGlvbiBFTVBUWV8zRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8yRChjKSwge1xuICAgICAgICAnRElNRU5TSU9OJzogMyxcbiAgICAgICAgJ0cnOiAwLjAwMSxcbiAgICAgICAgJ01BU1NfTUlOJzogMSxcbiAgICAgICAgJ01BU1NfTUFYJzogOGU2LFxuICAgICAgICAnVkVMT0NJVFlfTUFYJzogMTBcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFTVBUWV8yRDtcbiIsImNvbnN0IEludmlzaWJsZUVycm9yID0gcmVxdWlyZSgnLi4vZXJyb3IvaW52aXNpYmxlJyk7XG5jb25zdCB7ZGVnMnJhZCwgcm90YXRlLCBub3csIGdldF9yb3RhdGlvbl9tYXRyaXh9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3Bvd30gPSBNYXRoO1xuXG5jbGFzcyBDYW1lcmEyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBlbmdpbmUpIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgIHRoaXMueSA9IDA7XG4gICAgICAgIHRoaXMueiA9IDEwMDtcbiAgICAgICAgdGhpcy5waGkgPSAwO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICAgICAgdGhpcy5sYXN0X3RpbWUgPSAwO1xuICAgICAgICB0aGlzLmxhc3Rfa2V5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb21ibyA9IDA7XG4gICAgICAgIHRoaXMuY2VudGVyID0gbmouYXJyYXkoW2NvbmZpZy5XIC8gMiwgY29uZmlnLkggLyAyXSk7XG4gICAgfVxuXG4gICAgZ2V0X2Nvb3JkX3N0ZXAoa2V5KSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRfdGltZSA9IG5vdygpO1xuICAgICAgICBpZiAoa2V5ID09IHRoaXMubGFzdF9rZXkgJiYgY3VycmVudF90aW1lIC0gdGhpcy5sYXN0X3RpbWUgPCAxKSB7XG4gICAgICAgICAgICB0aGlzLmNvbWJvICs9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbWJvID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RfdGltZSA9IGN1cnJlbnRfdGltZTtcbiAgICAgICAgdGhpcy5sYXN0X2tleSA9IGtleTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLkNBTUVSQV9DT09SRF9TVEVQICogcG93KHRoaXMuY29uZmlnLkNBTUVSQV9BQ0NFTEVSQVRJT04sIHRoaXMuY29tYm8pO1xuICAgIH1cblxuICAgIHVwKGtleSkge1xuICAgICAgICB0aGlzLnkgLT0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBkb3duKGtleSkge1xuICAgICAgICB0aGlzLnkgKz0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBsZWZ0KGtleSkge1xuICAgICAgICB0aGlzLnggLT0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByaWdodChrZXkpIHtcbiAgICAgICAgdGhpcy54ICs9IHRoaXMuZ2V0X2Nvb3JkX3N0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgem9vbV9pbihrZXkpIHtcbiAgICAgICAgdGhpcy56IC09IHRoaXMuZ2V0X2Nvb3JkX3N0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgem9vbV9vdXQoa2V5KSB7XG4gICAgICAgIHRoaXMueiArPSB0aGlzLmdldF9jb29yZF9zdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZV9sZWZ0KGtleSkge1xuICAgICAgICB0aGlzLnBoaSAtPSB0aGlzLmNvbmZpZy5DQU1FUkFfQU5HTEVfU1RFUDtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcm90YXRlX3JpZ2h0KGtleSkge1xuICAgICAgICB0aGlzLnBoaSArPSB0aGlzLmNvbmZpZy5DQU1FUkFfQU5HTEVfU1RFUDtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICAgICAgdGhpcy5lbmdpbmUuY2FtZXJhX2NoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGdldF96b29tKHogPSAwLCBhbGxvd19pbnZpc2libGUgPSBmYWxzZSkge1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnogLSB6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPD0gMCkge1xuICAgICAgICAgICAgaWYgKCFhbGxvd19pbnZpc2libGUpIHRocm93IEludmlzaWJsZUVycm9yO1xuICAgICAgICAgICAgZGlzdGFuY2UgPSBJbmZpbml0eTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMTAwIC8gZGlzdGFuY2U7XG4gICAgfVxuXG4gICAgYWRqdXN0X2Nvb3JkKGNvb3JkLCBhbGxvd19pbnZpc2libGUgPSBmYWxzZSkge1xuICAgICAgICBjb25zdCBSID0gZ2V0X3JvdGF0aW9uX21hdHJpeChkZWcycmFkKHRoaXMucGhpKSk7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldF96b29tKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmNlbnRlciArIChyb3RhdGUoY29vcmQsIFIpIC0gW3RoaXMueCwgdGhpcy55XSkgKiB6b29tO1xuICAgIH1cblxuICAgIGFkanVzdF9yYWRpdXMoY29vcmQsIHJhZGl1cykge1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRfem9vbSgpO1xuICAgICAgICByZXR1cm4gcmFkaXVzICogem9vbTtcbiAgICB9XG5cbiAgICBhY3R1YWxfcG9pbnQoeCwgeSkge1xuICAgICAgICBjb25zdCBSXyA9IGdldF9yb3RhdGlvbl9tYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSksIC0xKTtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0X3pvb20oKTtcbiAgICAgICAgcmV0dXJuIHJvdGF0ZSgoW3gsIHldIC0gdGhpcy5jZW50ZXIpIC8gem9vbSArIFt0aGlzLngsIHRoaXMueV0sIFJfKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhMkQ7IiwiY29uc3QgQ2FtZXJhMkQgPSByZXF1aXJlKCcuLzJkJyk7XG5jb25zdCB7ZGVnMnJhZCwgcm90YXRlLCBnZXRfcm90YXRpb25feF9tYXRyaXgsIGdldF9yb3RhdGlvbl95X21hdHJpeH0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cblxuY2xhc3MgQ2FtZXJhM0QgZXh0ZW5kcyBDYW1lcmEyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBlbmdpbmUpIHtcbiAgICAgICAgc3VwZXIoY29uZmlnLCBlbmdpbmUpO1xuICAgICAgICB0aGlzLnRoZXRhID0gMDtcbiAgICB9XG5cbiAgICByb3RhdGVfdXAoa2V5KSB7XG4gICAgICAgIHRoaXMudGhldGEgLT0gdGhpcy5jb25maWcuQ0FNRVJBX0FOR0xFX1NURVA7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZV9kb3duKGtleSkge1xuICAgICAgICB0aGlzLnRoZXRhICs9IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBhZGp1c3RfY29vcmQoY29vcmQsIGFsbG93X2ludmlzaWJsZSA9IEZhbHNlKSB7XG4gICAgICAgIGNvbnN0IFJ4ID0gZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGRlZzJyYWQodGhpcy50aGV0YSkpO1xuICAgICAgICBjb25zdCBSeSA9IGdldF9yb3RhdGlvbl95X21hdHJpeChkZWcycmFkKHRoaXMucGhpKSk7XG4gICAgICAgIGNvbnN0IGMgPSByb3RhdGUocm90YXRlKGNvb3JkLCBSeCksIFJ5KTtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0X3pvb20oYy5wb3AoKSwgYWxsb3dfaW52aXNpYmxlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2VudGVyICsgKGMgLSBbdGhpcy54LCB0aGlzLnldKSAqIHpvb207XG4gICAgfVxuXG4gICAgYWRqdXN0X3JhZGl1cyhjb29yZCwgcmFkaXVzKSB7XG4gICAgICAgIGNvbnN0IFJ4ID0gZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGRlZzJyYWQodGhpcy50aGV0YSkpO1xuICAgICAgICBjb25zdCBSeSA9IGdldF9yb3RhdGlvbl95X21hdHJpeChkZWcycmFkKHRoaXMucGhpKSk7XG4gICAgICAgIGNvbnN0IGMgPSByb3RhdGUocm90YXRlKGNvb3JkLCBSeCksIFJ5KTtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0X3pvb20oYy5wb3AoKSk7XG4gICAgICAgIHJldHVybiByYWRpdXMgKiB6b29tO1xuICAgIH1cblxuICAgIGFjdHVhbF9wb2ludCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IFJ4XyA9IGdldF9yb3RhdGlvbl94X21hdHJpeChkZWcycmFkKHRoaXMudGhldGEpLCAtMSk7XG4gICAgICAgIGNvbnN0IFJ5XyA9IGdldF9yb3RhdGlvbl95X21hdHJpeChkZWcycmFkKHRoaXMucGhpKSwgLTEpO1xuICAgICAgICBjb25zdCBjID0gKChbeCwgeV0gLSB0aGlzLmNlbnRlcikgKyBbdGhpcy54LCB0aGlzLnldKS5jb25jYXQoMCk7XG4gICAgICAgIHJldHVybiByb3RhdGUocm90YXRlKGMsIFJ5XyksIFJ4Xyk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbWVyYTNEOyIsImNsYXNzIENvbnRyb2xCb3gge1xuICAgIGNvbnN0cnVjdG9yKHRpdGxlLCBjb250cm9sbGVycykge1xuICAgICAgICBjb25zdCAkY29udHJvbEJveCA9ICQoJy5jb250cm9sLWJveC50ZW1wbGF0ZScpLmNsb25lKCk7XG4gICAgICAgICRjb250cm9sQm94LnJlbW92ZUNsYXNzKCd0ZW1wbGF0ZScpO1xuICAgICAgICAkY29udHJvbEJveC5maW5kKCcudGl0bGUnKS50ZXh0KHRpdGxlKTtcbiAgICAgICAgY29uc3QgJGlucHV0Q29udGFpbmVyID0gJGNvbnRyb2xCb3guZmluZCgnLmlucHV0LWNvbnRhaW5lcicpO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbnRyb2xsZXIgb2YgY29udHJvbGxlcnMpIHtcbiAgICAgICAgICAgICRpbnB1dENvbnRhaW5lci5hcHBlbmQoY29udHJvbGxlci4kaW5wdXRXcmFwcGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuJGNvbnRyb2xCb3ggPSAkY29udHJvbEJveDtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLiRjb250cm9sQm94LnJlbW92ZSgpO1xuICAgIH1cbn0iLCJjbGFzcyBDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBtaW4sIG1heCwgdmFsdWUsIGZ1bmMpIHtcbiAgICAgICAgY29uc3QgJGlucHV0V3JhcHBlciA9ICQoJy5pbnB1dC13cmFwcGVyLnRlbXBsYXRlJykuY2xvbmUoKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5maW5kKCdzcGFuJykudGV4dChuYW1lKTtcbiAgICAgICAgY29uc3QgJGlucHV0ID0gJGlucHV0V3JhcHBlci5maW5kKCdpbnB1dCcpO1xuICAgICAgICAkaW5wdXQuYXR0cignbWluJywgbWluKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ21heCcsIG1heCk7XG4gICAgICAgICRpbnB1dC5hdHRyKCd2YWx1ZScsIHZhbHVlKTtcbiAgICAgICAgJGlucHV0LmNoYW5nZShmdW5jKTtcblxuICAgICAgICB0aGlzLiRpbnB1dFdyYXBwZXIgPSAkaW5wdXRXcmFwcGVyO1xuICAgICAgICB0aGlzLiRpbnB1dCA9ICRpbnB1dDtcbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRpbnB1dC52YWwoKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbGxlcjsiLCJjb25zdCBDaXJjbGUgPSByZXF1aXJlKCcuLi9vYmplY3QvY2lyY2xlJyk7XG5jb25zdCBDYW1lcmEyRCA9IHJlcXVpcmUoJy4uL2NhbWVyYS8yZCcpO1xuY29uc3QgSW52aXNpYmxlRXJyb3IgPSByZXF1aXJlKCcuLi9lcnJvci9pbnZpc2libGUnKTtcbmNvbnN0IHt2ZWN0b3JfbWFnbml0dWRlLCByb3RhdGUsIG5vdywgcmFuZG9tLCBwb2xhcjJjYXJ0ZXNpYW4sIHJhbmRfY29sb3IsIGdldF9yb3RhdGlvbl9tYXRyaXh9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge21pbn0gPSBNYXRoO1xuXG5cbmNsYXNzIFBhdGgge1xuICAgIGNvbnN0cnVjdG9yKHRhZywgb2JqKSB7XG4gICAgICAgIHRoaXMudGFnID0gdGFnO1xuICAgICAgICB0aGlzLnByZXZfcG9zID0gbmouY29weShvYmoucHJldl9wb3MpO1xuICAgICAgICB0aGlzLnBvcyA9IG5qLmNvcHkob2JqLnBvcyk7XG4gICAgfVxufVxuXG5jbGFzcyBFbmdpbmUyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBjYW52YXMpIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgICAgICB0aGlzLm9ianMgPSBbXTtcbiAgICAgICAgdGhpcy5hbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb250cm9sYm94ZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wYXRocyA9IFtdO1xuICAgICAgICB0aGlzLmNhbWVyYSA9IENhbWVyYTJEKGNvbmZpZywgdGhpcyk7XG4gICAgICAgIHRoaXMuY2FtZXJhX2NoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5mcHNfbGFzdF90aW1lID0gbm93KCk7XG4gICAgICAgIHRoaXMuZnBzX2NvdW50ID0gMDtcbiAgICB9XG5cbiAgICBkZXN0cm95X2NvbnRyb2xib3hlcygpIHtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sYm94IG9mIHRoaXMuY29udHJvbGJveGVzKSB7XG4gICAgICAgICAgICBjb250cm9sYm94LmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRyb2xib3hlcyA9IFtdXG4gICAgfVxuXG4gICAgYW5pbWF0ZSgpIHtcbiAgICAgICAgdGhpcy5wcmludF9mcHMoKTtcbiAgICAgICAgaWYgKHRoaXMuY2FtZXJhX2NoYW5nZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhX2NoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubW92ZV9wYXRocygpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGluZykge1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVfYWxsKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWRyYXdfYWxsKCk7XG4gICAgICAgIHRoaXMuY2FudmFzLmFmdGVyKDEwLCB0aGlzLmFuaW1hdGUpO1xuICAgIH1cblxuICAgIG9iamVjdF9jb29yZHMob2JqKSB7XG4gICAgICAgIGNvbnN0IHIgPSB0aGlzLmNhbWVyYS5hZGp1c3RfcmFkaXVzKG9iai5wb3MsIG9iai5nZXRfcigpKTtcbiAgICAgICAgW3gsIHldID0gdGhpcy5jYW1lcmEuYWRqdXN0X2Nvb3JkKG9iai5wb3MpO1xuICAgICAgICByZXR1cm4gW3ggLSByLCB5IC0gciwgeCArIHIsIHkgKyByXTtcbiAgICB9XG5cbiAgICBkaXJlY3Rpb25fY29vcmRzKG9iaikge1xuICAgICAgICBjb25zdCBbY3gsIGN5XSA9IHRoaXMuY2FtZXJhLmFkanVzdF9jb29yZChvYmoucG9zKTtcbiAgICAgICAgY29uc3QgW2R4LCBkeV0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmQob2JqLnBvcyArIG9iai52ICogNTAsIHRydWUpO1xuICAgICAgICByZXR1cm4gW2N4LCBjeSwgZHgsIGR5XTtcbiAgICB9XG5cbiAgICBwYXRoX2Nvb3JkcyhvYmopIHtcbiAgICAgICAgY29uc3QgW2Z4LCBmeV0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmQob2JqLnByZXZfcG9zKTtcbiAgICAgICAgY29uc3QgW3R4LCB0eV0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmQob2JqLnBvcyk7XG4gICAgICAgIHJldHVybiBbZngsIGZ5LCB0eCwgdHldO1xuICAgIH1cblxuICAgIGRyYXdfb2JqZWN0KG9iaikge1xuICAgICAgICBsZXQgYztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGMgPSB0aGlzLm9iamVjdF9jb29yZHMob2JqKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBJbnZpc2libGVFcnJvcikge1xuICAgICAgICAgICAgICAgIGMgPSBbMCwgMCwgMCwgMF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzLmNyZWF0ZV9vdmFsKGNbMF0sIGNbMV0sIGNbMl0sIGNbM10sIGZpbGwgPSBvYmouY29sb3IsIHRhZyA9IG9iai50YWcsIHdpZHRoID0gMCk7XG4gICAgfVxuXG4gICAgZHJhd19kaXJlY3Rpb24ob2JqKSB7XG4gICAgICAgIGxldCBjO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYyA9IHRoaXMub2JqZWN0X2Nvb3JkcyhvYmopO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIEludmlzaWJsZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgYyA9IFswLCAwLCAwLCAwXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXMuY3JlYXRlX2xpbmUoY1swXSwgY1sxXSwgY1syXSwgY1szXSwgZmlsbCA9IFwiYmxhY2tcIiwgdGFnID0gb2JqLmRpcl90YWcpO1xuICAgIH1cblxuICAgIGRyYXdfcGF0aChvYmopIHtcbiAgICAgICAgaWYgKHZlY3Rvcl9tYWduaXR1ZGUob2JqLnBvcyAtIG9iai5wcmV2X3BvcykgPiA1KSB7XG4gICAgICAgICAgICBsZXQgYztcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYyA9IHRoaXMub2JqZWN0X2Nvb3JkcyhvYmopO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgSW52aXNpYmxlRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYyA9IFswLCAwLCAwLCAwXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucGF0aHMuYXBwZW5kKFBhdGgodGhpcy5jYW52YXMuY3JlYXRlX2xpbmUoY1swXSwgY1sxXSwgY1syXSwgY1szXSwgZmlsbCA9IFwiZ3JleVwiKSwgb2JqKSk7XG4gICAgICAgICAgICBvYmoucHJldl9wb3MgPSBuai5jb3B5KG9iai5wb3MpO1xuICAgICAgICAgICAgaWYgKHRoaXMucGF0aHMubGVuZ3RoID4gdGhpcy5jb25maWcuTUFYX1BBVEhTKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMuZGVsZXRlKHRoaXMucGF0aHNbMF0udGFnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGhzID0gdGhpcy5wYXRocy5zbGljZSgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1vdmVfb2JqZWN0KG9iaikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYyA9IHRoaXMub2JqZWN0X2Nvb3JkcyhvYmopO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuY29vcmRzKG9iai50YWcsIGNbMF0sIGNbMV0sIGNbMl0sIGNbM10pO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuaXRlbWNvbmZpZ3VyZShvYmoudGFnLCBzdGF0ZSA9ICdub3JtYWwnKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBJbnZpc2libGVFcnJvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLml0ZW1jb25maWd1cmUob2JqLnRhZywgc3RhdGUgPSAnaGlkZGVuJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3ZlX2RpcmVjdGlvbihvYmopIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGMgPSB0aGlzLmRpcmVjdGlvbl9jb29yZHMob2JqKTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLmNvb3JkcyhvYmouZGlyX3RhZywgY1swXSwgY1sxXSwgY1syXSwgY1szXSk7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5pdGVtY29uZmlndXJlKG9iai5kaXJfdGFnLCBzdGF0ZSA9ICdub3JtYWwnKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBJbnZpc2libGVFcnJvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLml0ZW1jb25maWd1cmUob2JqLmRpcl90YWcsIHN0YXRlID0gJ2hpZGRlbicpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW92ZV9wYXRocygpIHtcbiAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHRoaXMucGF0aHMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYyA9IHRoaXMucGF0aF9jb29yZHMocGF0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMuY29vcmRzKHBhdGgudGFnLCBjWzBdLCBjWzFdLCBjWzJdLCBjWzNdKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5pdGVtY29uZmlndXJlKHBhdGgudGFnLCBzdGF0ZSA9ICdub3JtYWwnKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIEludmlzaWJsZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLml0ZW1jb25maWd1cmUocGF0aC50YWcsIHN0YXRlID0gJ2hpZGRlbicpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlX29iamVjdCh4LCB5LCBtID0gbnVsbCwgdiA9IG51bGwsIGNvbG9yID0gbnVsbCwgY29udHJvbGJveCA9IHRydWUpIHtcbiAgICAgICAgY29uc3QgcG9zID0gbmouYXJyYXkodGhpcy5jYW1lcmEuYWN0dWFsX3BvaW50KHgsIHkpKTtcbiAgICAgICAgaWYgKCFtKSB7XG4gICAgICAgICAgICBsZXQgbWF4X3IgPSBDaXJjbGUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgICAgIG1heF9yID0gbWluKG1heF9yLCAodmVjdG9yX21hZ25pdHVkZShvYmoucG9zIC0gcG9zKSAtIG9iai5nZXRfcigpKSAvIDEuNSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG0gPSBDaXJjbGUuZ2V0X21fZnJvbV9yKHJhbmRvbShDaXJjbGUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUlOKSwgbWF4X3IpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXYpIHtcbiAgICAgICAgICAgIHYgPSBuai5hcnJheShwb2xhcjJjYXJ0ZXNpYW4ocmFuZG9tKHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCAvIDIpLCByYW5kb20oLTE4MCwgMTgwKSkpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb2xvcikge1xuICAgICAgICAgICAgY29sb3IgPSByYW5kX2NvbG9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGFnID0gYGNpcmNsZSR7dGhpcy5vYmpzLmxlbmd0aH1gO1xuICAgICAgICBjb25zdCBkaXJfdGFnID0gdGFnICsgXCJfZGlyXCI7XG4gICAgICAgIGNvbnN0IG9iaiA9IENpcmNsZSh0aGlzLmNvbmZpZywgbSwgcG9zLCB2LCBjb2xvciwgdGFnLCBkaXJfdGFnLCB0aGlzLCBjb250cm9sYm94KTtcbiAgICAgICAgdGhpcy5vYmpzLmFwcGVuZChvYmopO1xuICAgICAgICB0aGlzLmRyYXdfb2JqZWN0KG9iaik7XG4gICAgICAgIHRoaXMuZHJhd19kaXJlY3Rpb24ob2JqKTtcbiAgICB9XG5cbiAgICBnZXRfcm90YXRpb25fbWF0cml4KGFuZ2xlcywgZGlyID0gMSkge1xuICAgICAgICByZXR1cm4gZ2V0X3JvdGF0aW9uX21hdHJpeChhbmdsZXNbMF0sIGRpcik7XG4gICAgfVxuXG4gICAgZWxhc3RpY19jb2xsaXNpb24oKSB7XG4gICAgICAgIGNvbnN0IGRpbWVuc2lvbiA9IHRoaXMuY29uZmlnLkRJTUVOU0lPTjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9ianMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG8xID0gdGhpcy5vYmpzW2ldO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgdGhpcy5vYmpzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbzIgPSB0aGlzLm9ianNbal07XG4gICAgICAgICAgICAgICAgY29uc3QgY29sbGlzaW9uID0gbzIucG9zIC0gbzEucG9zO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFuZ2xlcyA9IGNhcnRlc2lhbjJhdXRvKGNvbGxpc2lvbik7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IGFuZ2xlcy5zaGlmdCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGQgPCBvMS5nZXRfcigpICsgbzIuZ2V0X3IoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBSID0gdGhpcy5nZXRfcm90YXRpb25fbWF0cml4KGFuZ2xlcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFJfID0gdGhpcy5nZXRfcm90YXRpb25fbWF0cml4KGFuZ2xlcywgLTEpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZfdGVtcCA9IFtyb3RhdGUobzEudiwgUiksIHJvdGF0ZShvMi52LCBSKV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZfZmluYWwgPSBuai5jb3B5KHZfdGVtcCk7XG4gICAgICAgICAgICAgICAgICAgIHZfZmluYWxbMF1bMF0gPSAoKG8xLm0gLSBvMi5tKSAqIHZfdGVtcFswXVswXSArIDIgKiBvMi5tICogdl90ZW1wWzFdWzBdKSAvIChvMS5tICsgbzIubSk7XG4gICAgICAgICAgICAgICAgICAgIHZfZmluYWxbMV1bMF0gPSAoKG8yLm0gLSBvMS5tKSAqIHZfdGVtcFsxXVswXSArIDIgKiBvMS5tICogdl90ZW1wWzBdWzBdKSAvIChvMS5tICsgbzIubSk7XG4gICAgICAgICAgICAgICAgICAgIG8xLnYgPSByb3RhdGUodl9maW5hbFswXSwgUl8pO1xuICAgICAgICAgICAgICAgICAgICBvMi52ID0gcm90YXRlKHZfZmluYWxbMV0sIFJfKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3NfdGVtcCA9IFtbMF0gKiBkaW1lbnNpb24sIHJvdGF0ZShjb2xsaXNpb24sIFIpXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zX3RlbXBbMF1bMF0gKz0gdl9maW5hbFswXVswXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zX3RlbXBbMV1bMF0gKz0gdl9maW5hbFsxXVswXTtcbiAgICAgICAgICAgICAgICAgICAgbzEucG9zID0gbzEucG9zICsgcm90YXRlKHBvc190ZW1wWzBdLCBSXyk7XG4gICAgICAgICAgICAgICAgICAgIG8yLnBvcyA9IG8xLnBvcyArIHJvdGF0ZShwb3NfdGVtcFsxXSwgUl8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhbGN1bGF0ZV9hbGwoKSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgb2JqLmNhbGN1bGF0ZV92ZWxvY2l0eSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGFzdGljX2NvbGxpc2lvbigpO1xuXG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgb2JqLmNhbGN1bGF0ZV9wb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVkcmF3X2FsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBvYmoucmVkcmF3KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmludF9mcHMoKSB7XG4gICAgICAgIHRoaXMuZnBzX2NvdW50ICs9IDE7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRfdGltZSA9IG5vdygpO1xuICAgICAgICBjb25zdCBmcHNfdGltZV9kaWZmID0gY3VycmVudF90aW1lIC0gdGhpcy5mcHNfbGFzdF90aW1lXG4gICAgICAgIGlmIChmcHNfdGltZV9kaWZmID4gMSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7KHRoaXMuZnBzX2NvdW50IC8gZnBzX3RpbWVfZGlmZikgfCAwfSBmcHNgKTtcbiAgICAgICAgICAgIHRoaXMuZnBzX2xhc3RfdGltZSA9IGN1cnJlbnRfdGltZTtcbiAgICAgICAgICAgIHRoaXMuZnBzX2NvdW50ID0gMDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmUyRDsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vMmQnKTtcbmNvbnN0IENhbWVyYTNEID0gcmVxdWlyZSgnLi4vY2FtZXJhLzNkJyk7XG5jb25zdCBTcGhlcmUgPSByZXF1aXJlKCcuLi9vYmplY3Qvc3BoZXJlJyk7XG5jb25zdCB7dmVjdG9yX21hZ25pdHVkZSwgcmFuZG9tLCBnZXRfcm90YXRpb25feF9tYXRyaXgsIGdldF9yb3RhdGlvbl96X21hdHJpeCwgcmFuZF9jb2xvciwgc3BoZXJpY2FsMmNhcnRlc2lhbn0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7bWlufSA9IE1hdGg7XG5cblxuY2xhc3MgRW5naW5lM0QgZXh0ZW5kcyBFbmdpbmUyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBjYW52YXMpIHtcbiAgICAgICAgc3VwZXIoY29uZmlnLCBjYW52YXMpO1xuICAgICAgICB0aGlzLmNhbWVyYSA9IENhbWVyYTNEKGNvbmZpZywgdGhpcyk7XG4gICAgfVxuXG5cbiAgICBjcmVhdGVfb2JqZWN0KHgsIHksIG0gPSBOb25lLCB2ID0gTm9uZSwgY29sb3IgPSBOb25lLCBjb250cm9sYm94ID0gVHJ1ZSkge1xuICAgICAgICBjb25zdCBwb3MgPSBuai5hcnJheSh0aGlzLmNhbWVyYS5hY3R1YWxfcG9pbnQoeCwgeSkpO1xuICAgICAgICBpZiAoIW0pIHtcbiAgICAgICAgICAgIGxldCBtYXhfciA9IFNwaGVyZS5nZXRfcl9mcm9tX20odGhpcy5jb25maWcuTUFTU19NQVgpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICAgICAgbWF4X3IgPSBtaW4obWF4X3IsICh2ZWN0b3JfbWFnbml0dWRlKG9iai5wb3MgLSBwb3MpIC0gb2JqLmdldF9yKCkpIC8gMS41KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG0gPSBTcGhlcmUuZ2V0X21fZnJvbV9yKHJhbmRvbShTcGhlcmUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUlOKSwgbWF4X3IpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXYpIHtcbiAgICAgICAgICAgIHYgPSBuai5hcnJheShzcGhlcmljYWwyY2FydGVzaWFuKFxuICAgICAgICAgICAgICAgIHJhbmRvbSh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVggLyAyKSxcbiAgICAgICAgICAgICAgICByYW5kb20oLTE4MCwgMTgwKSxcbiAgICAgICAgICAgICAgICByYW5kb20oLTE4MCwgMTgwKSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY29sb3IpIHtcbiAgICAgICAgICAgIGNvbG9yID0gcmFuZF9jb2xvcigpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRhZyA9IGBzcGhlcmUke3RoaXMub2Jqcy5sZW5ndGh9YDtcbiAgICAgICAgY29uc3QgZGlyX3RhZyA9IHRhZyArIFwiX2RpclwiO1xuICAgICAgICBjb25zdCBvYmogPSBTcGhlcmUodGhpcy5jb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgZGlyX3RhZywgdGhpcywgY29udHJvbGJveCk7XG4gICAgICAgIHRoaXMub2Jqcy5hcHBlbmQob2JqKTtcbiAgICAgICAgdGhpcy5kcmF3X29iamVjdChvYmopO1xuICAgICAgICB0aGlzLmRyYXdfZGlyZWN0aW9uKG9iaik7XG4gICAgfVxuXG4gICAgZ2V0X3JvdGF0aW9uX21hdHJpeChhbmdsZXMsIGRpciA9IDEpIHtcbiAgICAgICAgcmV0dXJuIGRpciA9PSAxXG4gICAgICAgICAgICA/IGdldF9yb3RhdGlvbl96X21hdHJpeChhbmdsZXNbMF0pICogZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGFuZ2xlc1sxXSlcbiAgICAgICAgICAgIDogZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGFuZ2xlc1sxXSwgLTEpICogZ2V0X3JvdGF0aW9uX3pfbWF0cml4KGFuZ2xlc1swXSwgLTEpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmUzRDsiLCJjbGFzcyBJbnZpc2libGVFcnJvciBleHRlbmRzIEVycm9yIHtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnZpc2libGVFcnJvcjsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vZW5naW5lLzJkJyk7XG5jb25zdCBFbmdpbmUzRCA9IHJlcXVpcmUoJy4vZW5naW5lLzNkJyk7XG5jb25zdCB7fSA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5cbmxldCBjb25maWcgPSB7fTtcbmNvbnN0IGtleW1hcCA9IHtcbiAgICAnXFx1ZjcwMCc6ICd1cCcsXG4gICAgJ1xcdWY3MDEnOiAnZG93bicsXG4gICAgJ1xcdWY3MDInOiAnbGVmdCcsXG4gICAgJ1xcdWY3MDMnOiAncmlnaHQnLFxuICAgICd6JzogJ3pvb21faW4nLFxuICAgICd4JzogJ3pvb21fb3V0JyxcbiAgICAndyc6ICdyb3RhdGVfdXAnLFxuICAgICdzJzogJ3JvdGF0ZV9kb3duJyxcbiAgICAnYSc6ICdyb3RhdGVfbGVmdCcsXG4gICAgJ2QnOiAncm90YXRlX3JpZ2h0J1xufTtcblxuY2xhc3MgU2ltdWxhdG9yIHtcbiAgICBjb25zdHJ1Y3RvcihwcmVzZXQpIHtcbiAgICAgICAgcHJlc2V0KGNvbmZpZyk7XG4gICAgICAgIGNvbnN0ICRjYW52YXMgPSAkKCdjYW52YXMnKTtcbiAgICAgICAgY29uc3QgY3R4ID0gJGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IChjb25maWcuRElNRU5TSU9OID09IDIgPyBFbmdpbmUyRCA6IEVuZ2luZTNEKShjb25maWcsIGN0eCk7XG4gICAgICAgICRjYW52YXMua2V5cHJlc3ModGhpcy5vbl9rZXlfcHJlc3MoKSk7XG4gICAgICAgICRjYW52YXMuY2xpY2sodGhpcy5vbl9jbGljaygpKTtcbiAgICB9XG5cbiAgICBhbmltYXRlKCkge1xuICAgICAgICB0aGlzLmVuZ2luZS5hbmltYXRlKCk7XG4gICAgfVxuXG4gICAgb25fY2xpY2soZXZlbnQpIHtcbiAgICAgICAgY29uc3Qge3gsIHl9ID0gZXZlbnQ7XG4gICAgICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuZW5naW5lO1xuICAgICAgICBpZiAoIWVuZ2luZS5hbmltYXRpbmcpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIGVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICAgICAgYyA9IGVuZ2luZS5vYmplY3RfY29vcmRzKG9iaik7XG4gICAgICAgICAgICAgICAgY3ggPSAoY1swXSArIGNbMl0pIC8gMjtcbiAgICAgICAgICAgICAgICBjeSA9IChjWzFdICsgY1szXSkgLyAyO1xuICAgICAgICAgICAgICAgIHIgPSAoY1syXSAtIGNbMF0pIC8gMjtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0X2Rpc3RhbmNlKGN4LCBjeSwgeCwgeSkgPCByKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5zaG93X2NvbnRyb2xib3goKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVfb2JqZWN0KGV2ZW50LngsIGV2ZW50LnkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25fa2V5X3ByZXNzKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHtjaGFyfSA9IGV2ZW50O1xuICAgICAgICBjb25zdCBlbmdpbmUgPSB0aGlzLmVuZ2luZTtcbiAgICAgICAgaWYgKGNoYXIgPT0gJyAnKSB7XG4gICAgICAgICAgICBlbmdpbmUuZGVzdHJveV9jb250cm9sYm94ZXMoKTtcbiAgICAgICAgICAgIGVuZ2luZS5hbmltYXRpbmcgPSAhZW5naW5lLmFuaW1hdGluZztcbiAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gYCR7Y29uZmlnLlRJVExFfSAoJHtlbmdpbmUuYW5pbWF0aW5nID8gXCJTaW11bGF0aW5nXCIgOiBcIlBhdXNlZFwifSlgO1xuICAgICAgICB9IGVsc2UgaWYgKGNoYXIgaW4ga2V5bWFwICYmIGtleW1hcFtjaGFyXSBpbiBlbmdpbmUuY2FtZXJhKSB7XG4gICAgICAgICAgICBlbmdpbmUuY2FtZXJhW2tleW1hcFtjaGFyXV0oY2hhcik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2ltdWxhdG9yOyIsImNvbnN0IENvbnRyb2xCb3ggPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xfYm94Jyk7XG5jb25zdCBDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sbGVyJyk7XG5jb25zdCB7dmVjdG9yX21hZ25pdHVkZSwgcmFkMmRlZywgZGVnMnJhZCwgcG9sYXIyY2FydGVzaWFuLCBjYXJ0ZXNpYW4yYXV0bywgc3F1YXJlfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHttYXgsIHBvd30gPSBNYXRoO1xuXG5cbmNsYXNzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogUG9sYXIgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Qb2xhcl9jb29yZGluYXRlX3N5c3RlbVxuICAgICAqL1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIGRpcl90YWcsIGVuZ2luZSwgY29udHJvbGJveCkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMucHJldl9wb3MgPSBuai5jb3B5KHBvcyk7XG4gICAgICAgIHRoaXMudiA9IHY7XG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgdGhpcy50YWcgPSB0YWc7XG4gICAgICAgIHRoaXMuZGlyX3RhZyA9IGRpcl90YWc7XG4gICAgICAgIHRoaXMuZW5naW5lID0gZW5naW5lO1xuXG4gICAgICAgIHRoaXMuY29udHJvbGJveCA9IG51bGw7XG4gICAgICAgIGlmIChjb250cm9sYm94KSB7XG4gICAgICAgICAgICB0aGlzLnNob3dfY29udHJvbGJveCgpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRfcigpIHtcbiAgICAgICAgcmV0dXJuIENpcmNsZS5nZXRfcl9mcm9tX20odGhpcy5tKVxuICAgIH1cblxuICAgIGNhbGN1bGF0ZV92ZWxvY2l0eSgpIHtcbiAgICAgICAgbGV0IEYgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLmVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICBpZiAob2JqID09IHRoaXMpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgdmVjdG9yID0gdGhpcy5wb3MgLSBvYmoucG9zO1xuICAgICAgICAgICAgY29uc3QgbWFnbml0dWRlID0gdmVjdG9yX21hZ25pdHVkZSh2ZWN0b3IpO1xuICAgICAgICAgICAgY29uc3QgdW5pdF92ZWN0b3IgPSB2ZWN0b3IgLyBtYWduaXR1ZGU7XG4gICAgICAgICAgICBGICs9IG9iai5tIC8gc3F1YXJlKG1hZ25pdHVkZSkgKiB1bml0X3ZlY3RvclxuICAgICAgICB9XG4gICAgICAgIEYgKj0gLXRoaXMuY29uZmlnLkcgKiB0aGlzLm07XG4gICAgICAgIGNvbnN0IGEgPSBGIC8gdGhpcy5tO1xuICAgICAgICB0aGlzLnYgKz0gYVxuICAgIH1cblxuICAgIGNhbGN1bGF0ZV9wb3NpdGlvbigpIHtcbiAgICAgICAgdGhpcy5wb3MgKz0gdGhpcy52XG4gICAgfVxuXG4gICAgY29udHJvbF9tKGUpIHtcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubV9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLm0gPSBtO1xuICAgICAgICB0aGlzLnJlZHJhdygpO1xuICAgIH1cblxuICAgIGNvbnRyb2xfcG9zKGUpIHtcbiAgICAgICAgY29uc3QgeCA9IHRoaXMucG9zX3hfY29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgeSA9IHRoaXMucG9zX3lfY29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5wb3MgPSBuai5hcnJheShbeCwgeV0pO1xuICAgICAgICB0aGlzLnJlZHJhdygpO1xuICAgIH1cblxuICAgIGNvbnRyb2xfdihlKSB7XG4gICAgICAgIGNvbnN0IHBoaSA9IGRlZzJyYWQodGhpcy52X3BoaV9jb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgY29uc3QgcmhvID0gdGhpcy52X3Job19jb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnYgPSBuai5hcnJheShwb2xhcjJjYXJ0ZXNpYW4ocmhvLCBwaGkpKTtcbiAgICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICB9XG5cbiAgICBzaG93X2NvbnRyb2xib3goKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xib3gudGsubGlmdCgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zdCBtYXJnaW4gPSAxLjU7XG5cbiAgICAgICAgICAgIHZhciBwb3NfcmFuZ2UgPSBtYXgobWF4KHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpIC8gMiwgbWF4LmFwcGx5KG51bGwsIHRoaXMucG9zLm1hcChNYXRoLmFicykpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICBwb3NfcmFuZ2UgPSBtYXgocG9zX3JhbmdlLCBtYXguYXBwbHkobnVsbCwgb2JqLnBvcy5tYXAoTWF0aC5hYnMpKSAqIG1hcmdpbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XG5cbiAgICAgICAgICAgIGNvbnN0IHYgPSBjYXJ0ZXNpYW4yYXV0byh0aGlzLnYpO1xuICAgICAgICAgICAgdmFyIHZfcmFuZ2UgPSBtYXgodGhpcy5jb25maWcuVkVMT0NJVFlfTUFYLCB2ZWN0b3JfbWFnbml0dWRlKHRoaXMudikgKiBtYXJnaW4pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgICAgIHZfcmFuZ2UgPSBtYXgodl9yYW5nZSwgdmVjdG9yX21hZ25pdHVkZShvYmoudikgKiBtYXJnaW4pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xib3ggPSBDb250cm9sQm94KHRoaXMudGFnLCB0aGlzLmdldF9jb250cm9sbGVycygpKTtcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLmNvbnRyb2xib3hlcy5hcHBlbmQodGhpcy5jb250cm9sYm94LnRrKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0dXBfY29udHJvbGxlcnMocG9zX3JhbmdlLCBtLCB2LCB2X3JhbmdlKSB7XG4gICAgICAgIHRoaXMubV9jb250cm9sbGVyID0gQ29udHJvbGxlcihcIk1hc3MgbVwiLCB0aGlzLmNvbmZpZy5NQVNTX01JTiwgdGhpcy5jb25maWcuTUFTU19NQVgsIG0sIHRoaXMuY29udHJvbF9tKTtcbiAgICAgICAgdGhpcy5wb3NfeF9jb250cm9sbGVyID0gQ29udHJvbGxlcihcIlBvc2l0aW9uIHhcIiwgLXBvc19yYW5nZSwgcG9zX3JhbmdlLCB0aGlzLnBvc1swXSwgdGhpcy5jb250cm9sX3Bvcyk7XG4gICAgICAgIHRoaXMucG9zX3lfY29udHJvbGxlciA9IENvbnRyb2xsZXIoXCJQb3NpdGlvbiB5XCIsIC1wb3NfcmFuZ2UsIHBvc19yYW5nZSwgdGhpcy5wb3NbMV0sIHRoaXMuY29udHJvbF9wb3MpO1xuICAgICAgICB0aGlzLnZfcmhvX2NvbnRyb2xsZXIgPSBDb250cm9sbGVyKFwiVmVsb2NpdHkgz4FcIiwgMCwgdl9yYW5nZSwgdlswXSwgdGhpcy5jb250cm9sX3YpO1xuICAgICAgICB0aGlzLnZfcGhpX2NvbnRyb2xsZXIgPSBDb250cm9sbGVyKFwiVmVsb2NpdHkgz4ZcIiwgLTE4MCwgMTgwLCByYWQyZGVnKHZbMV0pLCB0aGlzLmNvbnRyb2xfdik7XG4gICAgfVxuXG4gICAgZ2V0X2NvbnRyb2xsZXJzKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgdGhpcy5tX2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc194X2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc195X2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZfcmhvX2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZfcGhpX2NvbnRyb2xsZXJcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICByZWRyYXcoKSB7XG4gICAgICAgIHRoaXMuZW5naW5lLm1vdmVfb2JqZWN0KHRoaXMpO1xuICAgICAgICB0aGlzLmVuZ2luZS5tb3ZlX2RpcmVjdGlvbih0aGlzKTtcbiAgICAgICAgdGhpcy5lbmdpbmUuZHJhd19wYXRoKHRoaXMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRfcl9mcm9tX20obSkge1xuICAgICAgICByZXR1cm4gcG93KG0sIDEgLyAyKVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRfbV9mcm9tX3Iocikge1xuICAgICAgICByZXR1cm4gc3F1YXJlKHIpXG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7J3RhZyc6IHRoaXMudGFnLCAndic6IHRoaXMudiwgJ3Bvcyc6IHRoaXMucG9zfSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENpcmNsZTsiLCJjb25zdCBDaXJjbGUgPSByZXF1aXJlKCcuL2NpcmNsZScpO1xuY29uc3QgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbGxlcicpO1xuY29uc3Qge3JhZDJkZWcsIGRlZzJyYWQsIHNwaGVyaWNhbDJjYXJ0ZXNpYW59ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge2N1YmV9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3Bvd30gPSBNYXRoO1xuXG5cbmNsYXNzIFNwaGVyZSBleHRlbmRzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogU3BoZXJpY2FsIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3BoZXJpY2FsX2Nvb3JkaW5hdGVfc3lzdGVtXG4gICAgICovXG5cbiAgICBnZXRfcigpIHtcbiAgICAgICAgcmV0dXJuIFNwaGVyZS5nZXRfcl9mcm9tX20odGhpcy5tKTtcbiAgICB9XG5cbiAgICBjb250cm9sX3BvcyhlKSB7XG4gICAgICAgIGNvbnN0IHggPSB0aGlzLnBvc194X2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc195X2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHogPSB0aGlzLnBvc196X2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMucG9zID0gbmouYXJyYXkoW3gsIHksIHpdKTtcbiAgICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICB9XG5cbiAgICBjb250cm9sX3YoZSkge1xuICAgICAgICBjb25zdCBwaGkgPSBkZWcycmFkKHRoaXMudl9waGlfY29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHRoZXRhID0gZGVnMnJhZCh0aGlzLnZfdGhldGFfY29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHJobyA9IHRoaXMudl9yaG9fY29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy52ID0gbmouYXJyYXkoc3BoZXJpY2FsMmNhcnRlc2lhbihyaG8sIHBoaSwgdGhldGEpKTtcbiAgICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICB9XG5cbiAgICBzZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHYsIHZfcmFuZ2UpIHtcbiAgICAgICAgc3VwZXIuc2V0dXBfY29udHJvbGxlcnMocG9zX3JhbmdlLCBtLCB2LCB2X3JhbmdlKTtcbiAgICAgICAgdGhpcy5wb3Nfel9jb250cm9sbGVyID0gQ29udHJvbGxlcihcIlBvc2l0aW9uIHpcIiwgLXBvc19yYW5nZSwgcG9zX3JhbmdlLCB0aGlzLnBvc1syXSwgdGhpcy5jb250cm9sX3Bvcyk7XG4gICAgICAgIHRoaXMudl90aGV0YV9jb250cm9sbGVyID0gQ29udHJvbGxlcihcIlZlbG9jaXR5IM64XCIsIC0xODAsIDE4MCwgcmFkMmRlZyh2WzJdKSwgdGhpcy5jb250cm9sX3YpO1xuICAgIH1cblxuICAgIGdldF9jb250cm9sbGVycygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRoaXMubV9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NfeF9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NfeV9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3Nfel9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52X3Job19jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52X3BoaV9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52X3RoZXRhX2NvbnRyb2xsZXJcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0X3JfZnJvbV9tKG0pIHtcbiAgICAgICAgcmV0dXJuIHBvdyhtLCAxIC8gMyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldF9tX2Zyb21fcihyKSB7XG4gICAgICAgIHJldHVybiBjdWJlKHIpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTcGhlcmU7IiwiY29uc3QgVXRpbCA9IHtcbiAgICBzcXVhcmU6ICh4KSA9PiB7XG4gICAgICAgIHJldHVybiB4ICogeDtcbiAgICB9LFxuXG4gICAgY3ViZTogKHgpID0+IHtcbiAgICAgICAgcmV0dXJuIHggKiB4ICogeDtcbiAgICB9LFxuXG4gICAgcG9sYXIyY2FydGVzaWFuOiAocmhvLCBwaGkpID0+IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHJobyAqIE1hdGguY29zKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLnNpbihwaGkpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJwb2xhcjogKHgsIHkpID0+IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIE1hdGguc3FydChVdGlsLnNxdWFyZSh4KSArIFV0aWwuc3F1YXJlKHkpKSxcbiAgICAgICAgICAgIE1hdGguYXRhbjIoeCwgeSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgc3BoZXJpY2FsMmNhcnRlc2lhbjogKHJobywgcGhpLCB0aGV0YSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguc2luKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyh0aGV0YSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMnNwaGVyaWNhbDogKHgsIHksIHopID0+IHtcbiAgICAgICAgY29uc3QgcmhvID0gTWF0aC5zcXJ0KFV0aWwuc3F1YXJlKHgpICsgVXRpbC5zcXVhcmUoeSkgKyBVdGlsLnNxdWFyZSh6KSk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8sXG4gICAgICAgICAgICBNYXRoLmF0YW4yKHgsIHkpLFxuICAgICAgICAgICAgcmhvICE9IDAgPyBNYXRoLmFjb3MoeiAvIHJobykgOiAwXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJhdXRvOiAodmVjdG9yKSA9PiB7XG4gICAgICAgIHJldHVybiB2ZWN0b3IubGVuZ3RoID09IDJcbiAgICAgICAgICAgID8gY2FydGVzaWFuMnBvbGFyKHZlY3RvclswXSwgdmVjdG9yWzFdKVxuICAgICAgICAgICAgOiBjYXJ0ZXNpYW4yc3BoZXJpY2FsKHZlY3RvclswXSwgdmVjdG9yWzFdLCB2ZWN0b3JbMl0pO1xuICAgIH0sXG5cbiAgICByYWQyZGVnOiAocmFkKSA9PiB7XG4gICAgICAgIHJldHVybiByYWQgLyBNYXRoLnBpICogMTgwO1xuICAgIH0sXG5cbiAgICBkZWcycmFkOiAoZGVnKSA9PiB7XG4gICAgICAgIHJldHVybiBkZWcgLyAxODAgKiBNYXRoLnBpO1xuICAgIH0sXG5cbiAgICBnZXRfZGlzdGFuY2U6ICh4MCwgeTAsIHgxLCB5MSkgPT4ge1xuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KFV0aWwuc3F1YXJlKHgxIC0geDApICsgVXRpbC5zcXVhcmUoeTEgLSB5MCkpO1xuICAgIH0sXG5cbiAgICB2ZWN0b3JfbWFnbml0dWRlOiAodmVjdG9yKSA9PiB7XG4gICAgICAgIHJldHVybiBuai5saW5hbGcubm9ybSh2ZWN0b3IpO1xuICAgIH0sXG5cbiAgICBjMmQ6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIG5qLmFycmF5KFswLCAwXSk7XG4gICAgfSxcblxuICAgIHJvdGF0ZTogKHZlY3RvciwgbWF0cml4KSA9PiB7XG4gICAgICAgIHJldHVybiAodmVjdG9yICogbWF0cml4KS5nZXRBKClbMF07XG4gICAgfSxcblxuICAgIG5vdzogKCkgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwO1xuICAgIH0sXG5cbiAgICByYW5kb206IChtaW4sIG1heCA9IG51bGwpID0+IHtcbiAgICAgICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICAgICAgICBtYXggPSBtaW47XG4gICAgICAgICAgICBtaW4gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG4gICAgfSxcblxuICAgIHJhbmRfY29sb3I6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuICcjJyArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE2Nzc3MjE1KS50b1N0cmluZygxNik7XG4gICAgfSxcblxuICAgIGdldF9yb3RhdGlvbl9tYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIG5qLm1hdHJpeChbXG4gICAgICAgICAgICBbY29zLCAtc2luXSxcbiAgICAgICAgICAgIFtzaW4sIGNvc11cbiAgICAgICAgXSk7XG4gICAgfSxcblxuICAgIGdldF9yb3RhdGlvbl94X21hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gbmoubWF0cml4KFtcbiAgICAgICAgICAgIFsxLCAwLCAwXSxcbiAgICAgICAgICAgIFswLCBjb3MsIC1zaW5dLFxuICAgICAgICAgICAgWzAsIHNpbiwgY29zXVxuICAgICAgICBdKTtcbiAgICB9LFxuXG4gICAgZ2V0X3JvdGF0aW9uX3lfbWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBuai5tYXRyaXgoW1xuICAgICAgICAgICAgW2NvcywgMCwgLXNpbl0sXG4gICAgICAgICAgICBbMCwgMSwgMF0sXG4gICAgICAgICAgICBbc2luLCAwLCBjb3NdXG4gICAgICAgIF0pO1xuICAgIH0sXG5cbiAgICBnZXRfcm90YXRpb25fel9tYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIG5qLm1hdHJpeChbXG4gICAgICAgICAgICBbY29zLCAtc2luLCAwXSxcbiAgICAgICAgICAgIFtzaW4sIGNvcywgMF0sXG4gICAgICAgICAgICBbMCwgMCwgMV1cbiAgICAgICAgXSk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsOyJdfQ==

//# sourceMappingURL=gravity_simulator.js.map
