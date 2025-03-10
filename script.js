if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("https://github.com/sleptalk/pwa/blob/main/sw.js")
    .then((reg) => console.log("Registro de SW exitoso ", reg))
    .catch((err) => console.error("Error al tratar de registrar el SW ", err));
} else {
  console.log("no hay serviceWorker");
}
