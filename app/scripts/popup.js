//Set initial button label
function set_button_label() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if (!tabs[0]) {
			handleInvalidTab();
			return;
		}
		
		chrome.tabs.sendMessage(tabs[0].id, {action: 'isDisabled'}, function(response) {
			if (chrome.runtime.lastError) {
				console.log(chrome.runtime.lastError);
				handleInvalidTab();
				return;
			}
			if(!response || response.isDisabled === 'notSet') {
				document.getElementById('popup-text').innerText = 'It is not possible to toggle visibility for this URL because you have not configured it yet.';
				document.getElementById('popup-button').style.display = 'none';
			} else {
				document.getElementById('popup-text').innerText = 'Click on the following button to temporarily Hide/Show the label:';
				document.getElementById('popup-button').style.display = 'block';
				document.getElementById('popup-button').innerText = response.isDisabled ? 'Show Label' : 'Hide Label';
			}
		});
	});
} 

//Set initial quick config values
function set_default_values() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if (!tabs[0]) {
			handleInvalidTab();
			return;
		}

		chrome.tabs.sendMessage(tabs[0].id, {action: 'getConfig'}, function(response) {
			if (chrome.runtime.lastError) {
				handleInvalidTab();
				return;
			}
			if(response && response.currentConfig) {
				document.getElementById('uuid').value = response.currentConfig.uuid || uuidv4();
				document.getElementById('name').value = response.currentConfig.name;
				document.getElementById('address').value = response.currentConfig.address;
				document.getElementById('color').value = response.currentConfig.color.toString();
				document.getElementById('color').dispatchEvent(new Event('blur'));
				document.getElementById('fontSize').value = response.currentConfig.fontSize || 'auto';
				document.getElementById('position').value = response.currentConfig.position;
				document.getElementById('position').dispatchEvent(new Event('change'));
				document.getElementById('add').value = 'Save';
			} else {
				document.getElementById('uuid').value = uuidv4();
				chrome.tabs.sendMessage(tabs[0].id, {action: 'getDomain'}, function(response) {
					if(response && response.domain) {
						document.getElementById('address').value = response.domain;
						document.getElementById('name').value = response.domain.replace(/\./g, '').toUpperCase();
					}
				});
				document.getElementById('color').value = (Math.random()*0xFFFFFF<<0).toString(16);
				document.getElementById('position').value = '1';
				document.getElementById('position').dispatchEvent(new Event('change'));
				document.getElementById('color').dispatchEvent(new Event('blur'));
				document.getElementById('fontSize').value = 'auto';
			}
		});
	});
}

function saveData() {
	var config = {
		uuid: document.getElementById('uuid').value,
		name: document.getElementById('name').value,
		address: document.getElementById('address').value,
		color: document.getElementById('color').value,
		fontSize: document.getElementById('fontSize').value,
		position: document.getElementById('position').value
	};

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if (!tabs[0]) {
			handleInvalidTab();
			return;
		}

		chrome.tabs.sendMessage(tabs[0].id, {action: 'setConfig', parameter: config}, function(response) {
			if (chrome.runtime.lastError) {
				handleInvalidTab();
				return;
			}
			// Result handling if needed
		});
	});
}

//Toggle button label
function toggle_label() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if (!tabs[0]) {
			handleInvalidTab();
			return;
		}

		chrome.tabs.sendMessage(tabs[0].id, {action: 'toggle'}, function(response) {
			if (chrome.runtime.lastError) {
				handleInvalidTab();
				return;
			}
			set_button_label();
		});
	});
}

//Open configuration screen
function open_configuration() {
	if (chrome.runtime.openOptionsPage) {
		chrome.runtime.openOptionsPage();
	} else {
		window.open(chrome.runtime.getURL('options.html'));
	}
}

function updatePreview() {
    const position = document.getElementById('position').value;
    const color = document.getElementById('color').value;
    const previewBox = document.querySelector('.preview-box');
    
    // Update position
    previewBox.setAttribute('data-position', position);
    
    // Update color
    document.documentElement.style.setProperty('--preview-color', `#${color}`);
}

function initialize_colorpicker() {
	var options = {
		zIndex: 99999,
		onFineChange: updatePreview
	}
	new jscolor('color', options);
}

function updateAlertMessages() {
	chrome.storage.sync.get('alert_messages', function(result) {
		var messages = result.alert_messages;
		var message_container = document.getElementById('notifications-container');
		message_container.innerHTML = '';
		message_container.appendChild(_updateAlertMessages(messages));
	});
}

function set_initial_config() {
	set_button_label();
	set_default_values();
	initialize_colorpicker();
	updatePreview();
	updateAlertMessages();
}

function handleInvalidTab() {
	document.getElementById('error-message').innerText = 'Environment Marker is not available on this page. The extension only works on web pages.';
	document.getElementById('popup-button').style.display = 'none';
	document.getElementById('hide-show').style.display = 'none';
	document.getElementById('quick-configuration').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', set_initial_config);
document.getElementById('popup-button').addEventListener('click', toggle_label);
document.getElementById('quick-configuration').addEventListener('submit', saveData);
document.getElementById('go-to-options').addEventListener('click', open_configuration);
document.getElementById('position').addEventListener('change', updatePreview);