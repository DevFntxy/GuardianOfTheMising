package com.example.wearos_guardianofthemissing.presentation

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.SignalWifiOff
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.Icon
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.offset
import androidx.compose.material.icons.filled.Menu

/**
 * Configuración de cada tipo de alerta disponible.
 * Para añadir un nuevo tipo, agrega una entrada aquí con sus propios
 * textos, color y contenido de notificación. Aparecerá automáticamente
 * en el menú de selección sin tocar el resto del código.
 */
enum class AlertType(
    val menuLabel: String,
    val buttonTitle: String,
    val buttonSubtitle: String,
    val color: Color,
    val notificationTitle: String,
    val notificationText: String
) {
    PANICO(
        menuLabel = "Pánico",
        buttonTitle = "Botón de pánico",
        buttonSubtitle = "Presiona para enviar una alerta",
        color = Color(0xff9f0712),
        notificationTitle = "Alerta activada",
        notificationText = "Se presionó el botón principal."
    ),
    REPORTE(
        menuLabel = "Reporte",
        buttonTitle = "Botón de reporte",
        buttonSubtitle = "Presiona para enviar un aviso de reporte en tu zona",
        color = Color(0xff1447e6),
        notificationTitle = "Reporte enviado",
        notificationText = "Se presionó el botón de reporte."
    )
    // Nuevo tipo de alerta: agrega aquí otra entrada, ej.
    // MEDICO(menuLabel = "Médico", buttonTitle = "...", ..., color = Color(0xff...))
}

class MainActivity : ComponentActivity() {

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { /* No necesitamos hacer nada especial con el resultado por ahora */ }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        crearCanalNotificacion()
        pedirPermisoNotificaciones()

        setContent {
            WearApp(onBotonPrincipalPresionado = { tipo -> manejarClicBotonPrincipal(tipo) })
        }
    }

    private fun pedirPermisoNotificaciones() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ActivityCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                permissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    private fun crearCanalNotificacion() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val canal = NotificationChannel(
                CANAL_ID,
                "Alertas principales",
                NotificationManager.IMPORTANCE_HIGH
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(canal)
        }
    }

    private fun manejarClicBotonPrincipal(tipo: AlertType) {
        mostrarNotificacion(tipo)

        // Lógica adicional específica por tipo de alerta.
        // Añade aquí un nuevo "when" case por cada AlertType que definas en el enum.
        when (tipo) {
            AlertType.PANICO -> {
                // TODO: lógica adicional específica del botón de pánico
            }
            AlertType.REPORTE -> {
                // TODO: Aquí añade el resto de la lógica del botón de reporte
                // (ej. enviar ubicación, guardar el reporte, llamar a tu backend, etc.)
            }
        }
    }

    private fun mostrarNotificacion(tipo: AlertType) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ActivityCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                return
            }
        }

        val notificacion = NotificationCompat.Builder(this, CANAL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle(tipo.notificationTitle)
            .setContentText(tipo.notificationText)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        NotificationManagerCompat.from(this).notify(NOTIFICATION_ID, notificacion)
    }

    companion object {
        private const val CANAL_ID = "canal_principal"
        private const val NOTIFICATION_ID = 1
    }
}

@Composable
fun WearApp(onBotonPrincipalPresionado: (AlertType) -> Unit) {
    var tipoSeleccionado by remember { mutableStateOf(AlertType.PANICO) }
    var menuAbierto by remember { mutableStateOf(false) }

    // Diámetro editable del botón circular de selección de alerta
    val diametroBotonMenu = 40.dp

    MaterialTheme {
        Box(modifier = Modifier.fillMaxSize()) {

            // Botón principal: cambia color, textos y acción según tipoSeleccionado
            Button(
                onClick = { onBotonPrincipalPresionado(tipoSeleccionado) },
                modifier = Modifier
                    .fillMaxSize()
                    .padding(12.dp)
                    .align(Alignment.Center),
                colors = ButtonDefaults.buttonColors(backgroundColor = tipoSeleccionado.color)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = tipoSeleccionado.buttonTitle,
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                    Text(
                        text = tipoSeleccionado.buttonSubtitle,
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }

            IconoConectividad(modifier = Modifier.align(Alignment.TopCenter))

            // Botón circular que sobresale del borde inferior de la pantalla.
            // Se dibuja después del botón principal, por lo que queda por encima (z-order).
            // El offset hacia abajo de la mitad del diámetro deja solo el medio círculo
            // superior visible, ya que la mitad inferior queda fuera de los límites de pantalla.
            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .offset(y = diametroBotonMenu / 2)
                    .size(diametroBotonMenu)
                    .background(color = Color(0xff364153), shape = CircleShape)
                    .clickable { menuAbierto = true },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Menu,
                    contentDescription = "Seleccionar tipo de alerta",
                    tint = Color.White,
                    modifier = Modifier.size(diametroBotonMenu * 0.5f)
                )
            }

            // Menú de selección a pantalla completa, se dibuja al final para quedar
            // por encima de todo lo demás.
            if (menuAbierto) {
                MenuAlertas(
                    tipoSeleccionado = tipoSeleccionado,
                    onSeleccionar = { tipoSeleccionado = it },
                    onCerrar = { menuAbierto = false }
                )
            }
        }
    }
}

@Composable
fun MenuAlertas(
    tipoSeleccionado: AlertType,
    onSeleccionar: (AlertType) -> Unit,
    onCerrar: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.95f))
            .clickable(enabled = false) {} // evita que un toque en el fondo se propague al botón de abajo
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 12.dp, vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterVertically)
        ) {
            Text(
                text = "Selecciona el tipo de alerta",
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(bottom = 4.dp)
            )

            // Lista de opciones de alerta. Se genera automáticamente a partir del enum
            // AlertType, así que agregar un nuevo tipo ahí lo agrega también aquí.
            AlertType.values().forEach { tipo ->
                Button(
                    onClick = {
                        onSeleccionar(tipo)
                        onCerrar()
                    },
                    modifier = Modifier.fillMaxWidth(0.85f),
                    colors = ButtonDefaults.buttonColors(
                        backgroundColor = if (tipo == tipoSeleccionado) tipo.color else Color.DarkGray
                    )
                ) {
                    Text(text = tipo.menuLabel, color = Color.White, fontSize = 13.sp)
                }
            }
        }
    }
}

@Composable
fun IconoConectividad(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val esRedonda = LocalConfiguration.current.isScreenRound

    var conectado by remember { mutableStateOf(true) }

    DisposableEffect(Unit) {
        val connectivityManager =
            context.getSystemService(ConnectivityManager::class.java)

        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                conectado = true
            }

            override fun onLost(network: Network) {
                conectado = false
            }
        }

        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()

        connectivityManager.registerNetworkCallback(request, callback)

        onDispose {
            connectivityManager.unregisterNetworkCallback(callback)
        }
    }

    // En pantallas redondas el contenido de las esquinas se recorta,
    // por eso usamos más padding superior para que el ícono quede visible
    val paddingSuperior = if (esRedonda) 18.dp else 8.dp

    Box(
        modifier = modifier
            .padding(top = paddingSuperior)
            .size(28.dp)
            .background(color = Color.Black.copy(alpha = 0.35f), shape = CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = if (conectado) Icons.Default.Wifi else Icons.Default.SignalWifiOff,
            contentDescription = if (conectado) "Conectado" else "Sin conexión",
            tint = if (conectado) Color.Green else Color.Gray,
            modifier = Modifier.size(16.dp)
        )
    }
}