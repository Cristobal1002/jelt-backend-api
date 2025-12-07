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
      if (!errors.isEmpty()) {
        return res.badRequest(errors.array());
      }

      const currentUser = req.user;        // viene del token
      const userId = currentUser?.id;      // el propio usuario

      if (!userId) {
        return res.badRequest('Usuario no autenticado');
      }

      const result = await authService.updateOwnUser(
        userId,
        req.body,
        currentUser
      );

      return res.ok(result);
    } catch (err) {
      return res.badRequest(err.message);
    }
  }

  async delete(req, res) {
    try {
      const targetUserId = req.params.id;

      if (!targetUserId) {
        return res.badRequest('Id de usuario a eliminar es requerido');
      }

      const result = await authService.deleteUser(
        targetUserId,
        req.user
      );

      return res.ok(result);
    } catch (err) {
      return res.badRequest(err.message);
    }
  }

  async getByEmail(req, res) {
    try {
      const { email } = req.query;

      const msg = await authService.findByEmail(email, req.user);

      return res.ok(msg);

    } catch (err) {
      return res.notFound(err.message);
    }
  }

  async getById(req, res) {
    try {

      const msg = await authService.findById(req.params.id, req.user);

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
