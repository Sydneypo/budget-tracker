const APP_PREFIX = 'budget-tracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;


const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/js/index.js",
    "/js/idb.js",
    "/css/styles.css",
    "/manifest.json",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
    
];


// install the service worker
self.addEventListener('install', function (e) {
    console.log("Installing Service Worker");
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    );
});


// tells the app which information to retrieve from the cache
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url);
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches
                .open(CACHE_NAME)
                .then(cache => {
                    return fetch(e.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(e.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch(err => {
                            return cache.match(e.request);
                        });
                })
                .catch(err => console.log(err))
        );
        return;
    }
    e.respondWith(
        fetch(e.request).catch(function() {
            return caches.match(e.request).then(function(response) {
                if (response) {
                    return response;
                }
                else if (e.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/');
                }
            });
        })
    );       
    
        // determines if the resource already exists in caches
        // caches.match(e.request).then(function (request) {
        //     if (request) {
        //         console.log('responding with cache: ' + e.request.url)
        //         return request
        //     }
        //     // if not we allow the resource to be retrieved using online network
        //     else {
        //         console.log('file is not cached, fetching : ' + e.request.url)
        //         return fetch(e.request)
        //     }
        // })
        
    
});


// Activate and how to manage the service worker
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function(key, i) {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );

    self.clients.claim();
});


