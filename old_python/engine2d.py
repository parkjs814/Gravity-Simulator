# -*- coding: utf-8 -*-

from __future__ import division
import Tkinter
import random
import time

from control import ControlBox, Controller
from util import *


class InvisibleError(Exception):
    pass


class Circle(object):
    """Polar coordinate system
    https://en.wikipedia.org/wiki/Polar_coordinate_system
    """

    def __init__(self, config, m, pos, v, color, tag, dir_tag, engine, controlbox):
        self.config = config
        self.m = m
        self.pos = pos
        self.prev_pos = np.copy(pos)
        self.v = v
        self.color = color
        self.tag = tag
        self.dir_tag = dir_tag
        self.engine = engine

        self.m_controller = None
        self.pos_x_controller = None
        self.pos_y_controller = None
        self.v_phi_controller = None
        self.v_rho_controller = None
        self.controlbox = None
        if controlbox:
            self.show_controlbox()

    def get_r(self):
        return Circle.get_r_from_m(self.m)

    def calculate_velocity(self):
        F = 0
        for obj in self.engine.objs:
            if obj == self:
                continue
            vector = self.pos - obj.pos
            magnitude = vector_magnitude(vector)
            unit_vector = vector / magnitude
            F += obj.m / magnitude ** 2 * unit_vector
        F *= -self.config.G * self.m
        a = F / self.m
        self.v += a

    def calculate_position(self):
        self.pos += self.v

    def control_m(self, e):
        m = self.m_controller.get()
        self.m = m
        self.redraw()

    def control_pos(self, e):
        x = self.pos_x_controller.get()
        y = self.pos_y_controller.get()
        self.pos = np.array([x, y])
        self.redraw()

    def control_v(self, e):
        phi = deg2rad(self.v_phi_controller.get())
        rho = self.v_rho_controller.get()
        self.v = np.array(polar2cartesian(rho, phi))
        self.redraw()

    def show_controlbox(self):
        try:
            self.controlbox.tk.lift()
        except:
            margin = 1.5

            pos_range = max(max(self.config.W, self.config.H) / 2, abs(max(self.pos, key=abs)) * margin)
            for obj in self.engine.objs:
                pos_range = max(pos_range, abs(max(obj.pos, key=abs)) * margin)

            m = self.m

            v = cartesian2auto(self.v)
            v_range = max(self.config.VELOCITY_MAX, vector_magnitude(self.v) * margin)
            for obj in self.engine.objs:
                v_range = max(v_range, vector_magnitude(obj.v) * margin)

            self.setup_controllers(pos_range, m, v, v_range)
            self.controlbox = ControlBox(self.tag, self.get_controllers(), self.engine.on_key_press)
            self.engine.controlboxes.append(self.controlbox.tk)

    def setup_controllers(self, pos_range, m, v, v_range):
        self.m_controller = Controller("Mass m", self.config.MASS_MIN, self.config.MASS_MAX, m, self.control_m)
        self.pos_x_controller = Controller("Position x", -pos_range, pos_range, self.pos[0], self.control_pos)
        self.pos_y_controller = Controller("Position y", -pos_range, pos_range, self.pos[1], self.control_pos)
        self.v_rho_controller = Controller("Velocity ρ", 0, v_range, v[0], self.control_v)
        self.v_phi_controller = Controller("Velocity φ", -180, 180, rad2deg(v[1]), self.control_v)

    def get_controllers(self):
        return [self.m_controller,
                self.pos_x_controller,
                self.pos_y_controller,
                self.v_rho_controller,
                self.v_phi_controller]

    def redraw(self):
        self.engine.move_object(self)
        self.engine.move_direction(self)
        self.engine.draw_path(self)

    @staticmethod
    def get_r_from_m(m):
        return m ** (1 / 2)

    @staticmethod
    def get_m_from_r(r):
        return r ** 2

    def __repr__(self):
        return str({'tag': self.tag, 'v': self.v, 'pos': self.pos})


class Path(object):
    def __init__(self, tag, obj):
        self.tag = tag
        self.prev_pos = np.copy(obj.prev_pos)
        self.pos = np.copy(obj.pos)


class Camera2D(object):
    def __init__(self, config, engine):
        self.config = config
        self.x = 0
        self.y = 0
        self.z = 100
        self.phi = 0
        self.engine = engine
        self.last_time = 0
        self.last_key = None
        self.combo = 0
        self.center = np.array([config.W / 2, config.H / 2])

    def get_coord_step(self, key):
        current_time = time.time()
        if key == self.last_key and current_time - self.last_time < 1:
            self.combo += 1
        else:
            self.combo = 0
        self.last_time = current_time
        self.last_key = key
        return self.config.CAMERA_COORD_STEP * self.config.CAMERA_ACCELERATION ** self.combo

    def up(self, key):
        self.y -= self.get_coord_step(key)
        self.refresh()

    def down(self, key):
        self.y += self.get_coord_step(key)
        self.refresh()

    def left(self, key):
        self.x -= self.get_coord_step(key)
        self.refresh()

    def right(self, key):
        self.x += self.get_coord_step(key)
        self.refresh()

    def zoom_in(self, key):
        self.z -= self.get_coord_step(key)
        self.refresh()

    def zoom_out(self, key):
        self.z += self.get_coord_step(key)
        self.refresh()

    def rotate_left(self, key):
        self.phi -= self.config.CAMERA_ANGLE_STEP
        self.refresh()

    def rotate_right(self, key):
        self.phi += self.config.CAMERA_ANGLE_STEP
        self.refresh()

    def refresh(self):
        self.engine.camera_changed = True

    def get_zoom(self, z=0, allow_invisible=False):
        distance = self.z - z
        if allow_invisible:
            if distance == 0:
                distance = 1e-10
            elif distance < 0:
                distance *= -1  # TODO: FIX
        elif distance <= 0:
            raise InvisibleError
        return 100 / distance

    def adjust_coord(self, c, allow_invisible=False):
        R = get_rotation_matrix(deg2rad(self.phi))
        zoom = self.get_zoom()
        return self.center + (rotate(c, R) - [self.x, self.y]) * zoom

    def adjust_radius(self, c, r):
        zoom = self.get_zoom()
        return r * zoom

    def actual_point(self, x, y):
        R_ = get_rotation_matrix(deg2rad(self.phi), -1)
        zoom = self.get_zoom()
        return rotate(([x, y] - self.center) / zoom + [self.x, self.y], R_)


def get_rotation_matrix(x, dir=1):
    sin = math.sin(x * dir)
    cos = math.cos(x * dir)
    return np.matrix([
        [cos, -sin],
        [sin, cos]
    ])


class Engine2D(object):
    def __init__(self, config, canvas, on_key_press):
        self.config = config
        self.canvas = canvas
        self.objs = []
        self.animating = False
        self.controlboxes = []
        self.paths = []
        self.camera = Camera2D(config, self)
        self.on_key_press = on_key_press
        self.camera_changed = False
        self.fps_last_time = time.time()
        self.fps_count = 0

    def destroy_controlboxes(self):
        for controlbox in self.controlboxes:
            try:
                controlbox.destroy()
            except Tkinter.TclError:
                pass
        self.controlboxes = []

    def animate(self):
        self.print_fps()
        if self.camera_changed:
            self.camera_changed = False
            self.move_paths()
        if self.animating:
            self.calculate_all()
        self.redraw_all()
        self.canvas.after(10, self.animate)

    def object_coords(self, obj):
        r = self.camera.adjust_radius(obj.pos, obj.get_r())
        [x, y] = self.camera.adjust_coord(obj.pos)
        return x - r, y - r, x + r, y + r

    def direction_coords(self, obj):
        [cx, cy] = self.camera.adjust_coord(obj.pos)
        [dx, dy] = self.camera.adjust_coord(obj.pos + obj.v * 50, True)
        return cx, cy, dx, dy

    def path_coords(self, obj):
        [fx, fy] = self.camera.adjust_coord(obj.prev_pos)
        [tx, ty] = self.camera.adjust_coord(obj.pos)
        return fx, fy, tx, ty

    def draw_object(self, obj):
        try:
            c = self.object_coords(obj)
        except InvisibleError:
            c = [0, 0, 0, 0]
        return self.canvas.create_oval(c[0], c[1], c[2], c[3], fill=obj.color, tag=obj.tag, width=0)

    def draw_direction(self, obj):
        try:
            c = self.direction_coords(obj)
        except InvisibleError:
            c = [0, 0, 0, 0]
        return self.canvas.create_line(c[0], c[1], c[2], c[3], fill="black", tag=obj.dir_tag)

    def draw_path(self, obj):
        if vector_magnitude(obj.pos - obj.prev_pos) > 5:
            try:
                c = self.path_coords(obj)
            except InvisibleError:
                c = [0, 0, 0, 0]
            self.paths.append(Path(self.canvas.create_line(c[0], c[1], c[2], c[3], fill="grey"), obj))
            obj.prev_pos = np.copy(obj.pos)
            if len(self.paths) > self.config.MAX_PATHS:
                self.canvas.delete(self.paths[0].tag)
                self.paths = self.paths[1:]

    def move_object(self, obj):
        try:
            c = self.object_coords(obj)
            self.canvas.coords(obj.tag, c[0], c[1], c[2], c[3])
            self.canvas.itemconfigure(obj.tag, state='normal')
        except InvisibleError:
            self.canvas.itemconfigure(obj.tag, state='hidden')

    def move_direction(self, obj):
        try:
            c = self.direction_coords(obj)
            self.canvas.coords(obj.dir_tag, c[0], c[1], c[2], c[3])
            self.canvas.itemconfigure(obj.dir_tag, state='normal')
        except InvisibleError:
            self.canvas.itemconfigure(obj.dir_tag, state='hidden')

    def move_paths(self):
        for path in self.paths:
            try:
                c = self.path_coords(path)
                self.canvas.coords(path.tag, c[0], c[1], c[2], c[3])
                self.canvas.itemconfigure(path.tag, state='normal')
            except InvisibleError:
                self.canvas.itemconfigure(path.tag, state='hidden')

    def create_object(self, x, y, m=None, v=None, color=None, controlbox=True):
        pos = np.array(self.camera.actual_point(x, y))
        if not m:
            max_r = Circle.get_r_from_m(self.config.MASS_MAX)
            for obj in self.objs:
                max_r = min(max_r, (vector_magnitude(obj.pos - pos) - obj.get_r()) / 1.5)
            m = Circle.get_m_from_r(random.randrange(Circle.get_r_from_m(self.config.MASS_MIN), int(max_r)))
        if not v:
            v = np.array(polar2cartesian(random.randrange(self.config.VELOCITY_MAX / 2), random.randrange(-180, 180)))
        if not color:
            rand256 = lambda: random.randint(0, 255)
            color = '#%02X%02X%02X' % (rand256(), rand256(), rand256())
        tag = "circle%d" % len(self.objs)
        dir_tag = tag + "_dir"
        obj = Circle(self.config, m, pos, v, color, tag, dir_tag, self, controlbox)
        self.objs.append(obj)
        self.draw_object(obj)
        self.draw_direction(obj)

    def get_rotation_matrix(self, angles, dir=1):
        return get_rotation_matrix(angles[0], dir)

    def elastic_collision(self):
        dimension = self.config.DIMENSION
        for i in range(0, len(self.objs)):
            o1 = self.objs[i]
            for j in range(i + 1, len(self.objs)):
                o2 = self.objs[j]
                collision = o2.pos - o1.pos
                temp = cartesian2auto(collision)
                d = temp[0]
                angles = temp[1:]

                if d < o1.get_r() + o2.get_r():
                    R = self.get_rotation_matrix(angles)
                    R_ = self.get_rotation_matrix(angles, -1)

                    v_temp = [rotate(o1.v, R), rotate(o2.v, R)]
                    v_final = np.copy(v_temp)
                    v_final[0][0] = ((o1.m - o2.m) * v_temp[0][0] + 2 * o2.m * v_temp[1][0]) / (o1.m + o2.m)
                    v_final[1][0] = ((o2.m - o1.m) * v_temp[1][0] + 2 * o1.m * v_temp[0][0]) / (o1.m + o2.m)
                    o1.v = rotate(v_final[0], R_)
                    o2.v = rotate(v_final[1], R_)

                    pos_temp = [[0] * dimension, rotate(collision, R)]
                    pos_temp[0][0] += v_final[0][0]
                    pos_temp[1][0] += v_final[1][0]
                    o1.pos = o1.pos + rotate(pos_temp[0], R_)
                    o2.pos = o1.pos + rotate(pos_temp[1], R_)

    def calculate_all(self):
        for obj in self.objs:
            obj.calculate_velocity()

        self.elastic_collision()

        for obj in self.objs:
            obj.calculate_position()

    def redraw_all(self):
        for obj in self.objs:
            obj.redraw()

    def print_fps(self):
        self.fps_count += 1
        current_time = time.time()
        fps_time_diff = current_time - self.fps_last_time
        if fps_time_diff > 1:
            print '%d fps' % (self.fps_count / fps_time_diff)
            self.fps_last_time = current_time
            self.fps_count = 0
