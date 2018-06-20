chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {

	if (request.action == 'isDisabled') {
		if(!document.getElementById('chrome-envmarker')) {
			sendResponse({isDisabled: 'notSet'});
		} else {
			if(document.getElementById('chrome-envmarker')) {
				sendResponse({isDisabled: document.getElementById('chrome-envmarker').style.display == 'none'});
			} else {
				sendResponse({isDisabled: 'notSet'});		   
			}
		}
	} else if(request.action == 'toggle') {
		var marker = document.getElementById('chrome-envmarker');
		if(marker.style.display == 'none') {
			marker.style.display = 'block';
		} else {
			marker.style.display = 'none';
		}
	}
});

// verify settings and add label if necessary
function _addEnvironmentLabel() {
	chrome.storage.sync.get({
		env_settings: [{name: 'EXAMPLE', address: 'geovanneborges.com.br', color: '0000ff'},]
	}, function(items) {
		var host = window.location.host;
		for(var i = 0; i<items.env_settings.length; i++) {
			if(items.env_settings[i].address.trim() === host) {
				var envmarker = document.getElementById('chrome-envmarker');
				if(envmarker && envmarker.length != 0) {
					envmarker.parentNode.removeChild(envmarker);
				} 
				wrapperDiv = document.createElement('div');
				wrapperDiv.id = 'chrome-envmarker';
				wrapperDiv.setAttribute('style','text-shadow: -1px -1px 0 #555, 1px -1px 0 #555, -1px 1px 0 #555, 1px 1px 0 #555; position: fixed; right: -127px; top: 43px; background-color: #'+items.env_settings[i].color.replace('#','')+'; opacity: 0.9; z-index: 2000; height: 55px; width: 396px; line-height: 55px; transform: rotate(44deg); box-shadow: 7px 0px 9px #000; text-align: center; font-size: 37px; color: #fff;');
				wrapperDiv.innerText = items.env_settings[i].name;
				// try not duplicating elements
				document.body.appendChild(wrapperDiv);
				
			}
		}
	});
}

_addEnvironmentLabel();

// detect dinamic URL update
window.onhashchange = function() { 
	_addEnvironmentLabel();
}
