import { AuthRepository } from '../../repositories/AuthRepository';
import { User } from '../../entities/User';

export class RegisterUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }
    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    return await this.authRepository.register(email, password);
  }
}