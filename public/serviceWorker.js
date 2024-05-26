const CACHE_NAME = 'v1';
const urlsToCache = [
  "/",
  "/login",
  "/manifest.json",
  "/app.js",
  "https://cdn.botframework.com/botframework-webchat/latest/webchat.js",
  "//fonts.googleapis.com/css?family=Work+Sans:300,400,500,700,800%7CPoppins:300,400,700",
  "/resources/css/boostrap.css",
  "/resources/css/fonts.css",
  "/resources/css/css.css",
  "/resources/css/chatbot.css",
  "https://code.jquery.com/jquery-3.6.0.min.js",
  "https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js",
  "/resources/scripts/core.min.js",
  "/resources/scripts/script.js",
  "/resources/scripts/chatbot.js",
  "/resources/vendor/fontawesome-free/css/all.min.css",
  "/resources/css/sb-admin-2.min.css",
  "/resources/vendor/datatables/dataTables.bootstrap4.min.css",
  "/resources/css/404.css",
  "/resources/css/500.css",
  "/resources/vendor/jquery/jquery.min.js",
  "/resources/vendor/bootstrap/js/bootstrap.bundle.min.js",
  "/resources/vendor/jquery-easing/jquery.easing.min.js",
  "/resources/vendor/datatables/jquery.dataTables.min.js",
  "/resources/scripts/datables.js",
  "/resources/scripts/sb-admin-2.min.js",
  "/resources/pwa/72x72.png",
  "/resources/pwa/96x96.png",
  "/resources/pwa/128x128.png",
  "/resources/pwa/144x144.png",
  "/resources/pwa/152x152.png",
  "/resources/pwa/192x192.png",
  "/resources/pwa/384x384.png",
  "/resources/pwa/512x512.png",
 
  
]

self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          return cache.addAll(urlsToCache);
        })
    );
  });
 