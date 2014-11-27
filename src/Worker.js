var temperatureCount = 0;
self.addEventListener('message', function(e) {
 	temperatureCount = temperatureCount + 1;
	var result = load ("https://api.aerisapi.com/observations/melbourne,au?client_id=BjZkhY5bqinC7u7HNbwoX&client_secret=IORNRRiYFyh1AsuBRss2WEqCg1R7Uzu7MISAoJaY",
		function(xhr) { 
			var parsedResult = JSON.parse(xhr.responseText);
			self.postMessage("Current Temperature in Sydney, Australia (" + temperatureCount + ") :" + parsedResult.response.ob.tempC + " c");
		}
	);
}, false);

// simple XHR request in pure JavaScript
// from: http://techslides.com/html5-web-workers-for-ajax-requests/
function load(url, callback) {
	var xhr;
	if(typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
	else {
		var versions = ["MSXML2.XmlHttp.5.0", 
			 	"MSXML2.XmlHttp.4.0",
			 	"MSXML2.XmlHttp.3.0", 
			 	"MSXML2.XmlHttp.2.0",
			 	"Microsoft.XmlHttp"]
		for(var i = 0, len = versions.length; i < len; i++) {
		try {
			xhr = new ActiveXObject(versions[i]);
			break;
		}
			catch(e){}
		} 
	}
	xhr.onreadystatechange = ensureReadiness;
	function ensureReadiness() {
		if(xhr.readyState < 4) {
			return;
		}
		if(xhr.status !== 200) {
			return;
		}
		// all is well	
		if(xhr.readyState === 4) {
			callback(xhr);
		}			
	}
	xhr.open('GET', url, true);
	xhr.send('');
}