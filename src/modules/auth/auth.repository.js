import { User } from '../../models/user.model.js';

class AuthRepository {
  async findByEmail(email) {
    return User.findOne({ 
      where: { email, isDelete: false },
      include: [{
        association: 'role',
      }],
    });
  }

  async findById(id) {
    return User.findOne({
      where: { id, isDelete: false },
      include: [{
        association: 'role',
      }],
    });
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
