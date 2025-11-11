import { AudioRepository } from '../../domain/repositories/AudioRepository';
import { Audio } from '../../domain/entities/Audio';
import { Mastering } from '../../domain/entities/Mastering';
import { AIMasteringDataSource } from '../datasources/AIMasteringDataSource';

export class AudioRepositoryImpl implements AudioRepository {
  constructor(private dataSource: AIMasteringDataSource) {}

  async uploadAudio(uri: string, fileName: string): Promise<Audio> {
    return await this.dataSource.uploadAudio(uri, fileName);
  }

  async createMastering(audioId: string): Promise<Mastering> {
    return await this.dataSource.createMastering(audioId);
  }

  async getMasteringStatus(masteringId: string): Promise<Mastering> {
    return await this.dataSource.getMasteringStatus(masteringId);
  }

  async downloadAudio(audioId: string): Promise<string> {
    return await this.dataSource.downloadAudio(audioId);
  }
}