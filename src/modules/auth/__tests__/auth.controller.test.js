import { jest } from '@jest/globals';
import { authController } from '../auth.controller.js';
import { authService } from '../auth.service.js';

const buildRes = () => ({
  ok: jest.fn().mockReturnThis(),
  created: jest.fn().mockReturnThis(),
  badRequest: jest.fn().mockReturnThis(),
  unauthorized: jest.fn().mockReturnThis(),
  forbidden: jest.fn().mockReturnThis(),
  notFound: jest.fn().mockReturnThis(),
  serverError: jest.fn().mockReturnThis(),
});

describe('AuthController - register', () => {
  test('debe crear usuario y devolver 201', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'Secret123',
        name: 'Test User',
      },
    };
    const res = buildRes();
    const next = jest.fn();

    const fakeUser = { id: 1, email: req.body.email, name: req.body.name };

    const registerMock = jest
      .spyOn(authService, 'register')
      .mockResolvedValue(fakeUser);

    await authController.register(req, res, next);

    expect(registerMock).toHaveBeenCalledWith(req.body);
    expect(res.created).toHaveBeenCalledWith(fakeUser, 'User registered successfully');
    expect(next).not.toHaveBeenCalled();

    registerMock.mockRestore(); // opcional, para limpiar el mock
  });

  test('debe delegar el error a next si service falla', async () => {
    const req = { body: { email: 'x', password: 'x', name: 'x' } };
    const res = buildRes();
    const next = jest.fn();
    const error = new Error('Boom');

    const registerMock = jest
      .spyOn(authService, 'register')
      .mockRejectedValue(error);

    await authController.register(req, res, next);

    expect(registerMock).toHaveBeenCalledWith(req.body);
    expect(next).toHaveBeenCalledWith(error);
    expect(res.created).not.toHaveBeenCalled();

    registerMock.mockRestore();
  });
});
