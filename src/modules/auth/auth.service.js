import { authRepository } from './auth.repository.js';
import { hashPassword, comparePassword } from '../../utils/crypto.js';
import { generateToken } from '../../utils/jwt.js';
import { Role } from '../../models/role.model.js';

const DEFAULT_ROLE = 'USER';

class AuthService {
  async register(data) {
    const exists = await authRepository.findByEmail(data.email);
    if (exists) throw new Error('Email ya registrado');

    const hashed = await hashPassword(data.password);

    // buscar rol USER
    const role = await Role.findOne({ where: { name: DEFAULT_ROLE } });
    if (!role) {
      throw new Error(
        `Rol por defecto ${DEFAULT_ROLE} no encontrado. Crea primero los roles base.`
      );
    }

    const user = await authRepository.createUser({
      ...data,
      password: hashed,
      roleId: role.id,
    });

    return user;
  }

  async login(email, password) {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');

    if (!user.isActive || user.isDelete) {
      throw new Error('Usuario inactivo o eliminado');
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new Error('Credenciales inválidas');

    const token = generateToken({ id: user.id, email: user.email, role: user.role?.name || DEFAULT_ROLE, });

    return { user, token };
  }

  /**
   * Actualizar datos del propio usuario autenticado
   * - Solo puede modificar su propio registro
   * - No puede cambiar roleId, isActive, isDelete, id
   */
  async updateOwnUser(userId, data, currentUser) {
    if (!currentUser || currentUser.id !== userId) {
      throw new Error('No puedes modificar otro usuario');
    }

    if(data.password && data.password.length > 0) {
      data.password = await hashPassword(data.password);
    } else {
      delete data.password;
    }

    // Campos que NO permitimos que toque el usuario
    const { id, roleId, isActive, isDelete, ...safeData } = data;

    await authRepository.updateUser(userId, safeData);

    return { message: 'Usuario actualizado correctamente' };
  }

  async updateUser(id, data) {
    await authRepository.updateUser(id, data);
    return { message: 'Usuario actualizado' };
  }

  /**
  * Eliminar (soft delete) un usuario
  * Reglas:
  * - Nadie puede eliminarse a sí mismo
  * - Un usuario con rol ADMIN no puede eliminar a nadie
  * - Solo SUPER_ADMIN puede eliminar usuarios, y nunca a sí mismo
  */
  async deleteUser(targetUserId, currentUser) {
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const { id: authId, role } = currentUser;

    if (authId === targetUserId) {
      throw new Error('No puedes eliminar tu propio usuario');
    }

    if (role === 'ADMIN') {
      throw new Error(
        'No puedes eliminar o inhabilitar usuarios'
      );
    }

    if (role !== 'SUPER_ADMIN') {
      throw new Error(
        'No tienes permisos para eliminar o inhabilitar usuarios'
      );
    }

    const targetUser = await authRepository.findById(targetUserId);

    if (!targetUser) {
      throw new Error('Usuario a eliminar no encontrado');
    }

    await authRepository.softDelete(targetUserId);
    return { message: 'Usuario eliminado (soft delete) correctamente' };
  }

  async findByEmail(targetEmail, currentUser) {

    const { email, role } = currentUser;

    if ((role == undefined || role == null || role == DEFAULT_ROLE) && email !== targetEmail) {
      throw new Error('No puedes consultar este usuario');
    }

    const user = await authRepository.findByEmail(targetEmail);

    if (!user) throw new Error('Usuario no encontrado');

    return user;
  }

  async findById(targetId, currentUser) {

    const { id, role } = currentUser;

    console.log("id", id, "targetId", targetId);

    if ((role == undefined || role == null || role == DEFAULT_ROLE) && id !== targetId) {
      throw new Error('No puedes consultar este usuario');
    }

    const user = await authRepository.findById(targetId);

    if (!user) throw new Error('Usuario no encontrado');

    return user;
  }

}

export const authService = new AuthService();
