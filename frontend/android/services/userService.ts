export interface ContactGroup {
    id: number;
    name: string;
    contactIds: number[];
}

export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    bloodType: string;
    phonenumber: number;
    contactIds: number[];
    groups: ContactGroup[];
    state: string;
    pfp: string;
    lat: number;
    long: number;
    lastUbication: { lat: number; long: number };
    role: string;
}

// Datos estáticos de prueba.
// TODO: cuando exista backend real, reemplazar estas funciones por llamadas fetch/axios a la API,
// manteniendo la misma firma (mismos parámetros y mismo tipo de retorno) para no tener que tocar los componentes.
const usuarios: User[] = [
    {
        id: 0, username: 'DiegoMiguel04', email: 'diegomiguel04@gmail.com', password: 'diego123#',
        bloodType: 'O+', phonenumber: 7761396262, contactIds: [1, 2, 3, 4, 5],
        groups: [{ id: 1, name: 'Familia', contactIds: [1, 2, 3] }],
        state: 'Activo', pfp: 'https://example.com/avatar.png', lat: 10, long: 9,
        lastUbication: { lat: 10, long: 8 }, role: 'admin'
    },
    {
        id: 1, username: 'DiegoM22', email: 'diegom22@gmail.com', password: 'diego123#',
        bloodType: 'O+', phonenumber: 7761396262, contactIds: [], groups: [],
        state: 'Inactivo', pfp: 'https://example.com/avatar.png', lat: 10, long: 9,
        lastUbication: { lat: 10, long: 8 }, role: 'user'
    },
    {
        id: 2, username: 'DiegoMC_77', email: 'diegomc77@gmail.com', password: 'diego123#',
        bloodType: 'O+', phonenumber: 7761396262, contactIds: [], groups: [],
        state: 'Inactivo', pfp: 'https://example.com/avatar.png', lat: 10, long: 9,
        lastUbication: { lat: 10, long: 8 }, role: 'user'
    },
];

// Usuario con sesión iniciada (equivalente al signal _usuarioActualId de Angular).
// TODO: en un futuro esto podría vivir en un Context de React o en AsyncStorage para persistencia.
let usuarioActualId: number | null = null;

import { apiFetch, setAuthToken, removeAuthToken } from './api';

export const UserService = {
    async apiLogin(correo: string, contrasena: string) {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ correo, contrasena }),
        });
        if (data.access_token) {
            await setAuthToken(data.access_token);
            // Obtenemos el perfil real para guardarlo en la cache
            const me = await apiFetch('/usuarios/me');
            const mappedUser: User = {
                id: me.id_usuario,
                username: me.nombre,
                email: me.correo,
                password: '',
                bloodType: me.tipo_sangre,
                phonenumber: me.telefono,
                contactIds: [],
                groups: [],
                state: 'Activo',
                pfp: '',
                lat: 0,
                long: 0,
                lastUbication: { lat: 0, long: 0 },
                role: me.id_rol === 1 ? 'admin' : 'user'
            };
            // Lo metemos al arreglo falso para que las demas vistas sigan funcionando
            usuarios.push(mappedUser);
            this.iniciarSesion(mappedUser.id);
        }
        return data;
    },

    async apiRegister(data: any) {
        return await apiFetch('/auth/registro', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    getUsuarios(): User[] {
        return usuarios;
    },

    buscarPorEmail(email: string): User | undefined {
        return usuarios.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    },

    existeEmail(email: string): boolean {
        return this.buscarPorEmail(email) !== undefined;
    },

    // --- Sesión ---
    iniciarSesion(userId: number) {
        usuarioActualId = userId;
    },

    cerrarSesion() {
        usuarioActualId = null;
    },

    getUsuarioActual(): User | null {
        if (usuarioActualId === null) return null;
        return usuarios.find(u => u.id === usuarioActualId) ?? null;
    },

    // --- Actualizar usuario ---
    updateUser(id: number, changes: Partial<User>): void {
        const index = usuarios.findIndex(u => u.id === id);
        if (index === -1) return;

        usuarios[index] = { ...usuarios[index], ...changes };
    },

    // --- Contactos ---
    getContactos(userId: number): User[] {
        const usuario = usuarios.find(u => u.id === userId);
        if (!usuario) return [];

        return usuarios.filter(u => usuario.contactIds.includes(u.id));
    },

    agregarContacto(userId: number, contactId: number): boolean {
        const existeUsuarioContacto = usuarios.some(u => u.id === contactId);
        if (!existeUsuarioContacto || userId === contactId) {
            return false;
        }

        const usuario = usuarios.find(u => u.id === userId);
        if (!usuario || usuario.contactIds.includes(contactId)) {
            return false;
        }

        this.updateUser(userId, {
            contactIds: [...usuario.contactIds, contactId]
        });
        return true;
    },

    eliminarContacto(userId: number, contactId: number): void {
        const usuario = usuarios.find(u => u.id === userId);
        if (!usuario) return;

        this.updateUser(userId, {
            contactIds: usuario.contactIds.filter(id => id !== contactId)
        });
    },

    // --- Grupos ---
    crearGrupo(userId: number, nombreGrupo: string, contactIds: number[]): boolean {
        const usuario = usuarios.find(u => u.id === userId);
        if (!usuario) return false;

        const contactosValidos = contactIds.filter(id => usuario.contactIds.includes(id));

        const nuevoGrupo: ContactGroup = {
            id: Date.now(), // fecha estática de prueba
            name: nombreGrupo,
            contactIds: contactosValidos
        };

        this.updateUser(userId, {
            groups: [...usuario.groups, nuevoGrupo]
        });
        return true;
    },

    eliminarGrupo(userId: number, groupId: number): void {
        const usuario = usuarios.find(u => u.id === userId);
        if (!usuario) return;

        this.updateUser(userId, {
            groups: usuario.groups.filter(g => g.id !== groupId)
        });
    },

    getContactosDeGrupo(userId: number, groupId: number): User[] {
        const usuario = usuarios.find(u => u.id === userId);
        if (!usuario) return [];

        const grupo = usuario.groups.find(g => g.id === groupId);
        if (!grupo) return [];

        return usuarios.filter(u => grupo.contactIds.includes(u.id));
    },

    // Ejemplo de cómo se vería la versión real con backend, para cuando llegue el momento:
    /*
    async buscarPorEmail(email: string): Promise<User | undefined> {
        const respuesta = await fetch(`https://api.tuapp.com/usuarios?email=${email}`);
        const data = await respuesta.json();
        return data;
    },
    */
};

