// Saves options to chrome.storage
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


// restore settings stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    env_settings: [{name: 'EXAMPLE', address: 'geovanneborges.com.br', color: '#0000ff'},]
  }, function(items) {
	for(var i = 0; i<items.env_settings.length; i++) {
		var template = document.createElement('tr');
		template.innerHTML = '<tr><td><input class="name" value="'+items.env_settings[i].name+'" /></td><td><input class="address" value="'+items.env_settings[i].address+'" /></td><td><input class="color"  value="'+items.env_settings[i].color+'" /></td><td>x</td></tr>';
		document.getElementById('tbody').appendChild(template);
	}
  });
}

// add more button action
function add_more() {
	var template = document.createElement('tr');
	template.innerHTML = '<tr><td><input class="name" /></td><td><input class="address" /></td><td><input class="color" /></td><td>x</td></tr>';
	document.getElementById('tbody').appendChild(template);
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('more').addEventListener('click', add_more);