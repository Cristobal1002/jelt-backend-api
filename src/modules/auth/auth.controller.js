import { authService } from './auth.service.js';

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return res.created(user, 'User registered successfully');
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { token, user } = await authService.login(req.body);
    return res.ok({ token, user }, 'Login successful');
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const updated = await authService.updateOwnUser(currentUser.id, req.body, currentUser);
    return res.ok(updated, 'User updated successfully');
  } catch (error) {
    return next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { id } = req.params;
    await authService.deleteUser(id, currentUser);
    return res.ok(null, 'User deleted successfully');
  } catch (error) {
    return next(error);
  }
};

const getByEmail = async (req, res, next) => {
  try {
    const { email } = req.query; // o desde req.user.email, según diseño
    const user = await authService.findByEmail(email, req.user);
    return res.ok(user, 'User found');
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await authService.findById(id, req.user);
    return res.ok(user, 'User found');
  } catch (error) {
    return next(error);
  }
};

const validateToken = async (req, res, next) => {
  try {
    return res.ok({ user: req.user }, 'Token is valid');
  } catch (error) {
    return next(error);
  }
};

export const authController = {
  register,
  login,
  update,
  delete: remove,
  getByEmail,
  getById,
  validateToken,
};
