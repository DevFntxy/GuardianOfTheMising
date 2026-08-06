import { UserService } from './userService';

export interface Alert {
    number: number;
    username: string;
    type: string;
    date: Date;
    lastUbication: { lat: number; long: number };
    state: string;
}

const usuarios = UserService.getUsuarios();

// Datos estáticos de prueba.
// TODO: cuando exista backend real, reemplazar por una llamada fetch/axios a la API,
// manteniendo la misma firma para no tener que tocar los componentes.
const alertas: Alert[] = [
    { number: 0, username: usuarios[0].username, type: 'Reporte', date: new Date('2026-07-22'), lastUbication: usuarios[0].lastUbication, state: 'Atendida' },
    { number: 1, username: usuarios[0].username, type: 'Emergencia', date: new Date('2026-07-21'), lastUbication: usuarios[0].lastUbication, state: 'Atendida' },
    { number: 2, username: usuarios[1].username, type: 'Reporte', date: new Date('2026-07-24'), lastUbication: usuarios[0].lastUbication, state: 'Pendiente' },
    { number: 3, username: usuarios[1].username, type: 'Reporte', date: new Date('2026-07-25'), lastUbication: usuarios[0].lastUbication, state: 'Pendiente' },
    { number: 4, username: usuarios[2].username, type: 'Reporte', date: new Date('2026-07-22'), lastUbication: usuarios[0].lastUbication, state: 'Pendiente' },
    { number: 5, username: usuarios[2].username, type: 'Reporte', date: new Date('2026-07-23'), lastUbication: usuarios[0].lastUbication, state: 'Atendida' },
    { number: 6, username: usuarios[1].username, type: 'Reporte', date: new Date('2026-07-23'), lastUbication: usuarios[0].lastUbication, state: 'Pendiente' },
    { number: 7, username: usuarios[2].username, type: 'Emergencia', date: new Date('2026-07-22'), lastUbication: usuarios[0].lastUbication, state: 'Pendiente' },
    { number: 8, username: usuarios[0].username, type: 'Reporte', date: new Date('2026-07-21'), lastUbication: usuarios[0].lastUbication, state: 'Pendiente' },
    { number: 9, username: usuarios[1].username, type: 'Reporte', date: new Date('2026-07-20'), lastUbication: usuarios[0].lastUbication, state: 'Pendiente' },
    { number: 10, username: usuarios[0].username, type: 'Emergencia', date: new Date('2026-07-19'), lastUbication: usuarios[0].lastUbication, state: 'Pendiente' },

    // TODO: cuando agregues los usuarios con id 3, 4, 5, 6 a tu userService,
    // puedes agregar más alertas aquí usando usuarios[3], usuarios[4], etc.
    // (en Angular estas alertas usaban user()[3], user()[4], user()[5], user()[6])
];

export const AlertsService = {
    getAlertas(): Alert[] {
        return alertas;
    },

    updateAlert(number: number, changes: Partial<Alert>): void {
        const index = alertas.findIndex(a => a.number === number);
        if (index === -1) return;

        alertas[index] = { ...alertas[index], ...changes };
    },

    // Devuelve las N alertas más recientes, ordenadas de más nueva a más antigua
    getUltimasAlertas(cantidad: number): Alert[] {
        return [...alertas]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, cantidad);
    },
};