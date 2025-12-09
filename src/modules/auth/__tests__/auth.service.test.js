import { jest } from '@jest/globals';
import { authService } from '../auth.service.js';
import { authRepository } from '../auth.repository.js';
import { BadRequestError } from '../../../errors/http.error.js';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AuthService - register', () => {
  test('lanza BadRequestError si el email ya existe', async () => {
    const data = { email: 'test@example.com', password: '123456', name: 'Test' };

    const findByEmailMock = jest
      .spyOn(authRepository, 'findByEmail')
      .mockResolvedValue({ id: 1, email: data.email });

    const createUserMock = jest.spyOn(authRepository, 'createUser');

    await expect(authService.register(data)).rejects.toBeInstanceOf(BadRequestError);

    expect(findByEmailMock).toHaveBeenCalledWith(data.email);
    expect(createUserMock).not.toHaveBeenCalled();
  });

  test('crea usuario cuando email es nuevo', async () => {
    const data = { email: 'test@example.com', password: '123456', name: 'Test' };

    jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(null);

    const createdUser = {
      id: 1,
      email: data.email,
      name: data.name,
      password: 'hashed-pass',
      dataValues: { id: 1, email: data.email, name: data.name },
    };

    const createUserMock = jest
      .spyOn(authRepository, 'createUser')
      .mockResolvedValue(createdUser);

    const result = await authService.register(data);

    expect(createUserMock).toHaveBeenCalled();
    expect(result).toMatchObject({
      id: 1,
      email: data.email,
      name: data.name,
    });
  });
});
