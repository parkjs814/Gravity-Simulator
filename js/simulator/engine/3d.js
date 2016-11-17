const Engine2D = require('./2d');


def get_rotation_x_matrix(x, dir=1):
    sin = math.sin(x * dir)
    cos = math.cos(x * dir)
    return np.matrix([
        [1, 0, 0],
        [0, cos, -sin],
        [0, sin, cos]
    ])


def get_rotation_y_matrix(x, dir=1):
    sin = math.sin(x * dir)
    cos = math.cos(x * dir)
    return np.matrix([
        [cos, 0, -sin],
        [0, 1, 0],
        [sin, 0, cos]
    ])


def get_rotation_z_matrix(x, dir=1):
    sin = math.sin(x * dir)
    cos = math.cos(x * dir)
    return np.matrix([
        [cos, -sin, 0],
        [sin, cos, 0],
        [0, 0, 1]
    ])


class Engine3D(Engine2D):
    def __init__(self, config, canvas, on_key_press):
        super(Engine3D, self).__init__(config, canvas, on_key_press)
        self.camera = Camera3D(config, self)

    def create_object(self, x, y, m=None, v=None, color=None, controlbox=True):
        pos = np.array(self.camera.actual_point(x, y))
        if not m:
            max_r = Sphere.get_r_from_m(self.config.MASS_MAX)
            for obj in self.objs:
                max_r = min(max_r, (vector_magnitude(obj.pos - pos) - obj.get_r()) / 1.5)
            m = Sphere.get_m_from_r(random.randrange(Sphere.get_r_from_m(self.config.MASS_MIN), int(max_r)))
        if not v:
            v = np.array(
                spherical2cartesian(random.randrange(self.config.VELOCITY_MAX / 2), random.randrange(-180, 180),
                                    random.randrange(-180, 180)))
        if not color:
            rand256 = lambda: random.randint(0, 255)
            color = '#%02X%02X%02X' % (rand256(), rand256(), rand256())
        tag = "sphere%d" % len(self.objs)
        dir_tag = tag + "_dir"
        obj = Sphere(self.config, m, pos, v, color, tag, dir_tag, self, controlbox)
        self.objs.append(obj)
        self.draw_object(obj)
        self.draw_direction(obj)

    def get_rotation_matrix(self, angles, dir=1):
        return get_rotation_z_matrix(angles[0]) * get_rotation_x_matrix(angles[1]) if dir == 1 else \
            get_rotation_x_matrix(angles[1], -1) * get_rotation_z_matrix(angles[0], -1)
