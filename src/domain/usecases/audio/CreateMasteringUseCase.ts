import { AudioRepository } from '../../repositories/AudioRepository';
import { Mastering } from '../../entities/Mastering';

export class CreateMasteringUseCase {
  constructor(private audioRepository: AudioRepository) {}

  async execute(audioId: string): Promise<Mastering> {
    if (!audioId) {
      throw new Error('Audio ID es requerido');
    }
    return await this.audioRepository.createMastering(audioId);
  }
}