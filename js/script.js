var map;
var locations = [];
var markers = [];
var foursquare = '';

//Initialize the map and its contents
function initMap() {

    var greenlake = {lat: 47.680677, lng: -122.323503};

    map = new google.maps.Map(document.getElementById('map'), {
        center: greenlake,
        zoom: 15,
        styles: [
            {
                stylers: [
                    {hue: "#00ff6f"},
                    {saturation: -50}
                ]
            }, {
                featureType: "road",
                elementType: "geometry",
                stylers: [
                    {lightness: 100},
                    {visibility: "simplified"}
                ]
            }, {
                featureType: "transit",
                elementType: "geometry",
                stylers: [
                    {hue: "#ff6600"},
                    {saturation: +80}
                ]
            }, {
                featureType: "transit",
                elementType: "labels",
                stylers: [
                    {hue: "#ff0066"},
                    {saturation: +80}
                ]
            }, {
                featureType: "poi",
                elementType: "labels",
                stylers: [
                    {visibility: "off"}
                ]
            }, {
                featureType: "poi.park",
                elementType: "labels",
                stylers: [
                    {visibility: "on"}
                ]
            }, {
                featureType: "water",
                elementType: "geometry",
                stylers: [
                    {hue: "#c4f4f4"}
                ]
            }, {
                featureType: "road",
                elementType: "labels",
                stylers: [
                    {visibility: "off"}
                ]
            }
        ]
    });

    infowindow = new google.maps.InfoWindow();

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: greenlake,
        radius: 1000,
        type: ['bar']
    }, callback);

    function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < 10; i++) {
                var place = results[i];
                addLocation(place);
                createMarker(place);
            }
        }
    }



    setAllMap();

}

//Determines if locations should be visible
//This function is passed in the knockout viewModel function
function setAllMap() {
  for (var i = 0; i < locations.length; i++) {
    if(locations[i].boolTest === true) {
        markers[i].setVisible(true);
    } else {
        markers[i].setVisible(false);
    }
  }
}



function addLocation(place) {

    var location = {};
    location.place_id = place.place_id;
    location.position = place.geometry.location.toString();
    location.name = place.name;
    location.vicinity = place.vicinity;
    location.rating = place.rating;
    location.visible = ko.observable(true);
    location.boolTest = true;
    locations.push(location);
    console.log("pushed: " + location);
}

//Information about the different locations
//Provides information for the locations


function createMarker(place) {

    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        name: place.name,
        place_id: place.place_id,
        animation: google.maps.Animation.DROP,
        vicinity: place.vicinity,
        rating: place.rating
    });

    //when marker is clicked on the map, the clickMarker function is run
    google.maps.event.addListener(marker, 'click', function () {
        clickMarker(place);
    });
    markers.push(marker);
    return marker;


}

function clickMarker(place) {
    getFoursquare(place);
    console.log("Clicking...")

    //this timeout function gives the foursquare API a bit of time to retrieve the JSON data

    setTimeout(function () {
        var marker;

        for (var i = 0; i < markers.length; i++) {
            if (place.place_id === markers[i].place_id) {
                marker = markers[i];
            }
        }
        var content = "<div><b>" + place.name + "</b></div><br><div>" + place.vicinity + "</div><br><div>Rating: " + place.rating + "</div><br>" + foursquare;
        infowindow.setContent(content);
        infowindow.open(map, marker);

        map.panTo(marker.position);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            marker.setAnimation(null);
        }, 1450);
    }, 300);
}

function getFoursquare(point) {
    // foursquare api url
    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=NONCPLRWZOOGK1CXCJUTJM2J5KWAXNW1F2135GWMLHQIL2LB&client_secret=5GYN3U3I0TM3JLPDB5P4DQW2X0NZNJCL1O2AXTFIJ0Y2ICE5&v=20170111&ll=47.680677,-122.323503&query=\'' + point['name'] + '\'&limit=10';

    // retrievies the JSON from the foursquare URL and provides the phone number and twitter account, if available of each location
    $.getJSON(foursquareURL).done(function (response) {
        foursquare = '';
        var venue = response.response.venues[0];

        //functions normally if data is retrieved about the location but, if no data is available, runs the else statement
        if (venue) {
            var phone = venue.contact.formattedPhone;
            if (phone !== undefined) {
                foursquare += 'Phone: ' + phone + '<br>';
            } else {
                foursquare += 'Phone: Not Available' + '<br> ';
            }

            var twitter = venue.contact.twitter;
            if (twitter !== undefined) {
                foursquare += '<br>' + 'Twitter: @' + twitter;
            }
            else {
                foursquare += '<br>' + 'Twitter: Not Available' + ' ';
            }
        }
        else {
            foursquare += 'Foursquare unavailable';
        }

        //alerts user of error if foursquare API fails
    }).fail(function (e) {
        alert('Foursquare API is not working. Error: ' + e);
    });
}


//Query through the different locations from nav bar with knockout.js
    //only display locations and nav elements that match query result
var viewModel = {
    query: ko.observable('')
};

viewModel.locations = ko.dependentObservable(function() {
    var self = this;
    var search = self.query().toLowerCase();
    return ko.utils.arrayFilter(locations, function(marker) {
    if (marker.name.toLowerCase().indexOf(search) >= 0) {
            marker.boolTest = true;
            return marker.visible(true);
        } else {
            marker.boolTest = false;
            setAllMap();
            return marker.visible(false);
        }
    });
}, viewModel);

ko.applyBindings(viewModel);

//show $ hide locations in sync with nav
$("#input").keyup(function() {
setAllMap();
});

