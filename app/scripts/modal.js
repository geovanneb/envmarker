chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.action) {
		case 'isDisabled':
			if(!document.getElementById('chrome-envmarker')) {
				sendResponse({isDisabled: 'notSet'});
			} else {
				if(document.getElementById('chrome-envmarker')) {
					sendResponse({isDisabled: document.getElementById('chrome-envmarker').style.display == 'none'});
				} else {
					sendResponse({isDisabled: 'notSet'});		   
				}
			}
			break;
		case 'toggle':
			var marker = document.getElementById('chrome-envmarker');
			if(marker.style.display == 'none') {
				marker.style.display = 'block';
			} else {
				marker.style.display = 'none';
			}
			sendResponse(true);
			break;
		case 'getConfig':
			sendResponse({currentConfig: CURRENT_CONFIG});
			break;
		case 'getDomain':
			sendResponse({domain: CURRENT_DOMAIN});
			break;
		case 'setConfig':
			_setConfig(request.parameter);
			sendResponse({success: true});
			break;
		return true;
	}
	return true;
});

var PLUGIN_STATE = {};
PLUGIN_STATE.regexList = [];
PLUGIN_STATE.strictList = [];
PLUGIN_STATE.lastUpdate = null;

var CURRENT_CONFIG = undefined;
var CURRENT_LOCATION = window.location.href;
var CURRENT_DOMAIN = window.location.hostname;
var ENV_SETTINGS = [];
var HOSTED_FILE = "";
var AUTO_IMPORT = 0;

// verify settings and add label if necessary
function _addEnvironmentLabel() {
	chrome.storage.sync.get({current_state: {
		last_update: new Date().getTime(),
		env_settings: [{uuid: '0ac126c8-9aff-452b-b76c-941104854128', name: 'EXAMPLE', address: 'environmentmarker.io', color: 'rgba(0, 85, 188, 1)', position: 1}],
		hosted_file: "",
		auto_import: 0
	}}, function(data) {
		ENV_SETTINGS = data.current_state.env_settings;
		HOSTED_FILE = data.current_state.hosted_file;
		AUTO_IMPORT = data.current_state.auto_import;
		if (!PLUGIN_STATE.lastUpdate || data.current_state.last_update > PLUGIN_STATE.lastUpdate) {
			_updateMatchers(data.current_state.env_settings, data.current_state.last_update);
		}

		for(var i = 0; i<PLUGIN_STATE.strictList.length; i++) {
			if(CURRENT_LOCATION.indexOf(PLUGIN_STATE.strictList[i].address) > -1) {
				CURRENT_CONFIG = PLUGIN_STATE.strictList[i];
				_addMarker(CURRENT_CONFIG);
				return;
			}
		}
		for(var i = 0; i<PLUGIN_STATE.regexList.length; i++) {
			if(PLUGIN_STATE.regexList[i].regex.test(CURRENT_DOMAIN)) {
				CURRENT_CONFIG = PLUGIN_STATE.regexList[i];
				_addMarker(CURRENT_CONFIG);
				return;
			}
		}
	});
}

function _addMarker(item) {
	var envmarker = document.getElementById('chrome-envmarker');
	if(envmarker && envmarker.length != 0) {
		envmarker.parentNode.removeChild(envmarker);
	}

	var position = item.position || '1';
	var wrapperDiv = document.createElement('div');
	wrapperDiv.id = 'chrome-envmarker';

	if (item.color.length === 6) {
		item.color = '#'+item.color;
	}

	if (position === '5') {
		// Moldure style
		wrapperDiv.setAttribute('style', `
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			border: 8px solid ${item.color};
			z-index: 2147483647;
			pointer-events: none;
			user-select: none;
		`);
	} else {
		// Regular ribbon style
		var positionStyle = 'right: -72px; top: 45px; transform: rotate(45deg);';
		var ribbonWidth = '290px';
		var ribbonHeight = '55px';
		
		switch (position) {
			case '2':
				positionStyle = 'left: -72px; top: 45px; transform: rotate(-45deg);';
				break;
			case '3':
				positionStyle = 'right: -72px; bottom: 45px; transform: rotate(-45deg);';
				break;
			case '4':
				positionStyle = 'left: -72px; bottom: 45px; transform: rotate(45deg);';
				break;
		}
		
		wrapperDiv.setAttribute('style',`
			text-shadow: -1px -1px 0 #555, 1px -1px 0 #555, -1px 1px 0 #555, 1px 1px 0 #555;
			position: fixed;
			${positionStyle}
			background-color: ${item.color};
			z-index: 2147483647;
			height: ${ribbonHeight};
			width: ${ribbonWidth};
			overflow-x: hidden;
			box-shadow: 7px 0px 9px #000;
			color: #fff;
			pointer-events: none;
			user-select: none;
		`);

		var textDiv = document.createElement('div');
		textDiv.id = 'chrome-envmarker-text';
		textDiv.setAttribute('style', `
			margin: 0 45px;
			line-height: ${ribbonHeight};
			height: 100%;
			width: calc(100% - 90px);
			overflow: hidden;
			text-align: center;
			font-family: Arial, sans-serif;
			${item.fontSize && item.fontSize !== 'auto' ? `font-size: ${item.fontSize};` : ''}
		`);
		textDiv.innerText = item.name;
		wrapperDiv.appendChild(textDiv);
	}

	document.body.appendChild(wrapperDiv);
	
	if (position !== '5' && (!item.fontSize || item.fontSize === 'auto')) {
		// Only use textFit if fontSize is not set or is set to 'auto'
		textFit(document.getElementById("chrome-envmarker-text"), {
			minFontSize: 15,
			maxFontSize: 45,
			detectMultiLine: true,
			alignVert: true,
			alignHoriz: true,
			multiLine: false,
			reProcess: true
		});
	}
}

function _updateMatchers(env_settings, last_update) {
	PLUGIN_STATE.regexList = [];
	PLUGIN_STATE.strictList = [];
	env_settings.forEach(function (item) {
		if (!!item && !!item.address && item.address.startsWith('regex:')) {
			item.regex = new RegExp(item.address.substring('regex:'.length, item.address.length));
			PLUGIN_STATE.regexList.push(item);
		} else {
			PLUGIN_STATE.strictList.push(item);
		}
	});
	PLUGIN_STATE.lastUpdate = last_update;
}

function _setConfig(config) {
	// Find the index of the object based on uuid
	obj_index = ENV_SETTINGS.findIndex(function(obj){ return obj.uuid == config.uuid });
	if(obj_index === -1) {
    	// Last try, might be a legacy config file.
    	obj_index = ENV_SETTINGS.findIndex(function(obj){ return obj.address === config.address });
    }

    if(obj_index !== -1) {
    	// Update item
    	ENV_SETTINGS[obj_index] = config;
    } else {
		// Might be a legacy configuration file
		ENV_SETTINGS.push(config);
	}
    // Persist data
    chrome.storage.sync.set({current_state: {
    	last_update: new Date().getTime(),
    	env_settings: ENV_SETTINGS,
    	hosted_file: HOSTED_FILE,
    	auto_import: AUTO_IMPORT
    }}, function() {
		//Refresh marker
		_addEnvironmentLabel();
	});
}

_addEnvironmentLabel();

// detect dinamic URL update
window.onhashchange = function() { 
	_addEnvironmentLabel();
}
