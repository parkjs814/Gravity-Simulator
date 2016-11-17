const Circle = require('../object/circle');
const {vector_magnitude, deg2rad, rotate, now, random, polar2cartesian, rand_color} = require('../util');


class InvisibleError extends Error {
}

class Path {
    constructor(tag, obj) {
        this.tag = tag;
        this.prev_pos = np.copy(obj.prev_pos);
        this.pos = np.copy(obj.pos);
    }
}

class Camera2D {
    constructor(config, engine) {
        this.config = config;
        this.x = 0;
        this.y = 0;
        this.z = 100;
        this.phi = 0;
        this.engine = engine;
        this.last_time = 0;
        this.last_key = null;
        this.combo = 0;
        this.center = np.array([config.W / 2, config.H / 2]);
    }

    get_coord_step(key) {
        const current_time = now();
        if (key == this.last_key && current_time - this.last_time < 1) {
            this.combo += 1;
        } else {
            this.combo = 0;
        }
        this.last_time = current_time;
        this.last_key = key;
        return this.config.CAMERA_COORD_STEP * this.config.CAMERA_ACCELERATION ** this.combo;
    }

    up(key) {
        this.y -= this.get_coord_step(key);
        this.refresh();
    }

    down(key) {
        this.y += this.get_coord_step(key);
        this.refresh();
    }

    left(key) {
        this.x -= this.get_coord_step(key);
        this.refresh();
    }

    right(key) {
        this.x += this.get_coord_step(key);
        this.refresh();
    }

    zoom_in(key) {
        this.z -= this.get_coord_step(key);
        this.refresh();
    }

    zoom_out(key) {
        this.z += this.get_coord_step(key);
        this.refresh();
    }

    rotate_left(key) {
        this.phi -= this.config.CAMERA_ANGLE_STEP;
        this.refresh();
    }

    rotate_right(key) {
        this.phi += this.config.CAMERA_ANGLE_STEP;
        this.refresh();
    }

    refresh() {
        this.engine.camera_changed = true;
    }

    get_zoom(z = 0, allow_invisible = false) {
        var distance = this.z - z;
        if (distance <= 0) {
            if (!allow_invisible) throw InvisibleError;
            distance = Infinity;
        }
        return 100 / distance;
    }

    adjust_coord(c, allow_invisible = false) {
        const R = get_rotation_matrix(deg2rad(this.phi));
        const zoom = this.get_zoom();
        return this.center + (rotate(c, R) - [this.x, this.y]) * zoom;
    }

    adjust_radius(c, r) {
        const zoom = this.get_zoom();
        return r * zoom;
    }

    actual_point(x, y) {
        const R_ = get_rotation_matrix(deg2rad(this.phi), -1);
        const zoom = this.get_zoom();
        return rotate(([x, y] - this.center) / zoom + [this.x, this.y], R_);
    }
}

function get_rotation_matrix(x, dir = 1) {
    const sin = math.sin(x * dir);
    const cos = math.cos(x * dir);
    return np.matrix([
        [cos, -sin],
        [sin, cos]
    ]);
}


class Engine2D {
    constructor(config, canvas, on_key_press) {
        this.config = config;
        this.canvas = canvas;
        this.objs = [];
        this.animating = false;
        this.controlboxes = [];
        this.paths = [];
        this.camera = Camera2D(config, this);
        this.on_key_press = on_key_press;
        this.camera_changed = false;
        this.fps_last_time = now();
        this.fps_count = 0;
    }

    destroy_controlboxes() {
        for (const controlbox of this.controlboxes) {
            controlbox.destroy();
        }
        this.controlboxes = []
    }

    animate() {
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

    object_coords(obj) {
        const r = this.camera.adjust_radius(obj.pos, obj.get_r());
        [x, y] = this.camera.adjust_coord(obj.pos);
        return [x - r, y - r, x + r, y + r];
    }

    direction_coords(obj) {
        const [cx, cy] = this.camera.adjust_coord(obj.pos);
        const [dx, dy] = this.camera.adjust_coord(obj.pos + obj.v * 50, true);
        return [cx, cy, dx, dy];
    }

    path_coords(obj) {
        const [fx, fy] = this.camera.adjust_coord(obj.prev_pos);
        const [tx, ty] = this.camera.adjust_coord(obj.pos);
        return [fx, fy, tx, ty];
    }

    draw_object(obj) {
        let c;
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

    draw_direction(obj) {
        let c;
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

    draw_path(obj) {
        if (vector_magnitude(obj.pos - obj.prev_pos) > 5) {
            let c;
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
            obj.prev_pos = np.copy(obj.pos);
            if (this.paths.length > this.config.MAX_PATHS) {
                this.canvas.delete(this.paths[0].tag);
                this.paths = this.paths.slice(1);
            }
        }
    }

    move_object(obj) {
        try {
            const c = this.object_coords(obj);
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

    move_direction(obj) {
        try {
            const c = this.direction_coords(obj);
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

    move_paths() {
        for (const path of this.paths) {
            try {
                const c = this.path_coords(path);
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
    }

    create_object(x, y, m = null, v = null, color = null, controlbox = true) {
        const pos = np.array(this.camera.actual_point(x, y));
        if (!m) {
            let max_r = Circle.get_r_from_m(this.config.MASS_MAX);
            for (const obj of this.objs) {
                max_r = min(max_r, (vector_magnitude(obj.pos - pos) - obj.get_r()) / 1.5)
            }
            m = Circle.get_m_from_r(random(Circle.get_r_from_m(this.config.MASS_MIN), max_r));
        }
        if (!v) {
            v = np.array(polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180)))
        }
        if (!color) {
            color = rand_color();
        }
        const tag = `circle${this.objs.length}`;
        const dir_tag = tag + "_dir";
        const obj = Circle(this.config, m, pos, v, color, tag, dir_tag, this, controlbox);
        this.objs.append(obj);
        this.draw_object(obj);
        this.draw_direction(obj);
    }

    get_rotation_matrix(angles, dir = 1) {
        return get_rotation_matrix(angles[0], dir);
    }

    elastic_collision() {
        const dimension = this.config.DIMENSION;
        for (let i = 0; i < this.objs.length; i++) {
            const o1 = this.objs[i];
            for (let j = i + 1; j < this.objs.length; j++) {
                const o2 = this.objs[j];
                const collision = o2.pos - o1.pos;
                const angles = cartesian2auto(collision);
                const d = angles.shift();

                if (d < o1.get_r() + o2.get_r()) {
                    const R = this.get_rotation_matrix(angles);
                    const R_ = this.get_rotation_matrix(angles, -1);

                    const v_temp = [rotate(o1.v, R), rotate(o2.v, R)];
                    const v_final = np.copy(v_temp);
                    v_final[0][0] = ((o1.m - o2.m) * v_temp[0][0] + 2 * o2.m * v_temp[1][0]) / (o1.m + o2.m);
                    v_final[1][0] = ((o2.m - o1.m) * v_temp[1][0] + 2 * o1.m * v_temp[0][0]) / (o1.m + o2.m);
                    o1.v = rotate(v_final[0], R_);
                    o2.v = rotate(v_final[1], R_);

                    const pos_temp = [[0] * dimension, rotate(collision, R)];
                    pos_temp[0][0] += v_final[0][0];
                    pos_temp[1][0] += v_final[1][0];
                    o1.pos = o1.pos + rotate(pos_temp[0], R_);
                    o2.pos = o1.pos + rotate(pos_temp[1], R_);
                }
            }
        }
    }

    calculate_all() {
        for (const obj of this.objs) {
            obj.calculate_velocity();
        }

        this.elastic_collision();

        for (const obj of this.objs) {
            obj.calculate_position();
        }
    }

    redraw_all() {
        for (const obj of this.objs) {
            obj.redraw();
        }
    }

    print_fps() {
        this.fps_count += 1;
        const current_time = now();
        const fps_time_diff = current_time - this.fps_last_time
        if (fps_time_diff > 1) {
            console.log(`${(this.fps_count / fps_time_diff) | 0} fps`);
            this.fps_last_time = current_time;
            this.fps_count = 0;
        }
    }
}

module.exports = Engine2D;