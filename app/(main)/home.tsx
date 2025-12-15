import React, {useEffect, useState}from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {searchMySessions } from '@/services/search';

export type Session = {
  id: string;
  nome: string;
  descricao: string;
  localizacao: string;
  dataHora: string; // ISO datetime: 2025-11-30T14:56:40.766Z
  custoPeladeiro: number;
  custoPrestadorServico: number;
  vagas: number;
  minutos: number
  donoEvento: {
    id: string;
    nome: string;
    nota: number;
  };
  peladeirosInscritos: {
    id: string;
    nome: string;
    nota: number;
  }[];
  tipoCampo: string;
  intensidade: string;
};

export default function HomePage() {

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Session[]>([]);

  const fetchJoinedSessions = async () => {
    try {
      setIsLoading(true);
      const sessions = await searchMySessions();
      setData(sessions);      
      console.log("Sessões inscritas:", sessions);
    } catch (error) {
      
    }finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchJoinedSessions();
  }, []);


  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (
        <>
          {/* SEÇÃO SESSÕES CONFIRMADAS */}
          {data.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Peladas Confirmadas</Text>
              <Text style={styles.sectionSubtitle}>
                Você tem {data.length} {data.length === 1 ? 'sessão confirmada' : 'sessões confirmadas'}
              </Text>
              {data.map((session) => (
                <View key={session.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.sessionSport}>{session.nome}</Text>
                      <Text style={styles.sessionLevel}>{session.intensidade}</Text>
                    </View>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.metaText}>📍 {session.localizacao}</Text>
                    <Text style={styles.metaText}>⏱️ {session.minutos} minutos</Text>
                    <Text style={styles.metaText}>📅 {new Date(session.dataHora).toLocaleString('pt-BR')}</Text>
                    <Text style={styles.metaText}>💰 R$ {session.custoPeladeiro.toFixed(2)}</Text>
                    <Text style={styles.metaText}>👥 {session.peladeirosInscritos.length}/{session.vagas} vagas</Text>
                    {session.descricao && (
                      <Text style={styles.description}>{session.descricao}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: '#CCCCCC',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(204,204,204,0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionSport: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sessionLevel: {
    color: '#C7FF00',
    marginTop: 2,
  },
  cardBody: {
    marginTop: 4,
  },
  metaText: {
    color: '#CCCCCC',
    marginBottom: 4,
  },
  description: {
    color: '#CCCCCC',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(204,204,204,0.08)',
    paddingTop: 8,
  },
});