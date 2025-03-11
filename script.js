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
        }, 15000); // 15 segundos  
      } else {  
        document.getElementById("mensajeUbicacion").innerText = "Código no encontrado.";  
      }  
    })  
    .catch((error) => {  
      console.error("Error al obtener el nombre del conductor:", error);  
      document.getElementById("mensajeUbicacion").innerText = "Error al obtener el nombre del conductor.";  
    });  
}  
