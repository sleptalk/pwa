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

self.addEventListener("sync", (event) => {  
  if (event.tag === "enviarUbicacion") {  
    event.waitUntil(enviarUbicacionEnSegundoPlano());  
  }  
});  

async function enviarUbicacionEnSegundoPlano() {  
  const clients = await self.clients.matchAll();  
  clients.forEach(client => {  
    client.postMessage({ action: "obtenerUbicacion" });  
  });  
}  

self.addEventListener("message", (e) => {  
  if (e.data.action === "iniciar") {  
    const codigoConductor = e.data.codigo;  
    intervaloUbicacion = setInterval(() => {  
      // Aquí solo se envía un mensaje para que la página obtenga la ubicación  
      self.clients.matchAll().then((clients) => {  
        clients.forEach((client) => {  
          client.postMessage({ action: "obtenerUbicacion", codigo: codigoConductor });  
        });  
      });  
    }, 20000); // Cada 20 segundos  
  } else if (e.data.action === "detener") {  
    clearInterval(intervaloUbicacion);  
  }  
});  

function enviarUbicacion(codigoConductor, latitud, longitud) {  
  const url = "https://script.google.com/macros/s/AKfycbx_kg6MTahza8LJ6USXH6DMk15cE19U39IeNuXgslHdQL5zGqiW-5FIBt6gjYLumz8txg/exec";  
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
    })  
    .catch((error) => {  
      console.error("Error al enviar la ubicación:", error);  
    });  
}  
