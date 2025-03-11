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

// Definir la geofence que cubre Tacna, Arica y Azapa  
const geofence = {  
  id: "tacna-arica-azapa",  
  latitude: -18.4783, // Latitud central (aproximada entre Tacna y Arica)  
  longitude: -70.3125, // Longitud central (aproximada entre Tacna y Arica)  
  radius: 50000, // Radio de 50 km para cubrir las áreas  
};  

// Escuchar la notificación de entrada a la geofence  
self.addEventListener("geofenceenter", (event) => {  
  const geofenceId = event.geofenceId;  

  if (geofenceId === geofence.id) {  
    // Obtener la ubicación actual del usuario  
    navigator.geolocation.getCurrentPosition(  
      (position) => {  
        const latitud = position.coords.latitude;  
        const longitud = position.coords.longitude;  
        enviarUbicacion(latitud, longitud);  
      },  
      (error) => {  
        console.error("Error al obtener la ubicación:", error.message);  
      }  
    );  
  }  
});  

// Función para enviar la ubicación al servidor  
function enviarUbicacion(latitud, longitud) {  
  const url = "https://script.google.com/macros/s/AKfycbx_kg6MTahza8LJ6USXH6DMk15cE19U39IeNuXgslHdQL5zGqiW-5FIBt6gjYLumz8txg/exec";  
  const params = new URLSearchParams({  
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
    })  
    .catch((error) => {  
      console.error("Error al enviar la ubicación:", error);  
    });  
}  
