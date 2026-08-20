# 🚀 Guía de Inicio Oficial: Guardian of the Missing (Red Global)

Este documento contiene todos los comandos exactos y las credenciales que necesitas para levantar el ecosistema completo del proyecto desde cero en tu computadora. Con esta configuración, **tu app móvil funcionará desde cualquier lugar con Datos Móviles (4G/5G)** sin importar en qué red Wi-Fi se encuentre tu computadora.

Para trabajar de la manera más cómoda, abre **3 ventanas de terminal (consola) distintas**, una para cada parte del servidor.

---

## 1️⃣ Servidor Backend (FastAPI)
Este es el cerebro del sistema. Se encarga de conectar la base de datos y repartir los mensajes (alertas, mapas de calor, geocercas) en tiempo real.

**Comandos (Terminal 1):**
```cmd
cd C:\Users\garci\Desktop\GuardianOfTheMising
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 2️⃣ Túnel Público (Localtunnel)
Para que el celular en la calle (con datos móviles) pueda llegar a tu computadora (que está escondida detrás del internet de la universidad o tu casa), necesitamos un "túnel" público.

**Comandos (Terminal 2):**
Abre una nueva ventana y ejecuta:
```cmd
npx localtunnel --port 8000 --subdomain guardian-backend-1234
```
*Asegúrate de que la terminal responda:* `your url is: https://guardian-backend-1234.loca.lt`.
*(Si alguna vez el subdominio está ocupado, puedes cambiar "1234" por otro número, pero tendrías que actualizar también el archivo `.env` del celular).*

---

## 3️⃣ Panel de Control Web (Angular)
Este es el Dashboard donde la policía o familiares recibirán las alertas en tiempo real y verán el mapa.

**Comandos (Terminal 3):**
```cmd
cd C:\Users\garci\Desktop\GuardianOfTheMising\frontend\web
npm start
```
*Una vez que termine de cargar, entra en tu navegador a:* [http://localhost:4200](http://localhost:4200)

> [!TIP]
> **Credenciales de Prueba (Web):**
> - **Correo:** `diegomiguel04@gmail.com`
> - **Contraseña:** `diego123#`

---

## 4️⃣ Aplicación Móvil Nativa (Android APK)
¡Tu app ya no depende de Expo Go! Es una aplicación Android nativa, real e independiente.

**Instalación Rápida:**
El archivo `.apk` final y listo para instalar siempre lo encontrarás en esta ruta:
`C:\Users\garci\Desktop\GuardianOfTheMising\frontend\android\android\app\build\outputs\apk\release\app-release.apk`
Simplemente pásatelo por cable o correo a tu celular e instálalo.

**¿Cómo actualizar la App si le cambias código al diseño?**
Si haces modificaciones en la interfaz o funciones de React Native, solo abre una consola, entra a la carpeta de Android y re-empaqueta la app con este comando (toma unos segundos):
```cmd
cd C:\Users\garci\Desktop\GuardianOfTheMising\frontend\android\android
gradlew assembleRelease
```
El nuevo `.apk` con tus cambios reemplazará automáticamente al anterior en la carpeta.

---

## 🔄 Flujo de Prueba / Presentación Final
Cuando quieras demostrarle el proyecto a tus maestros en la Universidad, sigue este orden exacto:

1. Levanta el **Backend** en la Terminal 1.
2. Levanta el **Localtunnel** en la Terminal 2. *(Obligatorio, de lo contrario la app celular arrojará error de red).*
3. Levanta la **Página Web** en la Terminal 3 e inicia sesión. Déjala a la vista en pantalla completa.
4. Apaga el Wi-Fi de tu celular Android y déjalo **solo en Datos Móviles (4G)**.
5. Abre la aplicación de `GuardianOfTheMissing` en tu celular.
6. **Magia 1:** Presiona el **Botón de Pánico**. Verás cómo la alerta viaja desde la calle directamente a la pantalla de tu computadora en fracciones de segundo usando WebSockets.
7. **Magia 2:** Ve a `Contactos` en la app, toca un familiar y presiona **"Mensaje WhatsApp (SOS)"**. Te abrirá WhatsApp con un link de Google Maps con tu latitud y longitud en vivo.
8. **Magia 3:** Ve a `Geocercas` y admira cómo las alertas se enciman para crear el **Mapa de Calor** en zonas rojas y amarillas para la comunidad.

¡Éxito total en la presentación! 🚀
