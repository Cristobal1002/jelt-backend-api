import { validationResult } from 'express-validator';
import { authService } from './auth.service.js';

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.badRequest(errors);

      const user = await authService.register(req.body);

      return res.created(user);

    } catch (err) {
      return res.badRequest(err.message);
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.badRequest(errors);

      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);

      return res.ok({user, token});

    } catch (err) {
      return res.badRequest(err.message);
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.badRequest(errors);

      const id = req.user.id;
      const msg = await authService.updateUser(id, req.body);

      return res.ok(msg);

    } catch (err) {
      return res.badRequest(err.message);
    }
  }

  async delete(req, res) {
    try {
      const id = req.user.id;
      const msg = await authService.deleteUser(id);

      return res.ok(msg);

    } catch (err) {
      return res.badRequest(err.message);
    }
  }

  async getByEmail(req, res) {
    try {
      const { email } = req.query;
      const msg = await authService.getUserByEmail(email);      

      return res.ok(msg);

    } catch (err) {
      return res.notFound(err.message);
    }
  }

   async validateToken(req, res) {
    try {
      if (!req.user) {
        return res.unauthorized('Token inválido o no proporcionado');
      }

      return res.ok({
        user: req.user,
      }, 
      'Token válido');
    } catch (err) {
      return res.badRequest(err.message);
    }
  }
}


export const authController = new AuthController();
