const CACHE_NAME = "v1_cache_panel_adm";  
const urlsToCache = [  
  "https://script.google.com/macros/s/AKfycbx_kg6MTahza8LJ6USXH6DMk15cE19U39IeNuXgslHdQL5zGqiW-5FIBt6gjYLumz8txg/exec",  
  "./manifest.json",  
];  

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

// API de Sincronización en Segundo Plano  
self.addEventListener("sync", (event) => {  
  if (event.tag === "enviarUbicacion") {  
    event.waitUntil(enviarUbicacionEnSegundoPlano());  
  }  
});  

async function enviarUbicacionEnSegundoPlano() {  
  const clients = await self.clients.matchAll();  
  clients.forEach((client) => {  
    client.postMessage({ action: "obtenerUbicacion" });  
  });  
}  

// API de Sincronización en Segundo Plano Periódica  
self.addEventListener("periodicsync", (event) => {  
  if (event.tag === "actualizarUbicacion") {  
    event.waitUntil(obtenerUbicacionPeriodica());  
  }  
});  

async function obtenerUbicacionPeriodica() {  
  const clients = await self.clients.matchAll();  
  clients.forEach((client) => {  
    client.postMessage({ action: "obtenerUbicacion" });  
  });  
}  

// Función para enviar la ubicación al script de Google Apps Script  
async function enviarUbicacion(codigoConductor, latitud, longitud) {  
  const url =  
    "https://script.google.com/macros/s/AKfycbx_kg6MTahza8LJ6USXH6DMk15cE19U39IeNuXgslHdQL5zGqiW-5FIBt6gjYLumz8txg/exec";  
  const params = new URLSearchParams({  
    codigo: codigoConductor,  
    latitud: latitud,  
    longitud: longitud,  
  });  

  fetch(url + "?" + params.toString(), {  
    method: "GET",  
    mode: "cors",  
  })  
    .then((response) => {  
      if (!response.ok) {  
        throw new Error("Error en la respuesta del servidor: " + response.statusText);  
      }  
      console.log("Ubicación enviada correctamente.");  
      mostrarNotificacion(latitud, longitud); // Mostrar notificación  
    })  
    .catch((error) => {  
      console.error("Error al enviar la ubicación:", error);  
    });  
}  

// Escuchar mensajes del cliente para obtener la ubicación  
self.addEventListener("message", (event) => {  
  if (event.data.action === "obtenerUbicacion") {  
    // Aquí debes obtener el código del conductor y la ubicación  
    const codigoConductor = event.data.codigo; // Asegúrate de enviar el código desde el cliente  
    // Aquí debes obtener la latitud y longitud de alguna manera  
    // Por ejemplo, podrías almacenar la última ubicación en IndexedDB o en memoria  
    const latitud = ...; // Obtener la latitud  
    const longitud = ...; // Obtener la longitud  
    enviarUbicacion(codigoConductor, latitud, longitud);  
  }  
});  

// Función para mostrar notificación  
function mostrarNotificacion(latitud, longitud) {  
  const title = "Ubicación Actualizada";  
  const options = {  
    body: `Latitud: ${latitud.toFixed(5)}, Longitud: ${longitud.toFixed(5)}`,  
  };  

  self.registration.showNotification(title, options);  
}  
