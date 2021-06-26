const LOCALHOST_URL = "http://localhost:8080";
const PRODUCTION_URL = "https://vocab.nganhan.xyz";

function getBackendUrl(callback) {
  chrome.storage.sync.get({
    useLocalhost: false,
  }, function(items) {
    callback(items.useLocalhost ? LOCALHOST_URL : PRODUCTION_URL);
  });
}
