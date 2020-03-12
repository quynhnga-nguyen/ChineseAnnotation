function parseHanVietResponse(responseText) {
    var re = /Char:\d+:(.*?)=(.*?)\|/;
    var matches = responseText.match(re);
    var hanviet = matches[2];
    return hanviet;
}

hanVietCache = {};

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.character != undefined) {
            if (hanVietCache[request.character]) {
                console.log('Getting character from cache: ' + request.character);
                sendResponse(hanVietCache[request.character]);
                return false;
            }

            var url = "http://www.vanlangsj.org/hanviet/ajax.php?methode=normal&query=" + request.character;
            fetch(url)
                .then(response => response.text())
                .then(text => parseHanVietResponse(text))
                .then(hanviet => {
                    hanVietCache[request.character] = hanviet;
                    sendResponse(hanviet);
                })
                .catch(error => console.log(error));
            return true;
        }
    }
)