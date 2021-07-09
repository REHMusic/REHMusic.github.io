function getXmlDoc(url) {
    if (window.XMLHttpRequest) {  // code for IE7, Firefor,Chrome,Opera,Safari
        xmlhttp = new XMLHttpRequest();
    } else {  // code for IE6,IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    xmlDoc = xmlhttp.responseXML;
    return xmlDoc;
}
function getTextDoc(url) {
    if (window.XMLHttpRequest) {  // code for IE7, Firefor,Chrome,Opera,Safari
        xmlhttp = new XMLHttpRequest();
    } else {  // code for IE6,IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    xmlDoc = xmlhttp.responseText;
    return xmlDoc;
}