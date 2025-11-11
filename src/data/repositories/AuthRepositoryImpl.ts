import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/User';
import { FirebaseAuthDataSource } from '../datasources/FirebaseAuthDataSource';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private dataSource: FirebaseAuthDataSource) {}

  async login(email: string, password: string): Promise<User> {
    return await this.dataSource.login(email, password);
  }

  async register(email: string, password: string): Promise<User> {
    return await this.dataSource.register(email, password);
  }

  async logout(): Promise<void> {
    return await this.dataSource.logout();
  }

  async getCurrentUser(): Promise<User | null> {
    return await this.dataSource.getCurrentUser();
  }
}