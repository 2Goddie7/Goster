import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Audio } from '../../domain/entities/Audio';
import { Mastering } from '../../domain/entities/Mastering';
import Constants from "expo-constants";


const API_URL = "https://api.ai-mastering.com/v1";
const API_KEY = Constants.expoConfig?.extra?.AI_MASTERING_API_KEY;

export class AIMasteringDataSource {
  async createMastering(file: { uri: string; name: string; type: string }) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      const response = await axios.post(`${API_URL}/masterings`, formData, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data || error.message);
    }
  }

  async getMasteringStatus(id: string) {
    try {
      const response = await axios.get(`${API_URL}/masterings/${id}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data || error.message);
    }
  }

  async downloadMasteredAudio(url: string) {
    try {
      // Para descargar y guardar localmente en Expo:
      // IMPORTANTE: Aquí mejor usaremos FileSystem.downloadAsync si tú lo deseas.
      const { default: FileSystem } = await import("expo-file-system");
      const localUri = FileSystem.documentDirectory + `mastered-${Date.now()}.mp3`;

      const result = await FileSystem.downloadAsync(url, localUri);

      return result.uri; // Devolvemos la ruta local del archivo
    } catch (error: any) {
      throw new Error(error.response?.data || error.message);
    }
  }
}