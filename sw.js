const CACHE_NAME = "v1_cache_panel_adm";  
const urlsToCache = [  
  "https://script.google.com/macros/s/AKfycbx_kg6MTahza8LJ6USXH6DMk15cE19U39IeNuXgslHdQL5zGqiW-5FIBt6gjYLumz8txg/exec",  
  "./manifest.json",  
];  

let intervaloUbicacion;  

self.addEventListener("install", (e) => {  
  e.waitUntil(  
    caches  
      .open(CACHE_NAME)  
      .then((cache) => {  
        return cache.addAll(urlsToCache).then(() => self.skipWaiting());  
      })  
      .catch((err) => console.error("Fallo el registro del cache", err))  
  );  
});  

self.addEventListener("activate", (e) => {  
  const cacheWhitelist = [CACHE_NAME];  

  e.waitUntil(  
    caches.keys().then((cacheNames) =>  
      Promise.all(  
        cacheNames.map((cacheName) => {  
          if (!cacheWhitelist.includes(cacheName)) {  
            return caches.delete(cacheName);  
          }  
        })  
      )  
    )  
  );  
  self.clients.claim();  
});  

self.addEventListener("message", (e) => {  
  if (e.data.action === "iniciar") {  
    const codigoConductor = e.data.codigo;  
    intervaloUbicacion = setInterval(() => obtenerUbicacion(codigoConductor), 20000); // Cada 20 segundos  
  } else if (e.data.action === "detener") {  
    clearInterval(intervaloUbicacion);  
  }  
});  

function obtenerUbicacion(codigoConductor) {  
  if ("geolocation" in navigator) {  
    navigator.geolocation.getCurrentPosition(  
      (position) => {  
        const latitud = position.coords.latitude;  
        const longitud = position.coords.longitude;  
        enviarUbicacion(codigoConductor, latitud, longitud);  
      },  
      (error) => {  
        console.error("Error al obtener la ubicación:", error);  
        let errorMessage = "Error al obtener la ubicación.";  
        switch (error.code) {  
          case error.PERMISSION_DENIED:  
            errorMessage = "Permiso denegado para acceder a la ubicación.";  
            break;  
          case error.POSITION_UNAVAILABLE:  
            errorMessage = "La ubicación no está disponible.";  
            break;  
          case error.TIMEOUT:  
            errorMessage = "La solicitud de geolocalización ha expirado.";  
            break;  
          case error.UNKNOWN_ERROR:  
            errorMessage = "Se ha producido un error desconocido.";  
            break;  
        }  
        self.clients.matchAll().then((clients) => {  
          clients.forEach((client) => {  
            client.postMessage({  
              action: "actualizarMensaje",  
              mensaje: errorMessage,  
            });  
          });  
        });  
      }  
    );  
  } else {  
    console.error("Geolocalización no soportada por este navegador.");  
  }  
}  

function enviarUbicacion(codigoConductor, latitud, longitud) {  
  const url = "https://script.google.com/macros/s/AKfycbx_kg6MTahza8LJ6USXH6DMk15cE19U39IeNuXgslHdQL5zGqiW-5FIBt6gjYLumz8txg/exec";  
  const params = new URLSearchParams({  
    codigo: codigoConductor,  
    latitud: latitud,  
    longitud: longitud,  
  });  

  fetch(url + "?" + params.toString(), {  
    method: "GET",  
    mode: "cors",  // Cambiado a "cors"  
  })  
    .then((response) => {  
      if (!response.ok) {  
        throw new Error("Error en la respuesta del servidor: " + response.statusText);  
      }  
      console.log("Ubicación enviada correctamente.");  
      self.clients.matchAll().then((clients) => {  
        clients.forEach((client) => {  
          client.postMessage({  
            action: "actualizarMensaje",  
            mensaje: `Ubicación actualizada: Latitud ${latitud.toFixed(5)} | Longitud ${longitud.toFixed(5)}`,  
          });  
        });  
      });  
    })  
    .catch((error) => {  
      console.error("Error al enviar la ubicación:", error);  
    });  
}  
