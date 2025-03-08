// saves options to chrome.storage
function save_options() {
	var configs = document.getElementsByTagName('tr');
	var configs_array = [];
	for(var i = 0; i<configs.length;i++) {
		var uuid = configs[i].querySelector('.uuid') && configs[i].querySelector('.uuid').value || uuidv4(); 
		var name = configs[i].querySelector('.name') && configs[i].querySelector('.name').value; 
		var address = configs[i].querySelector('.address') && configs[i].querySelector('.address').value; 
		var color = configs[i].querySelector('.color') && configs[i].querySelector('.color').value;
		var fontSize = configs[i].querySelector('.font-size') && configs[i].querySelector('.font-size').value;
		var position = configs[i].querySelector('.position') && configs[i].querySelector('.position').value;  
		
		if(uuid && name && address && color && position) {
			var obj = {
				uuid: uuid,
				name: name,
				address: address,
				color: color,
				fontSize: fontSize || 'auto',
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
    status.classList.add('success');
    setTimeout(function() {
    	status.classList.remove('success');
    }, 1200);
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
	updateAlertMessages();

	_i18n();

	chrome.storage.sync.get(
	  {
		current_state: {
		  env_settings: [
			{
			  uuid: '0ac126c8-9aff-452b-b76c-941104854128',
			  name: 'EXAMPLE',
			  address: 'environmentmarker.io',
			  color: 'rgba(0, 85, 188, 1)',
			  position: 1,
			},
		  ],
		  hosted_file: "",
		  auto_import: 0,
		},
	  },
	  function (data) {
		var items = data.current_state;
  
		for (var i = 0; i < items.env_settings.length; i++) {
		  var envItem = items.env_settings[i];
		  var selectedPosition = envItem.position || 1;
		  var uuid = envItem.uuid ? envItem.uuid : uuidv4();
  
		  // Build the position select element
		  var positionSelect = `
			<td>
			  <select class="position">
				<option ${selectedPosition == 1 ? 'selected="selected"' : ''} value="1">
				  ${chrome.i18n.getMessage('__TopRight__')}
				</option>
				<option ${selectedPosition == 2 ? 'selected="selected"' : ''} value="2">
				  ${chrome.i18n.getMessage('__TopLeft__')}
				</option>
				<option ${selectedPosition == 3 ? 'selected="selected"' : ''} value="3">
				  ${chrome.i18n.getMessage('__BottomRight__')}
				</option>
				<option ${selectedPosition == 4 ? 'selected="selected"' : ''} value="4">
				  ${chrome.i18n.getMessage('__BottomLeft__')}
				</option>
				<option ${selectedPosition == 5 ? 'selected="selected"' : ''} value="5">
				  ${chrome.i18n.getMessage('__Moldure__')}
				</option>
			  </select>
			  <div class="position-container">
				<div class="position-preview" style="--preview-color: ${envItem.color}" data-position="${selectedPosition}">
					<div class="preview-box">
						<div class="preview-ribbon"></div>
						<div class="preview-moldure"></div>
					</div>
				</div>
			  </div>
			</td>`;

		  if (envItem.color.length === 6) {
			envItem.color = hexToRgba(envItem.color);
		  }
  
		  // Build the complete table row HTML
		  var rowHTML = `
			<tr>
			  <td>
				<input class="uuid" type="hidden" value="${uuid}">
				<input class="name" value="${envItem.name}" />
			  </td>
			  <td>
				<input class="address" value="${envItem.address}" />
			  </td>
			  <td>
				<input class="color" data-jscolor="" value="${envItem.color}" />
			  </td>
			  <td>
				<select class="font-size">
				  ${generateFontSizeOptions(envItem.fontSize)}
				</select>
			  </td>
			  ${positionSelect}
			  <td>
				<button class="delete" title="Remove"></button>
			  </td>
			</tr>`;
  
		  // Create a container for the row and add it to the table body
		  var template = document.createElement('tbody');
		  template.innerHTML = rowHTML;
		  document.getElementById('tbody').appendChild(template.firstElementChild);
  
		  _addDeleteAction();

		  // After adding the row, set up the preview listeners
		  const rows = document.getElementById('tbody').getElementsByTagName('tr');
		  setupPreviewListeners(rows[rows.length - 1]);
		  updatePreview(rows[rows.length - 1]);
		  //Refresh picker
		  add_colorpicker(document.getElementById('tbody'));
		}
  
		document.getElementById('hosted-file').value =
		  data.current_state && data.current_state.hosted_file
			? data.current_state.hosted_file
			: "";
		document.getElementById('auto-import').checked =
		  data.current_state && data.current_state.auto_import
			? data.current_state.auto_import
			: 0;
	  }
	);
} 

function updateAlertMessages() {
	chrome.storage.sync.get('alert_messages', function(result) {
		var messages = result.alert_messages;
		var message_container = document.getElementById('notifications-container');
		message_container.innerHTML = '';
		message_container.appendChild(_updateAlertMessages(messages));
	});
}
  
chrome.storage.onChanged.addListener(function(changes, namespace) {
	document.getElementById('tbody').innerHTML = '';	
	restore_options(); 
	return true; 
});

// Add more button action
function add_more() {
	// Create a new table row container
	var template = document.createElement('tr');
  
	// Build the position select element
	var positionSelect = `
	  <td>
		<select class="position">
		  <option selected="selected" value="1">${chrome.i18n.getMessage('__TopRight__')}</option>
		  <option value="2">${chrome.i18n.getMessage('__TopLeft__')}</option>
		  <option value="3">${chrome.i18n.getMessage('__BottomRight__')}</option>
		  <option value="4">${chrome.i18n.getMessage('__BottomLeft__')}</option>
		  <option value="5">${chrome.i18n.getMessage('__Moldure__')}</option>
		</select>
		<div class="position-container">
			<div class="position-preview" style="--preview-color: rgba(1,1,1,1)" data-position="1">
			  <div class="preview-box">
				<div class="preview-ribbon"></div>
				<div class="preview-moldure"></div>
			  </div>
			</div>
		</div>
	  </td>`;
  
	// Generate random color for preview
	const randomColor = hexToRgba((Math.random()*0xFFFFFF<<0).toString(16));
  
	var rowHTML = `
	  <tr>
		<td>
		  <input class="uuid" type="hidden" value="${uuidv4()}">
		  <input class="name" />
		</td>
		<td>
		  <input class="address" />
		</td>
		<td>
		  <input class="color" data-jscolor="" value="${randomColor}" />
		</td>
		<td>
		  <select class="font-size">
			${generateFontSizeOptions()}
		  </select>
		</td>
		${positionSelect}
		<td>
		  <button class="delete" title="Remove"></button>
		</td>
	  </tr>`;
  
	// Set the innerHTML and add the row to the table body
	template.innerHTML = rowHTML;
	document.getElementById('tbody').appendChild(template);
  
	// Reinstall jscolor and add delete action for the new row
	add_colorpicker(document.getElementById('tbody'));
	_addDeleteAction();

	updatePreview(template);

	// After adding the new row, set up the preview listeners
	setupPreviewListeners(template);
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
			var status = document.getElementById('local-import-status');
			
			try {
				// Try to parse the JSON first to validate it
				const parsedConfig = JSON.parse(newconfig);
				
				chrome.storage.sync.get({current_state: {
					last_update: new Date().getTime(),
					env_settings: [{uuid: '0ac126c8-9aff-452b-b76c-941104854128', name: 'EXAMPLE', address: 'environmentmarker.io', color: 'rgba(0, 85, 188, 1)', position: 1}],
					hosted_file: "",
					auto_import: 0
				}}, function(data) {
					ENV_SETTINGS = data.current_state.env_settings;
					HOSTED_FILE = document.getElementById('hosted-file').value;
					AUTO_IMPORT = document.getElementById('auto-import').checked;

					_mergeSettings(parsedConfig, ENV_SETTINGS, HOSTED_FILE, AUTO_IMPORT, function(){
						status.classList.add('success');
						setTimeout(function() {
							status.classList.remove('success');
							location.reload();
						}, 1500);
					});
				});
			} catch(e) {
				status.classList.add('error-parsing-json');
				setTimeout(function() {
					status.classList.remove('error-parsing-json');
				}, 1500);
			}
		}
		r.readAsText(f);
	} else { 
		var status = document.getElementById('local-import-status');
		status.classList.add('error');
		setTimeout(function() {
			status.classList.remove('error');
		}, 1500);
	}
}

// import file hosted on the Internet
function importHostedFile() {
	var url = document.getElementById('hosted-file').value;
	document.getElementById('hosted-file').disabled = true;
	document.getElementById('btn-import').disabled = true;
	document.getElementById('auto-import').disabled = true;
	var status = document.getElementById('import-status');
	status.classList.add('loading');

	if (_validateURL(url)) {
		fetch(url)
		.then(res => res.json())
		.then((out) => {
		  	chrome.storage.sync.get({current_state: {
				last_update: new Date().getTime(),
				env_settings: [{uuid: '0ac126c8-9aff-452b-b76c-941104854128', name: 'EXAMPLE', address: 'environmentmarker.io', color: 'rgba(0, 85, 188, 1)', position: 1}],
				hosted_file: "",
				auto_import: 0
			}}, function(data) {
				ENV_SETTINGS = data.current_state.env_settings;
				HOSTED_FILE = document.getElementById('hosted-file').value;
				AUTO_IMPORT = document.getElementById("auto-import") && document.getElementById("auto-import").checked ? 1 : 0;

				_mergeSettings(out, ENV_SETTINGS, HOSTED_FILE, AUTO_IMPORT, function(){
					// Update status to let user know options were saved.
					var status = document.getElementById('import-status');
					status.classList.remove('loading');
					status.classList.add('success');
					setTimeout(function() {
						status.classList.remove('success');
						location.reload();
					}, 1500);
				});
			});
		})
		.catch(err => { 		
			// Update status to let user know options were saved.
			var status = document.getElementById('import-status');
			status.classList.remove('loading');
			status.classList.add('error');
			setTimeout(function() {
				status.classList.remove('error');
			}, 1500);
			document.getElementById('hosted-file').disabled = false;
			document.getElementById('btn-import').disabled = false;
			document.getElementById('auto-import').disabled = false;		
		});
	} else {
		var status = document.getElementById('import-status');
		status.classList.remove('loading');
		status.classList.add('error-url');
		setTimeout(function() {
			status.classList.remove('error-url');
		}, 1500);
		document.getElementById('hosted-file').disabled = false;
		document.getElementById('btn-import').disabled = false;
		document.getElementById('auto-import').disabled = false;
	}
}

// Update the updatePreview function and add event listeners
function updatePreview(row) {
	const colorInput = row.querySelector('.color');
	const positionSelect = row.querySelector('.position');
	const preview = row.querySelector('.position-preview');
	
	if (preview && colorInput) {
		var color = colorInput.value;
		if (color.length === 6) {
			color = hexToRgba(color);
		}
		
		preview.style.setProperty('--preview-color', color);
		preview.setAttribute('data-position', positionSelect.value);
	}
}

// Add function to set up preview listeners for a row
function setupPreviewListeners(row) {
	const colorInput = row.querySelector('.color');
	const positionSelect = row.querySelector('.position');

	if (colorInput) {
		colorInput.addEventListener('change', () => updatePreview(row));
	}
	if (positionSelect) {
		positionSelect.addEventListener('change', () => updatePreview(row));
	}
}

// Add this function to generate font size options
function generateFontSizeOptions(selectedSize = 'auto') {
	let options = '<option value="auto" ' + (selectedSize === 'auto' ? 'selected="selected"' : '') + '>Auto</option>';
	for(let size = 5; size <= 60; size += 5) {
		options += `<option value="${size}px" ${selectedSize === size + 'px' ? 'selected="selected"' : ''}>${size}px</option>`;
	}
	return options;
}

initialize_colorpicker();
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('auto-import').addEventListener('click', save_options);
document.getElementById('more').addEventListener('click', add_more);
document.getElementById('export').addEventListener('click', exportSettings);
document.getElementById('import').addEventListener('change', importSettings);
document.getElementById('btn-import').addEventListener('click', importHostedFile);