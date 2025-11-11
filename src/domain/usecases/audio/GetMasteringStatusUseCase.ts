import { AudioRepository } from '../../repositories/AudioRepository';
import { Mastering } from '../../entities/Mastering';

export class GetMasteringStatusUseCase {
  constructor(private audioRepository: AudioRepository) {}

  async execute(masteringId: string): Promise<Mastering> {
    if (!masteringId) {
      throw new Error('Mastering ID es requerido');
    }
    return await this.audioRepository.getMasteringStatus(masteringId);
  }
}