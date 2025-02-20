// background.js

// Helper: load a script dynamically; returns a Promise.
function loadScript(src) {
	return new Promise((resolve, reject) => {
	  const s = document.createElement("script");
	  s.src = src;
	  s.onload = resolve;
	  s.onerror = reject;
	  document.head.appendChild(s);
	});
  }
  
  // Load util.js: use importScripts if available; otherwise, dynamically load.
  if (typeof importScripts === 'function') {
	importScripts("scripts/util.js");
  } else {
	loadScript("scripts/util.js").catch(err => {
	  console.error("Error loading util.js:", err);
	});
  }
  
  var ENV_SETTINGS = [];
  var HOSTED_FILE = "";
  var AUTO_IMPORT = 0;
  
  // Import file hosted on the Internet
  function _requestFile() {
	if (AUTO_IMPORT && _validateURL(HOSTED_FILE)) {
	  fetch(HOSTED_FILE)
		.then(res => res.json())
		.then((out) => {
		  _mergeSettings(out, ENV_SETTINGS, HOSTED_FILE, AUTO_IMPORT, function(){});
		})
		.catch(err => {         
		  console.log('Environment Marker: Something went wrong when trying to retrieve the file from the URL.');        
		});
	}
  }
  
  function _importHostedFile() {
	chrome.storage.sync.get({
	  current_state: {
		last_update: new Date().getTime(),
		env_settings: [{
		  uuid: '0ac126c8-9aff-452b-b76c-941104854128',
		  name: 'EXAMPLE',
		  address: 'environmentmarker.io',
		  color: '0000ff',
		  position: 1
		}],
		hosted_file: "",
		auto_import: 0
	  }
	}, function(data) {
	  ENV_SETTINGS = data.current_state.env_settings;
	  HOSTED_FILE = data.current_state.hosted_file;
	  AUTO_IMPORT = data.current_state.auto_import;
	  _requestFile();
	});
  }
  
  chrome.runtime.onInstalled.addListener(() => {
	// Create alarm after extension installation/upgraded to refresh config JSON file.
	chrome.alarms.create('auto_import', { periodInMinutes: 1 });
  });
  
  // Alarm listener to reimport data from host.
  chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name === "auto_import") {
	  _importHostedFile();
	}
  });
  
  // Function to initialize Firebase functionality.
  function initializeFirebase() {
	// The placeholder %%FIREBASE_CONFIG%% will be replaced at build time.
	const config = %%FIREBASE_CONFIG%%;
	
	firebase.initializeApp(config);
  
	const remoteConfig = firebase.remoteConfig();
  
	remoteConfig.settings = {
	  minimumFetchIntervalMillis: 3600000,
	};
	remoteConfig.defaultConfig = {
	  alert_messages: JSON.stringify({ messages: [] })
	};
  
	remoteConfig.fetchAndActivate()
	  .then(() => {
		const configString = remoteConfig.getString('alert_messages');
		var configFile = JSON.parse(configString);
		// Save the alert messages to storage.
		chrome.storage.sync.set({ alert_messages: configFile.messages }, function() {});
	  })
	  .catch((err) => {
		console.error('Error fetching remote config:', err);
	  });
  }
  
  // Load Firebase libraries conditionally.
  try {
	self.window = self;
	if (typeof importScripts === 'function') {
	  // In Chrome (service worker), importScripts works.
	  importScripts(
		'scripts/libs/firebase/firebase-app-compat.js',
		'scripts/libs/firebase/firebase-remote-config-compat.js'
	  );
	  initializeFirebase();
	} else {
	  // In Firefox (background page), load via dynamic script injection.
	  loadScript('scripts/libs/firebase/firebase-app-compat.js')
		.then(() => loadScript('scripts/libs/firebase/firebase-remote-config-compat.js'))
		.then(() => {
		  initializeFirebase();
		})
		.catch(err => {
		  console.error("Error loading Firebase scripts:", err);
		});
	}
  } catch (e) {
	console.error('Firebase initialization error:', e);
  }  