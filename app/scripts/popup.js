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
				document.getElementById('popup-text').innerText = chrome.i18n.getMessage('__ToggleNotPossible__');
				document.getElementById('popup-button').style.display = 'none';
			} else {
				document.getElementById('popup-text').innerText = chrome.i18n.getMessage('__TemporarilyToggle__');
				document.getElementById('popup-button').style.display = 'block';
				document.getElementById('popup-button').innerText = chrome.i18n.getMessage(response.isDisabled ? '__ShowLabel__' : '__HideLabel__');
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
				document.getElementById('color').dispatchEvent(new Event('change'));
				document.getElementById('fontSize').value = response.currentConfig.fontSize || 'auto';
				document.getElementById('position').value = response.currentConfig.position;
				document.getElementById('position').dispatchEvent(new Event('change'));
				document.getElementById('add').value = chrome.i18n.getMessage('__Save__');
			} else {
				document.getElementById('uuid').value = uuidv4();
				chrome.tabs.sendMessage(tabs[0].id, {action: 'getDomain'}, function(response) {
					if(response && response.domain) {
						document.getElementById('address').value = response.domain;
						document.getElementById('name').value = response.domain.replace(/\./g, '').toUpperCase();
					}
				});
				document.getElementById('color').value = hexToRgba((Math.random()*0xFFFFFF<<0).toString(16));
				document.getElementById('position').value = '1';
				document.getElementById('position').dispatchEvent(new Event('change'));
				document.getElementById('color').dispatchEvent(new Event('change'));
				document.getElementById('fontSize').value = 'auto';
			}
			add_colorpicker(document.getElementById('color'));
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

// Update the updatePreview function and add event listeners
function updatePreview() {
	const colorInput = document.getElementById('color');
	const positionSelect = document.getElementById('position');
	const preview = document.querySelector('.preview-box');
	
	if (preview && colorInput) {
		let color = colorInput.value;
		// Ensure color has a proper format
		preview.style.setProperty('--preview-color', color);
		preview.setAttribute('data-position', positionSelect.value);
	}
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
	updatePreview();
	updateAlertMessages();
	_i18n();
	document.getElementById('go-to-options').addEventListener('click', open_configuration);
}

function handleInvalidTab() {
	document.getElementById('error-message').innerText = chrome.i18n.getMessage('__EnvMarkerNotAvailableError__');
	document.getElementById('popup-button').style.display = 'none';
	document.getElementById('hide-show').style.display = 'none';
	document.getElementById('quick-configuration').style.display = 'none';
}

initialize_colorpicker();
document.addEventListener('DOMContentLoaded', set_initial_config);
document.getElementById('popup-button').addEventListener('click', toggle_label);
document.getElementById('quick-configuration').addEventListener('submit', saveData);
document.getElementById('position').addEventListener('change', updatePreview);
document.getElementById('color').addEventListener('change', updatePreview);