import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Audio } from '../../domain/entities/Audio';
import { Mastering } from '../../domain/entities/Mastering';

const API_BASE_URL = 'https://api.aimastering.com';

// Genera una API key temporal para guest
const generateGuestApiKey = (): string => {
  const randomString = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
  return `guest_${randomString}`;
};

export class AIMasteringDataSource {
  private apiKey: string;

  constructor() {
    this.apiKey = generateGuestApiKey();
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async uploadAudio(uri: string, fileName: string): Promise<Audio> {
    try {
      // Leer el archivo como base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Crear FormData
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'audio/wav',
        name: fileName,
      } as any);

      // Subir el audio
      const response = await axios.post(
        `${API_BASE_URL}/audios`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        id: response.data.id,
        fileName: fileName,
        createdAt: new Date(response.data.created_at),
      };
    } catch (error: any) {
      console.error('Error uploading audio:', error.response?.data || error.message);
      throw new Error('Error al subir el audio');
    }
  }

  async createMastering(audioId: string): Promise<Mastering> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/masterings`,
        {
          input_audio_id: audioId,
          mode: 'default',
        },
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        inputAudioId: response.data.input_audio_id,
        outputAudioId: response.data.output_audio_id,
        status: response.data.status,
        progression: response.data.progression || 0,
        createdAt: new Date(response.data.created_at),
      };
    } catch (error: any) {
      console.error('Error creating mastering:', error.response?.data || error.message);
      throw new Error('Error al crear el mastering');
    }
  }

  async getMasteringStatus(masteringId: string): Promise<Mastering> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/masterings/${masteringId}`,
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        inputAudioId: response.data.input_audio_id,
        outputAudioId: response.data.output_audio_id,
        status: response.data.status,
        progression: response.data.progression || 0,
        createdAt: new Date(response.data.created_at),
      };
    } catch (error: any) {
      console.error('Error getting mastering status:', error.response?.data || error.message);
      throw new Error('Error al obtener el estado del mastering');
    }
  }

  async downloadAudio(audioId: string): Promise<string> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/audios/${audioId}/download`,
        {
          headers: this.getHeaders(),
          responseType: 'blob',
        }
      );

      // En React Native, necesitarías guardar el blob y retornar la URI
      // Por simplicidad, retornamos la URL de descarga
      return `${API_BASE_URL}/audios/${audioId}/download`;
    } catch (error: any) {
      console.error('Error downloading audio:', error.response?.data || error.message);
      throw new Error('Error al descargar el audio');
    }
  }
}