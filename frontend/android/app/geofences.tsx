import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from './BottomNavBar';
import { UserService } from '../services/userService';
import * as Location from 'expo-location';

import MapView, { Marker, Polygon, MapPressEvent } from 'react-native-maps';

interface Punto {
    latitude: number;
    longitude: number;
}

export default function Geofences() {
    const [modoDibujo, setModoDibujo] = useState(false);
    const [puntos, setPuntos] = useState<Punto[]>([]);
    const [pin, setPin] = useState<Punto | null>(null);
    const [regionActual, setRegionActual] = useState({ latitude: 20.393, longitude: -98.203, latitudeDelta: 0.05, longitudeDelta: 0.05 });

    const [geocercasGuardadas, setGeocercasGuardadas] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const iniciarUbicacion = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setRegionActual({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
            }
            cargarGeocercas();
        };
        iniciarUbicacion();
    }, []);

    const cargarGeocercas = async () => {
        try {
            setCargando(true);
            const data = await UserService.apiGetGeocercas();
            setGeocercasGuardadas(data || []);
            if (data && data.length === 0) {
                Alert.alert('Geocercas', 'Aún no tienes geocercas guardadas. Usa el botón "Nueva geocerca" para trazar una.');
            }
        } catch (e: any) {
            console.error('Error cargando geocercas:', e);
        } finally {
            setCargando(false);
        }
    };

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

    const guardarGeocerca = async () => {
        if (puntos.length < 3) {
            Alert.alert("Atención", "Una geocerca necesita al menos 3 puntos.");
            return;
        }

        try {
            // El backend de Sesni (MongoDB) espera formato GeoJSON
            const geojsonCoords = [
                ...puntos.map(p => [p.longitude, p.latitude]),
                [puntos[0].longitude, puntos[0].latitude] // Cerrar el polígono
            ];

            const coordObj = {
                type: "Polygon",
                coordinates: [geojsonCoords]
            };

            await UserService.apiGuardarGeocerca(coordObj as any);
            Alert.alert('Éxito', 'Geocerca guardada correctamente en MongoDB.');
            
            setModoDibujo(false);
            setPuntos([]);
            cargarGeocercas(); // recargar
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Error al guardar la geocerca');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-mint-50">
            <View className="px-5 pt-4 pb-3 bg-white">
                <Text className="text-xl font-bold text-slate-900">Geocercas</Text>
            </View>
            {/* Contenedor del mapa */}
            <View className="flex-1 mx-4 my-4 rounded-2xl overflow-hidden shadow-sm">
                {cargando && <Text className="absolute top-4 left-4 z-10 font-bold text-slate-900 bg-white/70 px-2 py-1 rounded">Cargando polígonos...</Text>}
                <MapView 
                    style={{ flex: 1 }} 
                    region={regionActual}
                    showsUserLocation={true}
                    onPress={manejarToqueMapa}
                >
                    {pin && <Marker coordinate={pin} title="Ubicación" />}
                    
                    {/* Renderizar polígono en dibujo actual */}
                    {puntos.length > 0 && ( <Polygon coordinates={puntos} fillColor="rgba(26, 143, 111, 0.25)" strokeColor="#1a8f6f" strokeWidth={2} /> )}
                    {puntos.map((punto, index) => (
                        <Marker key={`dibujo-${index}`} coordinate={punto} pinColor="#1a5c4a" />
                    ))}

                    {/* Renderizar geocercas guardadas desde MongoDB */}
                    {geocercasGuardadas.map((geo, index) => {
                        if (geo.coordenadas?.type === 'Polygon' && geo.coordenadas.coordinates?.[0]) {
                            // Convertir formato GeoJSON [long, lat] a formato React Native Maps {latitude, longitude}
                            const polygonCoords = geo.coordenadas.coordinates[0].map((coord: number[]) => ({
                                latitude: coord[1],
                                longitude: coord[0]
                            }));
                            return (
                                <Polygon key={geo.id || index} coordinates={polygonCoords} fillColor="rgba(200, 50, 50, 0.25)" strokeColor="#c83232" strokeWidth={2} />
                            );
                        }
                        return null;
                    })}
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
