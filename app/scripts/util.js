// Generates a new uuid
function uuidv4() {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (dt + Math.random()*16)%16 | 0;
		dt = Math.floor(dt/16);
		return (c=='x' ? r :(r&0x3|0x8)).toString(16);
	});
	return uuid;
}

// Checks if URL is valid
function _validateURL(url) {
	if(!url) {
		console.log('Environment Marker: Missing URL address.');
		return false;
	}
	var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))|' + // OR ip (v4) address
		'localhost' + // OR localhost
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
	var result = pattern.test(url);
	if(!result) {
		console.log('Environment Marker: Invalid URL format.');
	}
	return result;
}

// Gets the index of an array of configuration based on uuid
function _get_index(uuid, config) {
	i = 0;
	for(var item in config) {
	    if(config[item].uuid == uuid)
	        break;
	    i++;
	}
	return i;
}

// Merges imported settings with current one
function _mergeSettings(newconfig, env_settings, hosted_file, auto_import, callback) {
	var config = newconfig.slice();

	for(var i = 0; i<env_settings.length; i++) {
		var exists = false;
		for(var j = 0; j<newconfig.length; j++) {
			if(env_settings[i].uuid && env_settings[i].uuid == newconfig[j].uuid) {
				exists = true;
				// Keep position set locally
				config[_get_index(env_settings[i].uuid, config)].position = env_settings[i].position;
			}
		}
		if(!exists) {
			config.push(env_settings[i]);
		}
	}
	
	// Set configuration.
	chrome.storage.sync.set({current_state: {
		last_update: new Date().getTime(),
		env_settings: config,
		hosted_file: hosted_file,
		auto_import: auto_import
	}}, function() {
		console.log('Environment Marker: Successfully merged config.');
		callback();
	});

}

function _updateAlertMessages(messages) {
	var message_container = document.createElement('div');
	message_container.innerHTML = '';
	for(var i = 0; i<messages.length; i++) {
		var message = messages[i];
		var div = document.createElement('div');
		div.className = 'alert alert-' + message.type;
		div.role = 'alert';
		// Add message content, but prevent remote scripts from being executed
		div.innerHTML = message.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
		message_container.appendChild(div);
	}
	return message_container;
}

function _i18n() {
	document.querySelectorAll('[data-i18n]').forEach(el => {
		var translated_string = chrome.i18n.getMessage(el.dataset.i18n);
		if(translated_string) {
			if(el.type == 'submit' && el.tagName == 'INPUT') {
				
				el.value = chrome.i18n.getMessage(el.dataset.i18n);
			} else {
				el.innerHTML = chrome.i18n.getMessage(el.dataset.i18n);
			}
		}
	});
}

function initialize_colorpicker() {
	
	jscolor.presets.default = {
		position: 'right',
		previewPosition: 'left',
		backgroundColor: '#f3f3f3',
		borderColor: '#bbbbbb',
		controlBorderColor: '#bbbbbb',
		format:'rgba', 
		alphaChannel: true,
	}
	
}

function add_colorpicker(rootNode) {
	jscolor.install(rootNode);
} 

function hexToRgba(hex) {
	// Remove any leading #
	hex = hex.replace(/^#/, '');
  
	// Expand shorthand forms (e.g. "03F" or "03FA") to full form
	if (hex.length === 3 || hex.length === 4) {
	  hex = hex.split('').map(function(char) {
		return char + char;
	  }).join('');
	}
  
	let r, g, b, a = 255;
  
	if (hex.length === 6) {
	  // No alpha provided, assume fully opaque
	  r = parseInt(hex.substring(0, 2), 16);
	  g = parseInt(hex.substring(2, 4), 16);
	  b = parseInt(hex.substring(4, 6), 16);
	} else if (hex.length === 8) {
	  // With alpha
	  r = parseInt(hex.substring(0, 2), 16);
	  g = parseInt(hex.substring(2, 4), 16);
	  b = parseInt(hex.substring(4, 6), 16);
	  a = parseInt(hex.substring(6, 8), 16);
	} else {
	  throw new Error("Invalid hex color format.");
	}
  
	// Convert alpha value from 0-255 to 0-1 range with two decimal precision
	let alpha = (a / 255).toFixed(2);
  
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }