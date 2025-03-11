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

  // Enviar el código al Service Worker  
  if ("serviceWorker" in navigator) {  
    navigator.serviceWorker.ready.then((registration) => {  
      registration.active.postMessage({ action: "setCodigoConductor", codigo: codigoConductor });  
    });  
  }  
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

        // Iniciar el envío de ubicación cada 20 segundos  
        if (intervaloUbicacion) clearInterval(intervaloUbicacion);  
        intervaloUbicacion = setInterval(() => {  
          obtenerUbicacion(codigo);  
        }, 20000); // 20 segundos  
      } else {  
        document.getElementById("mensajeUbicacion").innerText = "Código no encontrado.";  
      }  
    })  
    .catch((error) => {  
      console.error("Error al obtener el nombre del conductor:", error);  
      document.getElementById("mensajeUbicacion").innerText = "Error al obtener el nombre del conductor.";  
    });  
}  
