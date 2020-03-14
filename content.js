(function(DOMParser) {  
    "use strict";  
    var DOMParser_proto = DOMParser.prototype  
      , real_parseFromString = DOMParser_proto.parseFromString;

    // Firefox/Opera/IE throw errors on unsupported types  
    try {  
        // WebKit returns null on unsupported types  
        if ((new DOMParser).parseFromString("", "text/html")) {  
            // text/html parsing is natively supported  
            return;  
        }  
    } catch (ex) {}  

    DOMParser_proto.parseFromString = function(markup, type) {  
        if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {  
            var doc = document.implementation.createHTMLDocument("")
              , doc_elt = doc.documentElement
              , first_elt;

            doc_elt.innerHTML = markup;
            first_elt = doc_elt.firstElementChild;

            if (doc_elt.childElementCount === 1
                && first_elt.localName.toLowerCase() === "html") {  
                doc.replaceChild(first_elt, doc_elt);  
            }  

            return doc;  
        } else {  
            return real_parseFromString.apply(this, arguments);  
        }  
    };  
}(DOMParser));

var activeMspotElement = undefined;
var wordFrequency = {};

function updateWordFrequency(word) {
    const MIN_TIME_BETWEEN_LOOKUPS = 10;

    if (!wordFrequency[word]) {
        wordFrequency[word] = {frequency: 1, lastLookupTime: Date.now()};
    } else if ((Date.now() - wordFrequency[word].lastLookupTime) / 1000 > MIN_TIME_BETWEEN_LOOKUPS) {
        wordFrequency[word].frequency++;
        wordFrequency[word].lastLookupTime = Date.now();
    }
    console.log(word + ": " + wordFrequency[word].frequency);
}

function getHanVietAsync(character, charId) {
    chrome.runtime.sendMessage(
        {character: character},
        hanviet => {
            console.log('hanviet: ' + hanviet);
            if (hanviet) {
                document.getElementById(charId).innerHTML = hanviet;
                repositionBubbleIfNecessary();
            }
        }
    );
}

function annotateHanViet() {
    var characters = "";
    var annotationXpath = "//div[@id='mandarinspot-tip-hz']/x-mspot/text()";
    var nodes = document.evaluate(annotationXpath, document, null, XPathResult.ANY_TYPE, null);
    var results = nodes.iterateNext();

    if (results) {
        var text = results.nodeValue;

        updateWordFrequency(text);

        for (var i = 0; i < text.length && text.charAt(i) != '[' && text.charAt(i) != ' '; i++) {
            characters += (text.charAt(i));
        }

        var annotationDiv = document.getElementById("mandarinspot-tip");

        var hanvietDiv = document.getElementById("hanviet");
        if (hanvietDiv) {
            hanvietDiv.innerHTML = "";
        } else {
            hanvietDiv = document.createElement("div");
            hanvietDiv.setAttribute("id", "hanviet");
            annotationDiv.appendChild(hanvietDiv);
        }

        for (var i = 0; i < characters.length; i++) {
            var charPlaceholder = document.createElement("span");
            var charId = "hanvietChar" + i;
            charPlaceholder.setAttribute("id", charId);
            hanvietDiv.appendChild(charPlaceholder);

            getHanVietAsync(characters[i], charId);

            if (i + 1 < characters.length) {
                hanvietDiv.innerHTML += " | ";
            }
        }
    }
}

function repositionBubbleIfNecessary() {
    var annotationDiv = document.getElementById("mandarinspot-tip");
    if (!activeMspotElement) {
        return;
    }

    var annotationBox = annotationDiv.getBoundingClientRect();
    var mspotElementBox = activeMspotElement.getBoundingClientRect();
    if (annotationBox.top <= mspotElementBox.top &&
        annotationBox.bottom >= mspotElementBox.top) {
        annotationDiv.style.top = Math.round(parseInt(annotationDiv.style.top) - (annotationBox.bottom - mspotElementBox.top + 3)) + "px";
    }
}

mandarinspot.annotate();

var mandarinspotNode = document.getElementById("mandarinspot-tip");
var currentVisibility = 'hidden';

var observer = new MutationObserver(function() {
    if (mandarinspotNode.style.visibility == 'visible' && currentVisibility == 'hidden') {
        currentVisibility = 'visible';
        annotateHanViet();
    }

    if (mandarinspotNode.style.visiblity != 'visible') {
        currentVisibility = 'hidden';
    }
});
observer.observe(mandarinspotNode, { attributes: true, childList: false });

$(function() {
    $(document).on("mouseover", "x-mspot", function(event) {
        activeMspotElement = event.currentTarget;
        repositionBubbleIfNecessary();
    });
});

// Send frequency report
var reportInterval = 10 * 1000; // 10 seconds
setInterval(function() {
    var url = "http://localhost:3000/freqreport";
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(
        wordFrequency
    ));
}, reportInterval);
