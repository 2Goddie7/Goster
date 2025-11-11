import { AudioRepository } from '../../repositories/AudioRepository';
import { Audio } from '../../entities/Audio';

export class UploadAudioUseCase {
  constructor(private audioRepository: AudioRepository) {}

  async execute(uri: string, fileName: string): Promise<Audio> {
    if (!uri || !fileName) {
      throw new Error('URI y nombre de archivo son requeridos');
    }
    return await this.audioRepository.uploadAudio(uri, fileName);
  }
}