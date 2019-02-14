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

var regexList = [];
var strictList = [];
var lastUpdate = new Date().getTime();

// verify settings and add label if necessary
function _addEnvironmentLabel() {
	chrome.storage.sync.get({current_state: {
		env_settings: [{name: 'EXAMPLE', address: 'geovanneborges.com.br', color: '0000ff'},]
	}}, function(data) {
		var tablink = window.location.href;
		if (!data.current_state.env_settings.lastUpdate || data.current_state.lastUpdate > lastUpdate) {
			_updateMatchers(data.current_state.env_settings);
		}

		var hostName = window.location.host;
		for(var i = 0; i<regexList.length; i++) {
			if(regexList[i].regex.test(hostName)) {
				_addMarket(regexList[i]);
				return;
			}
		}

		for(var i = 0; i<strictList.length; i++) {
			if(tablink.indexOf(strictList[i].address) > -1) {
				_addMarket(strictList[i]);
				return;
			}
		}
	});
}

function _addMarket(item) {
	var envmarker = document.getElementById('chrome-envmarker');
	if(envmarker && envmarker.length != 0) {
		envmarker.parentNode.removeChild(envmarker);
	} 
	wrapperDiv = document.createElement('div');
	wrapperDiv.id = 'chrome-envmarker';
	wrapperDiv.setAttribute('style','text-shadow: -1px -1px 0 #555, 1px -1px 0 #555, -1px 1px 0 #555, 1px 1px 0 #555; position: fixed; right: -127px; top: 43px; background-color: #'+item.color.replace('#','')+'; opacity: 0.9; z-index: 2000; height: 55px; width: 396px; line-height: 55px; transform: rotate(44deg); box-shadow: 7px 0px 9px #000; text-align: center; font-size: 37px; color: #fff;');
	wrapperDiv.innerText = item.name;
	// try not duplicating elements
	document.body.appendChild(wrapperDiv);
}

function _updateMatchers(env_settings) {
	env_settings.forEach(function (item) {
		if (!!item && !!item.address && item.address.startsWith('regex:')) {
			item.regex = new RegExp(item.address.substring('regex:'.length, item.address.length));
			regexList.push(item);
		} else {
			strictList.push(item);
		}
	});
	lastUpdate = new Date().getTime();
}

_addEnvironmentLabel();

// detect dinamic URL update
window.onhashchange = function() { 
	_addEnvironmentLabel();
}
