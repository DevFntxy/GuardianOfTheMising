import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DeviceContacts from 'expo-contacts';

type ContactoAgenda = {
    id?: string;
    name?: string;
    phoneNumbers?: { number?: string }[];
};

import BottomNavBar from './BottomNavBar';
import { UserService, User, ContactGroup } from '../services/userService';

type Vista = 'contactos' | 'grupos' | 'usuarios';

const RESULTADOS_POR_PAGINA = 10;

export default function Contacts() {
    const usuarioActual = UserService.getUsuarioActual();
    const esAdmin = usuarioActual?.role === 'admin';

    const [vista, setVista] = useState<Vista>('contactos');
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);

    const [modalMiembrosAbierto, setModalMiembrosAbierto] = useState(false);
    const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState<number | null>(null);

    // --- Agregar contacto (agenda del teléfono) ---
    const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
    const [contactosTelefono, setContactosTelefono] = useState<ContactoAgenda[]>([]);
    const [cargandoContactos, setCargandoContactos] = useState(false);
    const [errorContactos, setErrorContactos] = useState('');
    const [busquedaTelefono, setBusquedaTelefono] = useState('');

    // --- Crear grupo ---
    const [modalGrupoAbierto, setModalGrupoAbierto] = useState(false);
    const [nombreNuevoGrupo, setNombreNuevoGrupo] = useState('');
    const [seleccionados, setSeleccionados] = useState<number[]>([]);
    const [errorModalGrupo, setErrorModalGrupo] = useState('');

    const cambiarVista = (v: Vista) => { setVista(v); setBusqueda(''); setPaginaActual(1); };

    // --- Datos base según vista ---
    const contactos: User[] = usuarioActual ? UserService.getContactos(usuarioActual.id) : [];
    const grupos: ContactGroup[] = usuarioActual?.groups ?? [];
    const usuariosTotales: User[] = esAdmin ? UserService.getUsuarios() : [];

    // --- Filtrado por búsqueda ---
    const contactosFiltrados = contactos.filter(c => c.username.toLowerCase().includes(busqueda.toLowerCase()) );
    const gruposFiltrados = grupos.filter(g => g.name.toLowerCase().includes(busqueda.toLowerCase()) );
    const usuariosFiltrados = usuariosTotales.filter(u => u.username.toLowerCase().includes(busqueda.toLowerCase()) );

    // --- Paginación (según vista activa) ---
    const datosActivos = vista === 'contactos' ? contactosFiltrados : vista === 'grupos' ? gruposFiltrados : usuariosFiltrados;

    const totalPaginas = Math.max(1, Math.ceil(datosActivos.length / RESULTADOS_POR_PAGINA));
    const inicio = (paginaActual - 1) * RESULTADOS_POR_PAGINA;

    const contactosPaginados = contactosFiltrados.slice(inicio, inicio + RESULTADOS_POR_PAGINA);
    const gruposPaginados = gruposFiltrados.slice(inicio, inicio + RESULTADOS_POR_PAGINA);
    const usuariosPaginados = usuariosFiltrados.slice(inicio, inicio + RESULTADOS_POR_PAGINA);

    const irAPagina = (pagina: number) => { if (pagina < 1 || pagina > totalPaginas) return; setPaginaActual(pagina); };

    // --- Grupos: ver miembros / eliminar ---
    const grupoSeleccionado = grupos.find(g => g.id === grupoSeleccionadoId) ?? null;
    const miembrosDelGrupo: User[] = (usuarioActual && grupoSeleccionado) ? UserService.getContactosDeGrupo(usuarioActual.id, grupoSeleccionado.id) : [];

    const verMiembros = (groupId: number) => { setGrupoSeleccionadoId(groupId); setModalMiembrosAbierto(true); };
    const cerrarModalMiembros = () => { setModalMiembrosAbierto(false); setGrupoSeleccionadoId(null); };
    const eliminarGrupo = (groupId: number) => { if (!usuarioActual) return; UserService.eliminarGrupo(usuarioActual.id, groupId); setPaginaActual(1); };
    const eliminarMiembro = (contactId: number) => {
        if (!usuarioActual || !grupoSeleccionado) return;
        const nuevosIds = grupoSeleccionado.contactIds.filter(id => id !== contactId);
        const nuevosGrupos = usuarioActual.groups.map(g =>
            g.id === grupoSeleccionado.id ? { ...g, contactIds: nuevosIds } : g
        );
        UserService.updateUser(usuarioActual.id, { groups: nuevosGrupos });
    };

    // Deja solo dígitos, para comparar números sin importar formato (espacios, guiones, +52, etc.)
    const soloDigitos = (valor: string) => valor.replace(/\D/g, '');

    // --- Agregar contacto: pedir permiso SOLO para leer nombre + teléfono de la agenda ---
    const abrirModalAgregar = async () => {
        setErrorContactos('');
        setBusquedaTelefono('');
        setModalAgregarAbierto(true);
        setCargandoContactos(true);

        const { status } = await DeviceContacts.requestPermissionsAsync();
        if (status !== 'granted') { setErrorContactos('Se necesita permiso para acceder a tus contactos.'); setCargandoContactos(false); return; }
        // Solo se leen nombre y números de teléfono; nada más se usa ni se guarda.
        const { data } = await DeviceContacts.getContactsAsync({ fields: [DeviceContacts.Fields.PhoneNumbers], });

        setContactosTelefono(data.filter(c => c.name && c.phoneNumbers && c.phoneNumbers.length > 0));
        setCargandoContactos(false);
    };

    const cerrarModalAgregar = () => { setModalAgregarAbierto(false); setErrorContactos(''); };

    const seleccionarContactoTelefono = (contactoTelefono: ContactoAgenda) => {
        if (!usuarioActual) return;
        const numeroAgenda = soloDigitos(contactoTelefono.phoneNumbers?.[0]?.number ?? '');

        // Única comparación permitida: ¿el teléfono de la agenda ya pertenece a una cuenta registrada?
        const usuarioEncontrado = UserService.getUsuarios().find( u => soloDigitos(String(u.phonenumber)) === numeroAgenda );
        if (!usuarioEncontrado) { Alert.alert('No encontrado', 'Este número no está registrado en la plataforma.'); return; }

        const agregado = UserService.agregarContacto(usuarioActual.id, usuarioEncontrado.id);
        if (!agregado) { Alert.alert('Aviso', 'Este contacto ya está en tu lista.'); return; }

        Alert.alert('Listo', `${usuarioEncontrado.username} fue agregado a tus contactos.`);
        cerrarModalAgregar();
    };

    const contactosTelefonoFiltrados = contactosTelefono.filter(c => (c.name ?? '').toLowerCase().includes(busquedaTelefono.toLowerCase()) );

    // --- Crear grupo ---
    const abrirModalGrupo = () => { setNombreNuevoGrupo(''); setSeleccionados([]); setErrorModalGrupo(''); setModalGrupoAbierto(true); };
    const cancelarModalGrupo = () => { setModalGrupoAbierto(false); };
    const toggleSeleccionado = (contactId: number) => { setSeleccionados(prev => prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId] ); };

    const confirmarCrearGrupo = () => {
        if (!usuarioActual) return;
        if (nombreNuevoGrupo.trim() === '') { setErrorModalGrupo('El nombre del grupo es obligatorio.'); return; }
        if (seleccionados.length < 2) { setErrorModalGrupo('Selecciona al menos 2 contactos.'); return; }

        UserService.crearGrupo(usuarioActual.id, nombreNuevoGrupo.trim(), seleccionados);
        setModalGrupoAbierto(false);
        setPaginaActual(1);
    };

    return (
        <SafeAreaView className="flex-1 bg-mint-50">
            {/* Header */}
            <View className="px-5 pt-4 pb-3 bg-white">
                <Text className="text-xl font-bold text-slate-900 mb-3">Contactos</Text>
                {/* Tabs */}
                <View className="flex-row mb-3">
                    <TouchableOpacity onPress={() => cambiarVista('contactos')} className={`px-4 py-2 rounded-full mr-2 ${vista === 'contactos' ? 'bg-mint-800' : 'bg-mint-700'}`}>
                        <Text className="text-xs font-semibold text-white">Contactos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => cambiarVista('grupos')} className={`px-4 py-2 rounded-full mr-2 ${vista === 'grupos' ? 'bg-mint-800' : 'bg-mint-700'}`}>
                        <Text className="text-xs font-semibold text-white">Grupos</Text>
                    </TouchableOpacity>
                    {esAdmin && (
                        <TouchableOpacity onPress={() => cambiarVista('usuarios')} className={`px-4 py-2 rounded-full mr-2 ${vista === 'usuarios' ? 'bg-mint-800' : 'bg-mint-700'}`}>
                            <Text className="text-xs font-semibold text-white">Usuarios</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View className="flex-row items-center">
                    <TextInput className="flex-1 bg-mint-100 border border-mint-200 rounded-full h-11 px-4 text-sm text-slate-900"
                        placeholder={ vista === 'contactos' ? 'Buscar contacto...' : vista === 'grupos' ? 'Buscar grupo...' : 'Buscar usuario...' }
                        placeholderTextColor="#3a4a52" value={busqueda} onChangeText={(t) => { setBusqueda(t); setPaginaActual(1); }} autoCapitalize="none" />
                    {vista === 'contactos' && (
                        <TouchableOpacity onPress={abrirModalAgregar} className="w-11 h-11 rounded-full bg-mint-700 items-center justify-center ml-3">
                            <Text className="text-white text-xl font-bold">+</Text>
                        </TouchableOpacity>
                    )}
                    {vista === 'grupos' && (
                        <TouchableOpacity onPress={abrirModalGrupo} className="w-11 h-11 rounded-full bg-mint-700 items-center justify-center ml-3">
                            <Text className="text-white text-xl font-bold">+</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            {/* Contenido */}
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
                {/* --- VISTA CONTACTOS --- */}
                {vista === 'contactos' && (
                    <>
                        {contactosPaginados.length === 0 && (
                            <Text className="text-center text-slate-700 text-sm mt-6">
                                {contactos.length === 0 ? 'Aún no tienes contactos agregados.' : 'No se encontraron contactos con ese criterio.'}
                            </Text>
                        )}
                        {contactosPaginados.map((contacto) => (
                            <View key={contacto.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row items-center">
                                        <View className="w-8 h-8 rounded-full bg-slate-900 mr-2" />
                                        <Text className="text-slate-900 font-semibold text-sm" numberOfLines={1}>{contacto.username}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className="text-slate-700 text-xs mr-1">Teléfono:</Text>
                                        <Text className="text-slate-900 font-bold text-xs mr-6">{contacto.phonenumber}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </>
                )}
                {/* --- VISTA GRUPOS --- */}
                {vista === 'grupos' && (
                    <>
                        {gruposPaginados.length === 0 && (
                            <Text className="text-center text-slate-700 text-sm mt-6">{grupos.length === 0 ? 'Aún no has creado ningún grupo.' : 'No se encontraron grupos con ese nombre.'}</Text>
                        )}
                        {gruposPaginados.map((grupo) => (
                            <View key={grupo.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                                <View className="flex-row items-center mb-3">
                                    <View className="w-8 h-8 rounded-full bg-slate-900 mr-2" />
                                    <Text className="text-slate-900 font-semibold text-sm" numberOfLines={1}>{grupo.name}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <TouchableOpacity onPress={() => verMiembros(grupo.id)} className="bg-mint-700 px-4 py-1.5 rounded-full">
                                        <Text className="text-white text-xs font-bold">Ver miembros</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => eliminarGrupo(grupo.id)} className="bg-red-800 px-4 py-1.5 rounded-full">
                                        <Text className="text-white text-xs font-bold">Eliminar grupo</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </>
                )}
                {/* --- VISTA USUARIOS (solo admin) --- */}
                {vista === 'usuarios' && esAdmin && (
                    <>
                        {usuariosPaginados.length === 0 && (
                            <Text className="text-center text-slate-700 text-sm mt-6">No se encontraron usuarios con ese criterio.</Text>
                        )}
                        {usuariosPaginados.map((user) => (
                            <View key={user.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                                <View className="flex-row items-center mb-2">
                                    <View className="w-8 h-8 rounded-full bg-slate-900 mr-2" />
                                    <Text className="text-slate-900 font-semibold text-sm" numberOfLines={1}>
                                        {user.username}
                                    </Text>
                                </View>
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row items-center">
                                        <Text className="text-slate-700 text-xs mr-1">Correo:</Text>
                                        <Text className="text-slate-900 font-bold text-xs">{user.email}</Text>
                                    </View>
                                    <View className="flex-row items-center bg-mint-700 rounded-full overflow-hidden">
                                        <View className="px-3 py-1.5 z-10">
                                            <Text className="text-white text-xs font-bold">Estado</Text>
                                        </View>
                                        <View className="bg-mint-100 px-3 py-1.5 rounded-full -ml-1 z-0">
                                            <Text className="text-slate-900 text-xs font-semibold">{user.state}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </>
                )}
                {/* Controles de paginación */}
                {datosActivos.length > 0 && (
                    <View className="flex-row justify-center items-center mt-2">
                        <TouchableOpacity onPress={() => irAPagina(paginaActual - 1)} disabled={paginaActual === 1}
                            className={`w-9 h-9 rounded-full items-center justify-center mr-2 ${paginaActual === 1 ? 'bg-mint-300' : 'bg-mint-700' }`}>
                            <Text className="text-white font-bold">‹</Text>
                        </TouchableOpacity>
                        <Text className="text-slate-900 font-semibold text-sm mx-2">Página {paginaActual} de {totalPaginas}</Text>
                        <TouchableOpacity onPress={() => irAPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}
                            className={`w-9 h-9 rounded-full items-center justify-center ml-2 ${paginaActual === totalPaginas ? 'bg-mint-300' : 'bg-mint-700'}`}>
                            <Text className="text-white font-bold">›</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
            {/* Modal: miembros del grupo */}
            <Modal visible={modalMiembrosAbierto} transparent animationType="fade" onRequestClose={cerrarModalMiembros}>
                <View className="flex-1 bg-black/40 items-center justify-center px-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-h-[70%]">
                        <Text className="text-lg font-bold text-slate-900 mb-4">Miembros del grupo</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {miembrosDelGrupo.length === 0 && ( <Text className="text-slate-700 text-sm font-semibold">Este grupo ya no tiene miembros.</Text> )}
                            {miembrosDelGrupo.map((miembro) => (
                                <View key={miembro.id} className="flex-row items-center justify-between bg-mint-100 rounded-xl px-4 py-3 mb-2">
                                    <Text className="text-slate-900 font-semibold text-sm">{miembro.username}</Text>
                                    <TouchableOpacity onPress={() => eliminarMiembro(miembro.id)} className="bg-red-800 px-3 py-1.5 rounded-full">
                                        <Text className="text-white text-xs font-bold">Eliminar miembro</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={cerrarModalMiembros} className="bg-mint-700 rounded-full py-2.5 items-center mt-4">
                            <Text className="text-white font-bold text-sm">Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* Modal: agregar contacto desde el teléfono */}
            <Modal visible={modalAgregarAbierto} transparent animationType="fade" onRequestClose={cerrarModalAgregar}>
                <View className="flex-1 bg-black/40 items-center justify-center px-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-h-[75%]">
                        <Text className="text-lg font-bold text-slate-900 mb-4">Agregar contacto</Text>
                        {!cargandoContactos && !errorContactos && (
                            <TextInput className="bg-mint-100 border border-mint-200 rounded-full h-11 px-4 text-sm text-slate-900 mb-4"
                                placeholder="Buscar en tu agenda..." placeholderTextColor="#3a4a52" value={busquedaTelefono} onChangeText={setBusquedaTelefono} autoCapitalize="none" />
                        )}
                        {cargandoContactos && ( <Text className="text-slate-700 text-sm font-semibold">Cargando contactos...</Text> )}
                        {!cargandoContactos && errorContactos !== '' && ( <Text className="text-red-800 text-sm font-semibold">{errorContactos}</Text> )}
                        {!cargandoContactos && !errorContactos && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {contactosTelefonoFiltrados.length === 0 && (
                                    <Text className="text-slate-700 text-sm font-semibold">No se encontraron contactos en tu agenda.</Text>
                                )}
                                {contactosTelefonoFiltrados.map((c, index) => (
                                    <TouchableOpacity key={c.id ?? `${c.name}-${index}`} onPress={() => seleccionarContactoTelefono(c)} className="bg-mint-100 rounded-xl px-4 py-3 mb-2">
                                        <Text className="text-slate-900 font-semibold text-sm">{c.name}</Text>
                                        {c.phoneNumbers?.[0]?.number && (
                                            <Text className="text-slate-700 text-xs mt-1">{c.phoneNumbers[0].number}</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                        <TouchableOpacity onPress={cerrarModalAgregar} className="bg-mint-800 rounded-full py-2.5 items-center mt-4">
                            <Text className="text-white font-bold text-sm">Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* Modal: crear grupo */}
            <Modal visible={modalGrupoAbierto} transparent animationType="fade" onRequestClose={cancelarModalGrupo}>
                <View className="flex-1 bg-black/40 items-center justify-center px-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-h-[75%]">
                        <Text className="text-lg font-bold text-slate-900 mb-4">Crear nuevo grupo</Text>
                        <Text className="text-slate-900 font-semibold text-sm mb-1">Nombre del grupo</Text>
                        <TextInput className="bg-mint-100 border border-mint-200 rounded-xl h-11 px-4 text-sm text-slate-900 mb-4" 
                            placeholder="Ej. Familia" placeholderTextColor="#3a4a52" value={nombreNuevoGrupo} onChangeText={setNombreNuevoGrupo} />
                        <Text className="text-slate-900 font-semibold text-sm mb-2">Selecciona al menos 2 contactos</Text>
                        <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                            {contactos.length === 0 && (
                                <Text className="text-slate-700 text-sm font-semibold">No tienes contactos disponibles.</Text>
                            )}
                            {contactos.map((contacto) => {
                                const activo = seleccionados.includes(contacto.id);
                                return (
                                    <TouchableOpacity key={contacto.id} onPress={() => toggleSeleccionado(contacto.id)}
                                        className={`flex-row items-center justify-between px-4 py-3 rounded-xl mb-2 ${ activo ? 'bg-mint-700' : 'bg-mint-100' }`}>
                                        <Text className={`font-semibold text-sm ${activo ? 'text-white' : 'text-slate-900'}`}>{contacto.username}</Text>
                                        {activo && <Text className="text-white font-bold">✓</Text>}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                        {errorModalGrupo !== '' && ( <Text className="text-red-800 text-sm font-semibold mb-3">{errorModalGrupo}</Text> )}
                        <View className="flex-row justify-end">
                            <TouchableOpacity onPress={cancelarModalGrupo} className="bg-mint-100 px-6 py-2.5 rounded-full mr-3">
                                <Text className="text-mint-800 font-bold text-sm">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmarCrearGrupo} className="bg-mint-700 px-6 py-2.5 rounded-full">
                                <Text className="text-white font-bold text-sm">Crear grupo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <BottomNavBar />
        </SafeAreaView>
    );
}
