// Registrar el Service Worker  
if ("serviceWorker" in navigator) {  
  navigator.serviceWorker  
    .register("./sw.js")  
    .then((reg) => console.log("Registro de SW exitoso ", reg))  
    .catch((err) => console.error("Error al tratar de registrar el SW ", err));  
} else {  
  console.log("no hay serviceWorker");  
}  

// Variables globales  
let codigoIngresado = false;  
let intervaloUbicacion;  

// Solicitar permisos de notificación  
function solicitarPermisosNotificacion() {  
  if ("Notification" in window) {  
    Notification.requestPermission().then((result) => {  
      if (result === "granted") {  
        console.log("Permiso de notificación concedido.");  
      } else {  
        console.error("Permiso de notificación denegado.");  
      }  
    });  
  }  
}  

// Función para obtener la ubicación  
function obtenerUbicacion(codigoConductor) {  
  if (navigator.geolocation) {  
    navigator.geolocation.getCurrentPosition(  
      function (position) {  
        enviarUbicacion(position.coords.latitude, position.coords.longitude, codigoConductor);  
      },  
      function (error) {  
        console.error("Error al obtener la ubicación:", error.message);  
        document.getElementById("mensajeUbicacion").innerText = "Error al obtener la ubicación: " + error.message;  
      }  
    );  
  } else {  
    console.error("Geolocalización no soportada por este navegador.");  
    document.getElementById("mensajeUbicacion").innerText = "Geolocalización no soportada por este navegador.";  
  }  
}  

// Función para manejar el envío del código del conductor  
document.getElementById("btnEnviar").addEventListener("click", function () {  
  const codigoConductor = document.getElementById("codigoConductor").value;  
  obtenerNombreConductor(codigoConductor);  
});  

// Función para obtener el nombre del conductor  
function obtenerNombreConductor(codigo) {  
  const url = "https://script.google.com/macros/s/AKfycbx_kg6MTahza8LJ6USXH6DMk15cE19U39IeNuXgslHdQL5zGqiW-5FIBt6gjYLumz8txg/exec?codigo=" + codigo;  

  fetch(url)  
    .then((response) => response.json())  
    .then((data) => {  
      if (data.nombre) {  
        document.getElementById("nombreChofer").innerText = "Chofer: " + data.nombre;  
        codigoIngresado = true;  
        document.getElementById("codigoConductor").disabled = true;  

        // Registrar la sincronización en segundo plano  
        if ("serviceWorker" in navigator && "SyncManager" in window) {  
          navigator.serviceWorker.ready.then((registration) => {  
            registration.sync.register("enviarUbicacion");  
          });  
        }  

        // Iniciar el envío de ubicación cada 30 segundos  
        if (intervaloUbicacion) clearInterval(intervaloUbicacion);  
        intervaloUbicacion = setInterval(() => {  
          obtenerUbicacion(codigo);  
        }, 30000); // 30 segundos  
      } else {  
        document.getElementById("mensajeUbicacion").innerText = "Código no encontrado.";  
      }  
    })  
    .catch((error) => {  
      console.error("Error al obtener el nombre del conductor:", error);  
      document.getElementById("mensajeUbicacion").innerText = "Error al obtener el nombre del conductor.";  
    });  
}  

// Solicitar permisos de notificación al cargar la página  
solicitarPermisosNotificacion();  
