export interface Mastering {
  id: string;
  inputAudioId: string;
  outputAudioId?: string;
  status: 'waiting' | 'processing' | 'succeeded' | 'failed';
  progression: number;
  createdAt: Date;
}