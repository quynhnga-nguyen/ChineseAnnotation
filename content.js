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


function getHanVietCallback(responseText, charId) {
	var hanviet = "";
	var xpath = "//div[@class='info']//div//span[@class='hvres-goto-link']/text()";
	var responseDOM = new DOMParser().parseFromString(responseText, 'text/html');
	var nodes = responseDOM.evaluate(xpath, responseDOM, null, XPathResult.ANY_TYPE, null);

	var results = nodes. iterateNext();
	while (results) {
		hanviet += results.nodeValue + " ";
		results = nodes.iterateNext();
	}
	hanviet += " | ";

	document.getElementById(charId).innerHTML = hanviet;
}


function getHanVietAsync(character, charId) {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        	getHanVietCallback(xmlHttp.responseText, charId);
        }
    }

    xmlHttp.open("GET", "https://hvdic.thivien.net/whv/" + character, true); // true for asynchronous 
    xmlHttp.send(null);
}


function annotateHanViet(){
   	var characters = [];
	var annotationXpath = "//div[@id='mandarinspot-tip-hz']/x-mspot/text()";
	var nodes = document.evaluate(annotationXpath, document, null, XPathResult.ANY_TYPE, null);
	var results = nodes.iterateNext();

	if (results) {
		var text = results.nodeValue;
		for (var i = 0; i < text.length; i++) {
			characters.push(text.charAt(i));
		}

		var annotationDiv = document.getElementById("mandarinspot-tip");
		var hanvietDiv = document.createElement("div");
		hanvietDiv.setAttribute("id", "hanviet");
		annotationDiv.appendChild(hanvietDiv);

		for (var i = 0; i < characters.length && characters[i] != "[" && characters[i] != " "; i++) {
			var charPlaceholder = document.createElement("span");
			var charId = "hanvietChar" + i;
			charPlaceholder.setAttribute("id", charId);
			hanvietDiv.appendChild(charPlaceholder);

			getHanVietAsync(characters[i], charId);
		}
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
