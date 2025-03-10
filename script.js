if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./pwa/sw.js")
    .then((reg) => console.log("Registro de SW exitoso ", reg))
    .catch((err) => console.error("Error al tratar de registrar el SW ", err));
} else {
  console.log("no hay serviceWorker");
}
