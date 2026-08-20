import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from './BottomNavBar';
import { UserService } from '../services/userService';
import * as Location from 'expo-location';

import MapView, { Marker, Circle, MapPressEvent } from 'react-native-maps';

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
    const [alertasGlobales, setAlertasGlobales] = useState<any[]>([]);
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
            cargarDatosMapa();
        };
        iniciarUbicacion();
    }, []);

    const cargarDatosMapa = async () => {
        try {
            setCargando(true);
            const [geoData, alertasData] = await Promise.all([
                UserService.apiGetGeocercas().catch(() => []),
                UserService.apiGetAlertas().catch(() => [])
            ]);
            setGeocercasGuardadas(geoData || []);
            setAlertasGlobales(alertasData || []);
            
            if (geoData && geoData.length === 0) {
                Alert.alert('Geocercas', 'Aún no tienes geocercas guardadas. Usa el botón "Nueva geocerca" para trazar una.');
            }
        } catch (e: any) {
            console.error('Error cargando datos del mapa:', e);
        } finally {
            setCargando(false);
        }
    };

    const manejarToqueMapa = (e: MapPressEvent) => {
        if (!modoDibujo) {
            setPin(e.nativeEvent.coordinate);
            return;
        }
        // Solo permitimos 1 punto central para la geocerca circular
        setPuntos([e.nativeEvent.coordinate]);
    };

    const limpiarGeocerca = () => {
        setPuntos([]);
    };

    const guardarGeocerca = async () => {
        if (puntos.length === 0) {
            Alert.alert('Aviso', 'Toca el mapa para establecer el centro de la geocerca');
            return;
        }

        try {
            await UserService.apiGuardarGeocerca(puntos[0], 150); // Radio fijo de 150m por ahora
            
            Alert.alert('Éxito', 'Geocerca circular guardada correctamente');
            
            setModoDibujo(false);
            setPuntos([]);
            cargarDatosMapa(); // recargar
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Error al guardar la geocerca');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-mint-50">
            <View className="px-5 pt-4 pb-3 bg-white">
                <Text className="text-xl font-bold text-slate-900">Zonas de Riesgo</Text>
            </View>
            {/* Contenedor del mapa */}
            <View className="flex-1 mx-4 my-4 rounded-2xl overflow-hidden shadow-sm">
                {cargando && <Text className="absolute top-4 left-4 z-10 font-bold text-slate-900 bg-white/70 px-2 py-1 rounded">Cargando mapa de calor...</Text>}
                <MapView 
                    style={{ flex: 1 }} 
                    region={regionActual}
                    showsUserLocation={true}
                    onPress={manejarToqueMapa}
                >
                    {pin && <Marker coordinate={pin} title="Ubicación" />}
                    
                    {/* Renderizar circulo en dibujo actual */}
                    {puntos.length > 0 && ( <Circle center={puntos[0]} radius={150} fillColor="rgba(26, 143, 111, 0.25)" strokeColor="#1a8f6f" strokeWidth={2} /> )}
                    {puntos.map((punto, index) => (
                        <Marker key={`dibujo-${index}`} coordinate={punto} pinColor="#1a5c4a" />
                    ))}

                    {/* Renderizar Heatmap de Alertas Comunitarias */}
                    {alertasGlobales.map((alerta, index) => {
                        if (!alerta.latitud || !alerta.longitud) return null;
                        
                        const isPanico = alerta.nivel_riesgo === 'alta';
                        // Rojo para pánico, Amarillo para seguridad
                        const fillColor = isPanico ? "rgba(255, 0, 0, 0.15)" : "rgba(255, 204, 0, 0.15)";
                        
                        return (
                            <Circle 
                                key={`alerta-${alerta.id_alerta || index}`} 
                                center={{ latitude: alerta.latitud, longitude: alerta.longitud }} 
                                radius={200} 
                                fillColor={fillColor} 
                                strokeColor="transparent" 
                            />
                        );
                    })}

                    {/* Renderizar geocercas guardadas desde MySQL/Mongo */}
                    {geocercasGuardadas.map((geo, index) => {
                        if (geo.ubicacion?.type === 'Point' && geo.ubicacion.coordinates) {
                            const center = {
                                latitude: geo.ubicacion.coordinates[1],
                                longitude: geo.ubicacion.coordinates[0]
                            };
                            return (
                                <Circle key={`geo-${geo.id || index}`} center={center} radius={geo.radio_metros || 150} fillColor="rgba(26, 143, 111, 0.15)" strokeColor="#1a8f6f" strokeWidth={2} />
                            );
                        }
                        return null;
                    })}
                </MapView>
            </View>
            {/* Controles Flotantes */}
            <View className="absolute bottom-24 left-4 right-4 flex-row justify-between pointer-events-auto shadow-sm">
                <TouchableOpacity onPress={() => { setModoDibujo(!modoDibujo); setPuntos([]); }}
                    className={`px-5 py-3 rounded-full shadow-sm elevation-sm ${ modoDibujo ? 'bg-mint-800' : 'bg-mint-700' }`}>
                    <Text className="text-white font-bold text-[15px] shadow-sm">
                        {modoDibujo ? 'Cancelar dibujo' : '+ Nueva geocerca'}
                    </Text>
                </TouchableOpacity>
                {modoDibujo && (
                    <View className="flex-row">
                        <TouchableOpacity onPress={limpiarGeocerca} className="bg-white/90 border border-mint-600 px-5 py-3 rounded-full mr-2 shadow-sm">
                            <Text className="text-mint-700 font-bold text-[15px]">Limpiar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={guardarGeocerca} className="bg-mint-400 px-5 py-3 rounded-full shadow-sm" >
                            <Text className="text-mint-800 font-bold text-[15px]">Guardar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <BottomNavBar/>
        </SafeAreaView>
    );
}
