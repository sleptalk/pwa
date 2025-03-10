const CACHE_NAME = "v1_cache_panel_adm";  
const urlsToCache = [  
  "https://script.google.com/macros/s/AKfycbx_kg6MTahza8LJ6USXH6DMk15cE19U39IeNuXgslHdQL5zGqiW-5FIBt6gjYLumz8txg/exec",  
  "./manifest.json",  
];  

let intervaloUbicacion;  

// Instalación del Service Worker y almacenamiento en caché  
self.addEventListener("install", (e) => {  
  e.waitUntil(  
    caches  
      .open(CACHE_NAME)  
      .then((cache) => {  
        return cache.addAll(urlsToCache).then(() => self.skipWaiting());  
      })  
      .catch((err) => console.error("Fallo el registro del cache ", err))  
  );  
});  

// Activación del Service Worker y limpieza de caché antiguo  
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
});  

// Manejo de solicitudes de red  
self.addEventListener("fetch", (e) => {  
  e.respondWith(  
    caches.match(e.request).then((res) => {  
      return res || fetch(e.request);  
    })  
  );  
});  

// Manejo de mensajes desde la aplicación principal  
self.addEventListener("message", (e) => {  
  if (e.data === "iniciar") {  
    // Iniciar la obtención de la ubicación  
    intervaloUbicacion = setInterval(obtenerUbicacion, 20000); // Cada 20 segundos  
  } else if (e.data === "detener") {  
    // Detener la obtención de la ubicación  
    clearInterval(intervaloUbicacion);  
  }  
});  

// Función para obtener la ubicación  
function obtenerUbicacion() {  
  if ("geolocation" in navigator) {  
    navigator.geolocation.getCurrentPosition(  
      (position) => {  
        const latitud = position.coords.latitude;  
        const longitud = position.coords.longitude;  
        enviarUbicacion(latitud, longitud);  
      },  
      (error) => {  
        console.error("Error al obtener la ubicación:", error);  
      }  
    );  
  } else {  
    console.error("Geolocalización no soportada por este navegador.");  
  }  
}  

// Función para enviar la ubicación al servidor  
function enviarUbicacion(latitud, longitud) {  
  const url = "https://script.google.com/macros/s/AKfycbx_kg6MTahza8LJ6USXH6DMk15cE19U39IeNuXgslHdQL5zGqiW-5FIBt6gjYLumz8txg/exec";  
  const params = new URLSearchParams({  
    codigo: "ABC123", // Reemplaza con el código del conductor  
    latitud: latitud,  
    longitud: longitud,  
  });  

  fetch(url + "?" + params.toString(), {  
    method: "GET",  
    mode: "no-cors",  
  })  
    .then(() => {  
      console.log("Ubicación enviada correctamente.");  
    })  
    .catch((error) => {  
      console.error("Error al enviar la ubicación:", error);  
    });  
}  
