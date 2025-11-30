import React from 'react';
import { Text, View } from 'react-native';

interface SessionMapProps {
    latitude: number;
    longitude: number;
    onLocationSelect: (lat: number, lng: number) => void;
}

export default function SessionMap({ latitude, longitude }: SessionMapProps) {
    return (
        <View style={{
            height: 250,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#333',
            backgroundColor: '#1E1E1E',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
        }}>
            <Text style={{ color: '#888', textAlign: 'center', marginBottom: 8 }}>
                Visualização do mapa indisponível na versão Web.
            </Text>
            <Text style={{ color: '#C7FF00', fontWeight: 'bold' }}>
                Lat: {latitude.toFixed(4)} | Long: {longitude.toFixed(4)}
            </Text>
        </View>
    );
}