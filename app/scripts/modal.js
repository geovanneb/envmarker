chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
 
 if (request.action == 'isDisabled') {
   if(!document.getElementById('marker')) {
	   sendResponse({isDisabled: 'notSet'});
   } else {
	   if(document.getElementById('marker')) {
			sendResponse({isDisabled: document.getElementById('marker').style.display == 'none'});
	   } else {
			sendResponse({isDisabled: 'notSet'});		   
	   }
   }
 } else if(request.action == 'toggle') {
   var marker = document.getElementById('marker');
   if(marker.style.display == 'none') {
	   marker.style.display = 'block';
   } else {
	   marker.style.display = 'none';
   }
 }
});


chrome.storage.sync.get({
    env_settings: [{name: 'EXAMPLE', address: 'geovanneborges.com.br', color: '#0000ff'},]
  }, function(items) {
		var tablink = window.location.href;
		for(var i = 0; i<items.env_settings.length; i++) {
		  if(tablink.indexOf(items.env_settings[i].address) > -1) {
			 wrapperDiv = document.createElement('div');
			 wrapperDiv.id = 'marker';
			 wrapperDiv.setAttribute('style','position: fixed; right: -127px; top: 43px; background-color: '+items.env_settings[i].color+'; opacity: 0.9; z-index: 2000; height: 55px; width: 396px; line-height: 55px; transform: rotate(44deg); box-shadow: 7px 0px 9px #000; text-align: center; font-size: 37px; color: #fff;');
			 wrapperDiv.innerText = items.env_settings[i].name;
			 document.body.appendChild(wrapperDiv);
		  }
		}
  });

