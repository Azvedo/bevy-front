import React from 'react';
import { View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';

interface SessionMapProps {
    latitude: number;
    longitude: number;
    onLocationSelect: (lat: number, lng: number) => void;
}

export default function SessionMap({ latitude, longitude, onLocationSelect }: SessionMapProps) {
    return (
        <View style={{ height: 250, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#333' }}>
            <MapView
                style={{ flex: 1 }}
                region={{
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                onPress={(e: MapPressEvent) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    onLocationSelect(latitude, longitude);
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                <Marker
                    coordinate={{ latitude, longitude }}
                    title="Local da Pelada"
                    pinColor="#C7FF00"
                />
            </MapView>
        </View>
    );
}