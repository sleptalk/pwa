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
  if (e.data === "iniciar") {  
    intervaloUbicacion = setInterval(obtenerUbicacion, 10000); // Cada 10 segundos  
  } else if (e.data === "detener") {  
    clearInterval(intervaloUbicacion);  
  }  
});  

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
