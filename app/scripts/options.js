// saves options to chrome.storage
function save_options() {
	var configs = document.getElementsByTagName('tr');
	var configs_array = [];
	for(var i = 0; i<configs.length;i++) {
		var uuid = configs[i].querySelector('.uuid') && configs[i].querySelector('.uuid').value || uuidv4(); 
		var name = configs[i].querySelector('.name') && configs[i].querySelector('.name').value; 
		var address = configs[i].querySelector('.address') && configs[i].querySelector('.address').value; 
		var color = configs[i].querySelector('.color') && configs[i].querySelector('.color').value;
		var position = configs[i].querySelector('.position') && configs[i].querySelector('.position').value;  
		
		if(uuid && name && address && color && position) {
			var obj = {
				uuid: uuid,
				name: name,
				address: address,
				color: color,
				position: position
			}
			configs_array.push(obj);
		} 
	}

	var hosted_file = document.getElementById("hosted-file") && document.getElementById("hosted-file").value;
	var auto_import = document.getElementById("auto-import") && document.getElementById("auto-import").checked ? 1 : 0;

	chrome.storage.sync.set({current_state: {
		last_update: new Date().getTime(),
		env_settings: configs_array,
		hosted_file: hosted_file,
		auto_import: auto_import
	}}, function() {
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
	chrome.storage.sync.get({current_state: {
		env_settings: [{uuid: '0ac126c8-9aff-452b-b76c-941104854128', name: 'EXAMPLE', address: 'geovanneborges.com.br', color: '0000ff', position: 1},],
		hosted_file: "",
		auto_import: 0
	}}, function(data) {
		var items = data.current_state;
		for(var i = 0; i<items.env_settings.length; i++) {
			var template = document.createElement('tr');
			var selectedPosition = items.env_settings[i].position || 1;
			var uuid = undefined;
			if (items.env_settings[i].uuid) {
				uuid = items.env_settings[i].uuid;
			} else {
				uuid = uuidv4();
			}
			var positionSelect = '<td><select class="position"><option '+(selectedPosition==1 ? 'selected="selected"' : '')+' value="1">Top-right</option><option '+(selectedPosition==2 ? 'selected="selected"' : '')+' value="2">Top-left</option><option '+(selectedPosition==3 ? 'selected="selected"' : '')+' value="3">Bottom-right</option><option '+(selectedPosition==4 ? 'selected="selected"' : '')+' value="4">Bottom-left</option></select></td>';
			template.innerHTML = '<tr><td><input class="uuid" type="hidden" value="'+uuid+'"><input class="name" value="'+items.env_settings[i].name+'" /></td><td><input class="address" value="'+items.env_settings[i].address+'" /></td><td><input class="color jscolor" value="'+items.env_settings[i].color+'" /></td>'+positionSelect+'<td><button class="delete" title="Remove"></button></td></tr>';
			document.getElementById('tbody').appendChild(template);
			jscolor.installByClassName("jscolor");
			_addDeleteAction();
		}
		document.getElementById('hosted-file').value = data.current_state && data.current_state.hosted_file? data.current_state.hosted_file : "";
		document.getElementById('auto-import').checked = data.current_state && data.current_state.auto_import? data.current_state.auto_import : 0;
	});
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
	document.getElementById('tbody').innerHTML = '';	
	restore_options(); 
	return true; 
});

// add more button action
function add_more() {
	var template = document.createElement('tr');
	var positionSelect = '<td><select class="position"><option selected="selected" value="1">Top-right</option><option value="2">Top-left</option><option value="3">Bottom-right</option><option value="4">Bottom-left</option></select></td>';
	template.innerHTML = '<tr><td><input class="uuid" type="hidden" value="'+uuidv4()+'"><input class="name" /></td><td><input class="address" /></td><td><input class="color jscolor" value="'+(Math.random()*0xFFFFFF<<0).toString(16)+'" /></td>'+positionSelect+'<td><button class="delete" title="Remove"></button></td></tr>';
	document.getElementById('tbody').appendChild(template);
	jscolor.installByClassName("jscolor");
	_addDeleteAction();
}

// download the current settings as json
function exportSettings() {
	chrome.storage.sync.get({current_state: {
		env_settings: []
	}}, function(data) {
		var items = data.current_state;
		var a = document.createElement('a');
		a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(JSON.stringify(items.env_settings)));
		a.setAttribute('download', 'envmarker.json');
		a.click();
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
				chrome.storage.sync.get({current_state: {
					last_update: new Date().getTime(),
					env_settings: [{uuid: '0ac126c8-9aff-452b-b76c-941104854128', name: 'EXAMPLE', address: 'geovanneborges.com.br', color: '0000ff', position: 1}],
					hosted_file: "",
					auto_import: 0
				}}, function(data) {
					ENV_SETTINGS = data.current_state.env_settings;
					HOSTED_FILE = document.getElementById('hosted-file').value;
					AUTO_IMPORT = document.getElementById('auto-import').checked;

					_mergeSettings(JSON.parse(newconfig), ENV_SETTINGS, HOSTED_FILE, AUTO_IMPORT, function(){
						var status = document.getElementById('import-status');
						status.textContent = 'Successfully imported! Refreshing...';
						setTimeout(function() {
							location.reload();
						}, 750);
					});
				});
			} catch(e) {
				alert('An unexpected error occoured while loading the file.');
			}
		}
		r.readAsText(f);
	} else { 
		alert('An unexpected error occoured while loading the file.');
	}

}

// import file hosted on the Internet
function importHostedFile() {
	var url = document.getElementById('hosted-file').value;
	document.getElementById('hosted-file').disabled = true;
	document.getElementById('btn-import').disabled = true;
	document.getElementById('auto-import').disabled = true;
	if (_validateURL(url)) {
		fetch(url)
		.then(res => res.json())
		.then((out) => {
		  	chrome.storage.sync.get({current_state: {
				last_update: new Date().getTime(),
				env_settings: [{uuid: '0ac126c8-9aff-452b-b76c-941104854128', name: 'EXAMPLE', address: 'geovanneborges.com.br', color: '0000ff', position: 1}],
				hosted_file: "",
				auto_import: 0
			}}, function(data) {
				ENV_SETTINGS = data.current_state.env_settings;
				HOSTED_FILE = document.getElementById('hosted-file').value;
				AUTO_IMPORT = document.getElementById("auto-import") && document.getElementById("auto-import").checked ? 1 : 0;

				_mergeSettings(out, ENV_SETTINGS, HOSTED_FILE, AUTO_IMPORT, function(){
					var status = document.getElementById('import-status');
					status.textContent = 'Successfully imported! Refreshing...';
					setTimeout(function() {
						location.reload();
					}, 750);
				});
			});
		})
		.catch(err => { 		
			alert('Something went wrong when trying to retrieve the file from the URL.');
			document.getElementById('hosted-file').disabled = false;
			document.getElementById('btn-import').disabled = false;
			document.getElementById('auto-import').disabled = false;		
		});
	} else {
		document.getElementById('hosted-file').disabled = false;
		document.getElementById('btn-import').disabled = false;
		document.getElementById('auto-import').disabled = false;
	}
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('more').addEventListener('click', add_more);
document.getElementById('export').addEventListener('click', exportSettings);
document.getElementById('import').addEventListener('change', importSettings);
document.getElementById('btn-import').addEventListener('click', importHostedFile);