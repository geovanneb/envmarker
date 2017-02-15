// saves options to chrome.storage
function save_options() {
	var configs = document.getElementsByTagName('tr');
	var configs_array = [];
	for(var i = 0; i<configs.length;i++) {
		var name = configs[i].querySelector('.name') && configs[i].querySelector('.name').value; 
		var address = configs[i].querySelector('.address') && configs[i].querySelector('.address').value; 
		var color = configs[i].querySelector('.color') && configs[i].querySelector('.color').value; 
		
		if(name && address && color) {
			var obj = {
				name: name,
				address: address,
				color: color
			}
			configs_array.push(obj);
		} 
	}
	
	chrome.storage.sync.set({
		env_settings: configs_array
	}, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Successfully updated!';
    setTimeout(function() {
    	status.textContent = '';
    }, 750);
});
}

// deletes a line
function _deleteAction(e) {
	e.target.parentNode.parentNode.parentNode.removeChild(e.target.parentNode.parentNode);
}

// adds delete behavior to the last column
function _addDeleteAction() {
	var deletebuttons = document.getElementsByClassName('delete');
	for (var i = 0; i < deletebuttons.length; i++) {
		deletebuttons[i].addEventListener('click', _deleteAction, false);
	}
}

// restore settings stored in chrome.storage.
function restore_options() {
	chrome.storage.sync.get({
		env_settings: [{name: 'EXAMPLE', address: 'geovanneborges.com.br', color: '0000ff'},]
	}, function(items) {
		for(var i = 0; i<items.env_settings.length; i++) {
			var template = document.createElement('tr');
			template.innerHTML = '<tr><td><input class="name" value="'+items.env_settings[i].name+'" /></td><td><input class="address" value="'+items.env_settings[i].address+'" /></td><td><input class="color jscolor" value="'+items.env_settings[i].color+'" /></td><td><button class="delete" title="Remove"></button></td></tr>';
			document.getElementById('tbody').appendChild(template);
			jscolor.init();
			_addDeleteAction();
		}
	});
}

// add more button action
function add_more() {
	var template = document.createElement('tr');
	template.innerHTML = '<tr><td><input class="name" /></td><td><input class="address" /></td><td><input class="color jscolor" value="'+(Math.random()*0xFFFFFF<<0).toString(16)+'" /></td><td><button class="delete" title="Remove"></button></td></tr>';
	document.getElementById('tbody').appendChild(template);
	jscolor.init();
	_addDeleteAction();
}

// download the current settings as json
function exportSettings() {
	chrome.storage.sync.get({
		env_settings: []
	}, function(items) {
		var a = document.createElement('a');
		a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(JSON.stringify(items.env_settings)));
		a.setAttribute('download', 'envmarker.json');
		a.click();
	});
}

// merges imported settings with current one
function _mergeSettings(newconfig) {
	var currentconfig = [];
	chrome.storage.sync.get({
		env_settings: []
	}, function(items) {
		currentconfig = items;
		var config = newconfig.slice();

		for(var i = 0; i<currentconfig.env_settings.length; i++) {
			var exists = false;
			for(var j = 0; j<newconfig.length; j++) {
				if(currentconfig && currentconfig.env_settings[i] && currentconfig.env_settings[i].name && currentconfig.env_settings[i].name == newconfig[j].name) {
					exists = true;
				}
			}
			if(!exists) {
				config.push(currentconfig.env_settings[i]);
			}
		}
		
		chrome.storage.sync.set({
			env_settings: config
		}, function() {
	    // Update status to let user know options were saved.
	    var status = document.getElementById('import-status');
	    status.textContent = 'Successfully imported! Refreshing...';
	    setTimeout(function() {
	    	location.reload();
	    }, 750);
	});
	});
}

// import settings from a file
function importSettings(e) {
	var f = e.target.files[0];
	if (f) {
		var r = new FileReader();
		r.onload = function(e) { 
			var newconfig = e.target.result;
			try {
				_mergeSettings(JSON.parse(newconfig));
			} catch(e) {
				alert('An unexpected error occoured while loading the file.');
			}
		}
		r.readAsText(f);
	} else { 
		alert('An unexpected error occoured while loading the file.');
	}

}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('more').addEventListener('click', add_more);
document.getElementById('export').addEventListener('click', exportSettings);
document.getElementById('import').addEventListener('change', importSettings);