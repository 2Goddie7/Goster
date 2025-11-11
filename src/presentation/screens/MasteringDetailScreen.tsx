import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { GetMasteringStatusUseCase } from '../../domain/usecases/audio/GetMasteringStatusUseCase';
import { AudioRepositoryImpl } from '../../data/repositories/AudioRepositoryImpl';
import { AIMasteringDataSource } from '../../data/datasources/AIMasteringDataSource';
import { Mastering } from '../../domain/entities/Mastering';

const audioDataSource = new AIMasteringDataSource();
const audioRepository = new AudioRepositoryImpl(audioDataSource);
const getMasteringStatusUseCase = new GetMasteringStatusUseCase(audioRepository);

export const MasteringDetailScreen = ({ route, navigation }: any) => {
  const { mastering: initialMastering } = route.params;
  const [mastering, setMastering] = useState<Mastering>(initialMastering);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (mastering.status === 'waiting' || mastering.status === 'processing') {
        refreshStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [mastering.status]);

  const refreshStatus = async () => {
    try {
      const updatedMastering = await getMasteringStatusUseCase.execute(mastering.id);
      setMastering(updatedMastering);
    } catch (error: any) {
      console.error('Error refreshing status:', error.message);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshStatus();
    setIsRefreshing(false);
  };

  const handleDownload = async () => {
    if (!mastering.outputAudioId) {
      Alert.alert('Error', 'El audio aún no está listo');
      return;
    }

    try {
      const downloadUrl = await audioRepository.downloadAudio(mastering.outputAudioId);
      Linking.openURL(downloadUrl);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const getStatusIcon = () => {
    switch (mastering.status) {
      case 'waiting': return '⏳';
      case 'processing': return '⚙️';
      case 'succeeded': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Mastering</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          <Text style={styles.statusTitle}>{mastering.status.toUpperCase()}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${mastering.progression * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(mastering.progression * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoRow label="ID" value={mastering.id} />
          <InfoRow label="Audio de entrada" value={mastering.inputAudioId} />
          {mastering.outputAudioId && (
            <InfoRow label="Audio de salida" value={mastering.outputAudioId} />
          )}
          <InfoRow 
            label="Fecha de creación" 
            value={mastering.createdAt.toLocaleString('es-ES')} 
          />
        </View>

        <TouchableOpacity
          style={[styles.refreshButton, isRefreshing && styles.buttonDisabled]}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🔄 Actualizar estado</Text>
          )}
        </TouchableOpacity>

        {mastering.status === 'succeeded' && mastering.outputAudioId && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownload}
          >
            <Text style={styles.buttonText}>⬇️ Descargar audio masterizado</Text>
          </TouchableOpacity>
        )}

        {mastering.status === 'failed' && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              ❌ El proceso de mastering ha fallado. Por favor, intenta de nuevo.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    backgroundColor: '#16213e',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#53a8f5',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#0f3460',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#53a8f5',
  },
  progressText: {
    color: '#53a8f5',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  infoLabel: {
    color: '#999',
    fontSize: 14,
    width: 140,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  refreshButton: {
    backgroundColor: '#53a8f5',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  downloadButton: {
    backgroundColor: '#4caf50',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorCard: {
    backgroundColor: '#e94560',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});