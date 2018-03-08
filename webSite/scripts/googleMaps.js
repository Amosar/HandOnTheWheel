var api_key = "AIzaSyD1wu0c5kRaHUH7SvyTT8fpV01S-vFMemI";

function getQuickLocation(success){
  //TODO Need to understand this code and improve it
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      var geolocation = JSON.parse(xhttp.responseText).location;
      if (xhttp.readyState == 4 && (xhttp.status == 403 || xhttp.status == 500)) {
          el.innerHTML += 'Sorry! Our Google Geolocation API Quota exceeded. Maybe refresh the page to try again.';
      }
      success(geolocation);
    }
  };
  xhttp.open("POST", "https://www.googleapis.com/geolocation/v1/geolocate?key=" + api_key, true);
  xhttp.send();
}

function getPreciseLocation(success){
  var options = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 0
  };
  function localSuccess(pos) {
    var location = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
    };
    success(location);
      $(".location-loading").hide();
  }

    //TODO better error for user
  function localError(err){
      console.warn(err);
      alert("Your location could not be determined\n" + err.message);
      $(".location-loading").hide();
  }
  navigator.geolocation.getCurrentPosition(localSuccess, localError, options);
    $(".location-loading").show();
}

function updateMap(location){
  var mapOptions = {
      center: location,
      zoom: 15
  };
  if (typeof map.setCenter !== "undefined") {
    map.panTo(location);
    map.setZoom(mapOptions.zoom);
  }else{
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
  }
}


$(document).ready(function() {
  getQuickLocation(updateMap);

  $(".closetome").click(function() {
    getPreciseLocation(updateMap);
  });
});
