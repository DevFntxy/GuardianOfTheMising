import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Accelerometer } from 'expo-sensors';

// Controla cómo se muestra la notificación mientras la app está en primer plano.
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Pide (si hace falta) el permiso de notificaciones.
 * Devuelve true si quedó concedido, false si el usuario lo negó.
 */
const asegurarPermisoNotificaciones = async (): Promise<boolean> => {
    const { status: statusActual } = await Notifications.getPermissionsAsync();
    let status = statusActual;

    if (status !== 'granted') {
        const { status: nuevoStatus } = await Notifications.requestPermissionsAsync();
        status = nuevoStatus;
    }

    if (status !== 'granted') {
        Alert.alert(
            'Permiso necesario',
            'Activa las notificaciones para recibir la confirmación de este reporte.'
        );
        return false;
    }

    return true;
};

/**
 * Envía el reporte de emergencia (notificación nativa local).
 * TODO: aquí se enviaría también el reporte real al backend / AlertsService.
 */
export const activarBotonPanico = async () => {
    const permisoConcedido = await asegurarPermisoNotificaciones();
    if (!permisoConcedido) return;

    // En Android es obligatorio un canal para que la notificación suene/vibre.
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('panico', {
            name: 'Alertas de pánico',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
        });
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Reporte de emergencia enviado',
            body: 'Tu equipo y tus contactos de confianza han sido notificados en tiempo real.',
            sound: true,
        },
        trigger: null, // null = disparo inmediato
    });
};

/**
 * Envía un reporte de aviso de seguridad en la zona (notificación nativa local).
 * TODO: aquí se enviaría también el reporte real al backend / AlertsService.
 */
export const enviarAlertaSeguridad = async () => {
    const permisoConcedido = await asegurarPermisoNotificaciones();
    if (!permisoConcedido) return;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('seguridad', {
            name: 'Alertas de seguridad',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 150, 150, 150],
        });
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Reporte de seguridad enviado',
            body: 'Has notificado un aviso de seguridad en tu zona a otros usuarios cercanos.',
            sound: true,
        },
        trigger: null,
    });
};

// --- Detección de shake ---

const UMBRAL_ACELERACION = 1.8; // fuerza mínima (en g) para considerarlo un "agitón"
const INTERVALO_LECTURA_MS = 100;
const COOLDOWN_MS = 3000; // evita disparos repetidos por un solo shake sostenido

/**
 * Hook que activa el botón de pánico automáticamente al detectar que el usuario
 * agita el dispositivo. Solo funciona mientras el componente que lo usa está montado
 * (app abierta en primer plano o background reciente); no funciona con la app cerrada.
 */
export function useShakeParaPanico(activo: boolean = true) {
    const ultimoDisparo = useRef(0);

    useEffect(() => {
        if (!activo) return;

        Accelerometer.setUpdateInterval(INTERVALO_LECTURA_MS);

        const suscripcion = Accelerometer.addListener(({ x, y, z }) => {
            const fuerza = Math.sqrt(x * x + y * y + z * z);

            if (fuerza > UMBRAL_ACELERACION) {
                const ahora = Date.now();
                if (ahora - ultimoDisparo.current > COOLDOWN_MS) {
                    ultimoDisparo.current = ahora;
                    activarBotonPanico();
                }
            }
        });

        return () => {
            suscripcion.remove();
        };
    }, [activo]);
}