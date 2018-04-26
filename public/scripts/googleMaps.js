const api_key = "AIzaSyAf-JAqM8EDoTDnBgaH0dN9ioyBPI0dYJs";
let markers = [];

/**
 * Use Google Maps Geolocation API to found the location of the user.
 * It use information about cell towers and WiFi nodes and it's not precise.
 * @param success - give a callback method called if the user location is get.
 */
function getQuickLocation(success) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            const geolocation = JSON.parse(xhttp.responseText).location;
            if (xhttp.readyState === 4 && (xhttp.status === 403 || xhttp.status === 500)) {
                el.innerHTML += 'Sorry! Our Google Geolocation API Quota exceeded. Maybe refresh the page to try again.';
            }
            success(geolocation);
        }
    };
    xhttp.open("POST", "https://www.googleapis.com/geolocation/v1/geolocate?key=" + api_key, true);
    xhttp.send();
}

/**
 * Use GPS information to found location
 * @param success - give a callback method called if the user location is get.
 */
function getPreciseLocation(success) {
    const options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
    };

    //function called if the user location is found
    function localSuccess(pos) {
        const location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        };
        success(location);
        $(".location-loading").hide();
    }

    //function called if the user location cannot be found
    function localError(err) {
        console.warn(err);
        alert("Your location could not be determined\n" + err.message);
        $(".location-loading").hide();
    }

    navigator.geolocation.getCurrentPosition(localSuccess, localError, options);
    $(".location-loading").show();
}

/**
 * Use user inputed text to find location
 */
function searchLocation() {
    //create the search box and link it to the searchbar
    const input = document.getElementById('searchbar');
    const searchBox = new google.maps.places.SearchBox(input);

    //bias search results to current view
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    //listen for event when user selects place get more information
    searchBox.addListener('places_changed', function () {
        const places = searchBox.getPlaces();

        if (places.length === 0) {
            return;
        }

        //for each place get name and location.
        const bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            //get the center co-ords of the map
            const newMapCenter = map.getCenter();
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
                //get lat and lng co-ords from center function
                console.log("lat:" + newMapCenter.lat() + " " + "lng:" + newMapCenter.lng());
            } else {
                bounds.extend(place.geometry.location);
                //get lat and lng co-ords from center function
                console.log("lat:" + newMapCenter.lat() + " " + "lng:" + newMapCenter.lng());
            }
        });

        //clear previous markers
        clearMarkers();
        //display the location
        map.fitBounds(bounds);
        //display new markers
        navigatedLocation();
    });
}

/**
 * Update the map with with the position of the user
 */
//when user navigates to a location update markers
function navigatedLocation() {
    const newMapCenter = map.getCenter();
    const location = {
        lat: newMapCenter.lat(),
        lng: newMapCenter.lng()
    };
    updateMap(location);
}

/**
 * Update the map with a given location
 * @param location - location object with lat and lng fields.
 */
function updateMap(location) {
    const mapOptions = {
        center: location,
        zoom: 15,
        streetViewControl: false,
        minZoom: 3
    };
    clearMarkers();
    //Used to know if the map is initialized or not
    if (typeof map.setCenter !== "undefined") {
        map.panTo(location);
        map.setZoom(mapOptions.zoom);
        placeMarkers(location);
    } else {
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        placeMarkers(location);
    }
}

/**
 * Place marker on the map at given location
 * @param location - location object with lat and lng fields
 */
function placeMarkers(location) {
    const request = {
        location: location,
        radius: '1000',
        type: ['bar']
    };
    const infowindow = new google.maps.InfoWindow();
    const service = new google.maps.places.PlacesService(map);

    checkIfUserIsLogged(function (userIsLogged) {
        //Service provided by google maps to find places
        service.nearbySearch(request, function (results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (let i = 0; i < results.length; i++) {
                    const place = results[i];
                    getBarRatingByUser(place.place_id, function (barRated) {
                        //Create custom icon for the google maps markers
                        const icon = {
                            url: "/img/pinpint.png",
                            size: new google.maps.Size(50, 50),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(17, 34),
                            scaledSize: new google.maps.Size(50, 50)
                        };
                        if (barRated.isRated) {
                            icon.url = "/img/pinpint-rated.png"
                        }

                        const marker = new google.maps.Marker({
                            map: map,
                            position: place.geometry.location,
                            icon: icon
                        });
                        marker.data = place;
                        //Add listener to see the information of the bar when you click on it
                        google.maps.event.addListener(marker, 'click', function () {
                            //Call the PlaceService to get information about the bar when user click on the marker
                            const PlaceService = new google.maps.places.PlacesService(map);
                            PlaceService.getDetails({
                                placeId: this.data.place_id
                            }, function (placeDetail, status) {
                                //Needed to get the right marker
                                for (let j = 0; j < markers.length; j++) {
                                    if (markers[j].data.place_id === placeDetail.place_id) {
                                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                                            let infoWindowContent = '<div><strong>' + placeDetail.name + '</strong><br />';
                                            infoWindowContent += 'Google rating: ' + placeDetail.rating + '<br />';
                                            //If the bar have a website display it on the infoWindow
                                            if (placeDetail.website !== undefined) {
                                                infoWindowContent += 'WebSite: <a href="' + placeDetail.website
                                                    + '" target="_blank">click here</a><br />';
                                            }
                                            infoWindowContent += placeDetail.formatted_address + "<br />";
                                            infoWindowContent += '<a target="_blank" href="' + placeDetail.url
                                                + '">View on Google Maps</a><br /><br />';

                                            /*
                                            Check if the bar is rated and add the information needed by the rating modal
                                            to the rating button on the infoWindow
                                             */
                                            if (barRated.isRated) {
                                                infoWindowContent += "Your rating: " + barRated.rating + "/5 <br />";
                                                infoWindowContent += "<a data-toggle='modal' data-target='#modalRating\' " +
                                                    "data-bar_name='" + placeDetail.name + "' " +
                                                    "data-bar_id='" + placeDetail.place_id + "' " +
                                                    "data-bar_rating='" + barRated.rating + "' " +
                                                    "data-bar_comment='" + barRated.comment + "'  " +
                                                    "href=''>Change your rating</a> "
                                            } else if (userIsLogged) {
                                                infoWindowContent += "<a data-toggle='modal' data-target=\"#modalRating\" " +
                                                    "data-bar_name='" + placeDetail.name + "' " +
                                                    "data-bar_id='" + placeDetail.place_id + "' " +
                                                    "href=''>Rate this bar</a> "
                                            }
                                            infoWindowContent += "</div>";
                                            infowindow.setContent(infoWindowContent);
                                            infowindow.open(map, markers[j]);
                                        }
                                    }
                                }
                            });
                        });
                        //Store the markers (useful for the infoWindow and to be able to marker cluster in the future)
                        markers.push(marker);
                    });
                }
            }

        });
    })
}

/**
 * Ask the server if the bar is rated by the logged user and get the information about the bar
 * @param barID     google map id of the bar
 * @param callback  callback function that return the json answer give by the server
 */
function getBarRatingByUser(barID, callback) {
    const formData = {barID: barID};
    $.ajax({
        type: 'POST',
        url: "/getBarRatingByUser",
        data: formData
    }).done(function (response) {
        callback(response);
    }).fail(function (data) {
        callback(data.responseJSON);
    });
}

/**
 * Ask the server if the active user is logged or not
 * @param callback  boolean that said if the user is logged or not
 */
function checkIfUserIsLogged(callback) {
    $.ajax({
        type: 'POST',
        url: "/userIsLogged",
    }).done(function (response) {
        if (response.result) {
            callback(true);
        } else {
            callback(false);
        }
    }).fail(function (data) {
        callback(false);
    })
}

/**
 * Remove all created markers
 */
function clearMarkers() {
    const length = markers.length;
    for (let i = 0; i < length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

/**
 * Init the map when the page is load
 */
$(document).ready(function () {
    //find location
    getQuickLocation(updateMap);

    //find exact location
    $(".closetome").click(function () {
        $('.search').val(""); //clears the serachbox
        getPreciseLocation(updateMap);
    });

    //find searched location
    $(".search").click(function () {
        searchLocation();
    });

    //add markers for current view on map
    $(".findbars").click(function () {
        navigatedLocation();
    });

});
