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
	    alert('Please insert the URL address of the file.');
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
    	alert('This is not a valid url. Insert an url with the correct format.');
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