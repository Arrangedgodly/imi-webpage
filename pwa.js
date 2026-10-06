/* Registers the service worker (sw.js) so the site can be installed as an app. Needs https or localhost; silently does nothing elsewhere. */
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* not installable here: the site still works */ }); });
}
