import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { LogoutUseCase } from '../../domain/usecases/auth/LogoutUseCase';
import { UploadAudioUseCase } from '../../domain/usecases/audio/UploadAudioUseCase';
import { CreateMasteringUseCase } from '../../domain/usecases/audio/CreateMasteringUseCase';
import { GetMasteringStatusUseCase } from '../../domain/usecases/audio/GetMasteringStatusUseCase';
import { AuthRepositoryImpl } from '../../data/repositories/AuthRepositoryImpl';
import { AudioRepositoryImpl } from '../../data/repositories/AudioRepositoryImpl';
import { FirebaseAuthDataSource } from '../../data/datasources/FirebaseAuthDataSource';
import { AIMasteringDataSource } from '../../data/datasources/AIMasteringDataSource';
import { Mastering } from '../../domain/entities/Mastering';

const authDataSource = new FirebaseAuthDataSource();
const authRepository = new AuthRepositoryImpl(authDataSource);
const logoutUseCase = new LogoutUseCase(authRepository);

const audioDataSource = new AIMasteringDataSource();
const audioRepository = new AudioRepositoryImpl(audioDataSource);
const uploadAudioUseCase = new UploadAudioUseCase(audioRepository);
const createMasteringUseCase = new CreateMasteringUseCase(audioRepository);
const getMasteringStatusUseCase = new GetMasteringStatusUseCase(audioRepository);

export const HomeScreen = ({ navigation }: any) => {
  const [masterings, setMasterings] = useState<Mastering[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUseCase.execute();
      navigation.replace('Login');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setIsUploading(true);

      // 1. Subir audio
      const audio = await uploadAudioUseCase.execute(file.uri, file.name);
      
      // 2. Crear mastering
      const mastering = await createMasteringUseCase.execute(audio.id);
      
      setMasterings([mastering, ...masterings]);
      
      Alert.alert('Éxito', 'Audio subido y mastering iniciado');

      // 3. Monitorear progreso
      monitorMastering(mastering.id);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const monitorMastering = async (masteringId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await getMasteringStatusUseCase.execute(masteringId);
        
        setMasterings(prev =>
          prev.map(m => (m.id === masteringId ? status : m))
        );

        if (status.status === 'succeeded' || status.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        clearInterval(interval);
      }
    }, 5000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎵 Audio Mastering</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handlePickAudio}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.uploadButtonText}>📤 Subir Audio</Text>
        )}
      </TouchableOpacity>

      <ScrollView style={styles.list}>
        <Text style={styles.listTitle}>Mis Masterizaciones</Text>
        {masterings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No hay masterizaciones todavía
            </Text>
            <Text style={styles.emptySubtext}>
              Sube tu primer audio para comenzar
            </Text>
          </View>
        ) : (
          masterings.map((mastering) => (
            <TouchableOpacity
              key={mastering.id}
              style={styles.card}
              onPress={() => navigation.navigate('MasteringDetail', { mastering })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardId}>ID: {mastering.id.substring(0, 8)}...</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(mastering.status) }]}>
                  <Text style={styles.statusText}>{mastering.status}</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${mastering.progression * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(mastering.progression * 100)}%</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'waiting': return '#ffa500';
    case 'processing': return '#53a8f5';
    case 'succeeded': return '#4caf50';
    case 'failed': return '#e94560';
    default: return '#999';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    backgroundColor: '#16213e',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#e94560',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    padding: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#999',
    fontSize: 18,
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardId: {
    color: '#999',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#0f3460',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#53a8f5',
  },
  progressText: {
    color: '#53a8f5',
    fontSize: 14,
    fontWeight: 'bold',
  },
});