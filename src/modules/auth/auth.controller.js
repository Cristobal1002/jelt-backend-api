import { validationResult } from 'express-validator';
import { authService } from './auth.service.js';

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json(errors);

      const user = await authService.register(req.body);
      return res.status(201).json(user);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json(errors);

      const { email, password } = req.body;
      const result = await authService.login(email, password);

      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json(errors);

      const id = req.user.id;
      const msg = await authService.updateUser(id, req.body);

      return res.json(msg);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.user.id;
      const msg = await authService.deleteUser(id);
      return res.json(msg);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async getByEmail(req, res) {
    try {
      const { email } = req.query;
      const msg = await authService.getUserByEmail(email);
      return res.json(msg);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export const authController = new AuthController();
