import { Audio } from '../entities/Audio';
import { Mastering } from '../entities/Mastering';

export interface AudioRepository {
  uploadAudio(uri: string, fileName: string): Promise<Audio>;
  createMastering(audioId: string): Promise<Mastering>;
  getMasteringStatus(masteringId: string): Promise<Mastering>;
  downloadAudio(audioId: string): Promise<string>;
}