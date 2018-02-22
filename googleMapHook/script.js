window.onload=function(){
	var id, target, options;

	function success(pos) {
		var crd = pos.coords;
	  initMap(crd)
	}

	function error(err) {
	  var crd = {
		latitude: 51.507222,
		longitude: -0.1275
	  };
	  initMap(crd)
	}

	options = {
	  enableHighAccuracy: false,
	  timeout: 5000,
	  maximumAge: 0
	};

	function initMap(coords) {
		var lat = coords.latitude;
	  var lng = coords.longitude;
	  var location = {
		lat: lat,
		lng: lng
	  };
	  map = new google.maps.Map(document.getElementById('map'), {
		center: location,
		zoom: 15
	  });
	  infowindow = new google.maps.InfoWindow();
	  var service = new google.maps.places.PlacesService(map);
	  service.nearbySearch({
		  location: location,
		  radius: 5000,
		  keyword: ['bar']
		},
		callback);
	}

	function callback(results, status) {
	  if (status === google.maps.places.PlacesServiceStatus.OK) {
		for (var i = 0; i < results.length; i++) {
		  createMarker(results[i]);
		}
	  }
	}

	function createMarker(place) {
	  var placeLoc = place.geometry.location;
	  var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	  });
	  google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(place.name);
		infowindow.open(map, this);
	  });
	 }

	id = navigator.geolocation.watchPosition(success, error, options);
}
