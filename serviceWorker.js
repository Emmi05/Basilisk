const staticDevCoffee = "basilisk v1"
const assets = [
  "/",
  "/login",
  "manifest.json",
  "app.js",
  "resources/vendor/fontawesome-free/css/all.min.css",
  "resources/css/sb-admin-2.min.css",
  "resources/vendor/datatables/dataTables.bootstrap4.min.css",
  "resources/css/404.css",
  "../resources/css/500.css",
  "../resources/vendor/jquery/jquery.min.js",
  "../resources/vendor/bootstrap/js/bootstrap.bundle.min.js",
  "../resources/vendor/jquery-easing/jquery.easing.min.js",
  "../resources/vendor/datatables/jquery.dataTables.min.js",
  "../resources/scripts/datables.js",
  "./resources/scripts/sb-admin-2.min.js",
  "resources/pwa/72x72.png",
  "resources/pwa/96x96.png",
  "resources/pwa/128x128.png",
  "resources/pwa/144x144.png",
  "resources/pwa/152x152.png",
  "resources/pwa/192x192.png",
  "resources/pwa/384x384.png",
  "resources/pwa/512x512.png",
 
  
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticDevCoffee).then(cache => {
      cache.addAll(assets)
    })
  )
})