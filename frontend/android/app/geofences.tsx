import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polygon, MapPressEvent } from 'react-native-maps';
import BottomNavBar from './BottomNavBar';

interface Punto {
    latitude: number;
    longitude: number;
}

export default function Geofences() {
    const [modoDibujo, setModoDibujo] = useState(false);
    const [puntos, setPuntos] = useState<Punto[]>([]);
    const [pin, setPin] = useState<Punto | null>(null);

    const manejarToqueMapa = (evento: MapPressEvent) => {
        const coordenada = evento.nativeEvent.coordinate;

        if (modoDibujo) {
            setPuntos((prev) => [...prev, coordenada]); // Modo geocerca: cada toque agrega un punto al polígono
        } else {
            setPin(coordenada); // Modo normal: coloca un pin único
        }
    };

    const limpiarGeocerca = () => {
        setPuntos([]);
    };

    const guardarGeocerca = () => {
        if (puntos.length < 3) { return; }
        // Aquí envías `puntos` a tu backend / storage
        console.log('Geocerca guardada:', puntos);
        setModoDibujo(false);
        setPuntos([]);
    };

    return (
        <SafeAreaView className="flex-1 bg-mint-50">
        <View className="px-5 pt-4 pb-3 bg-white">
            <Text className="text-xl font-bold text-slate-900">Geocercas</Text>
        </View>
        {/* Contenedor del mapa */}
        <View className="flex-1 mx-4 my-4 rounded-2xl overflow-hidden shadow-sm">
            <MapView style={{ flex: 1 }} initialRegion={{ latitude: 20.393, longitude: -98.203, latitudeDelta: 0.05, longitudeDelta: 0.05, }} onPress={manejarToqueMapa}>
            {pin && <Marker coordinate={pin} title="Ubicación" />}
            {puntos.length > 0 && ( <Polygon coordinates={puntos} fillColor="rgba(26, 143, 111, 0.25)" strokeColor="#1a8f6f" strokeWidth={2} /> )}
            {puntos.map((punto, index) => (
                <Marker key={index} coordinate={punto} pinColor="#1a5c4a" />
            ))}
            </MapView>
        </View>
        {/* Controles */}
        <View className="px-4 pb-4 flex-row justify-between">
            <TouchableOpacity onPress={() => { setModoDibujo(!modoDibujo); setPuntos([]); }}
            className={`px-4 py-2.5 rounded-full ${ modoDibujo ? 'bg-mint-800' : 'bg-mint-700' }`}>
            <Text className="text-white font-semibold text-sm">
                {modoDibujo ? 'Cancelar dibujo' : 'Nueva geocerca'}
            </Text>
            </TouchableOpacity>
            {modoDibujo && (
                <View className="flex-row">
                    <TouchableOpacity onPress={limpiarGeocerca} className="bg-mint-600 px-4 py-2.5 rounded-full mr-2">
                        <Text className="text-mint-700 font-semibold text-sm">Limpiar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={guardarGeocerca} className="bg-mint-400 px-4 py-2.5 rounded-full" >
                        <Text className="text-mint-700 font-semibold text-sm">Guardar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
        <BottomNavBar/>
        </SafeAreaView>
    );
}
