var id;
var locations = [];


var defaultLocation = {
    lat: 51.507222,
    lng: -0.1275
};

function initialize() {
    var options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
    };
    id = navigator.geolocation.watchPosition(success, error, options);
}

function success(pos) {
    var location = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
    };
    initMap(location);
    navigator.geolocation.clearWatch(id);
}

function error() {
    var location = {
        lat: defaultLocation.lat,
        lng: defaultLocation.lng
    };
    initMap(location);
    navigator.geolocation.clearWatch(id);
}


function initMap(location) {
    var mapOptions = {
        center: location,
        zoom: 15
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    placeMarkers(location)
}

function placeMarkers(location) {
    var request = {
        location: location,
        radius: '5000',
        types: ['bar']
    };
    var service = new google.maps.places.PlacesService(map);

    //With cluster
    service.nearbySearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                var markerLocation = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
                locations.push(markerLocation);
                var labels = '';

                var markers = locations.map(function (location, i) {
                    return new google.maps.Marker({
                        position: location,
                        label: labels[i % labels.length]
                    });
                });

                var markerCluster = new MarkerClusterer(map, markers,
                    {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
            }
        }
    });
}

google.maps.event.addDomListener(window, 'load', initialize);
