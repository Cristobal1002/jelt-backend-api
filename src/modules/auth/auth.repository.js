import { User } from '../../models/user.model.js';

class AuthRepository {
  async findByEmail(email) {
    return User.findOne({ where: { email, isDelete: false } });
  }

  async createUser(data) {
    return User.create(data);
  }

  async updateUser(id, data) {
    return User.update(data, { where: { id, isDelete: false } });
  }

  async softDelete(id) {
    return User.update(
      { isDelete: true },
      { where: { id } }
    );
  }
}

export const authRepository = new AuthRepository();
