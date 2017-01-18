var map;
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

    //callback function checks to see if Places API is functioning properly.
    //If it isn't, returns error and notifies user
    //Otherwise it creates 10 markers

    function callback(results, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
            console.error(status);
            alert("Google Maps was unable to load. Please check your internet connection and try re-loading the page.");


        } else {
            for (var i = 0; i < 10; i++) {
                var place = results[i];
                addLocation(place);
                createMarker(place);
            }
        }
    }


    placeMaps();

}

    //Determines if locations should be visible
    //This function is passed in the knockout viewModel function
    function placeMaps() {
        for (var i = 0; i < viewModel.places().length; i++) {
            if (viewModel.places()[i].test === true) {
                markers[i].setVisible(true);
            } else {
                markers[i].setVisible(false);
            }
        }
    }

//this function pushes the generated locations from the Places API into the array locations
function addLocation(place) {

    var location = {};
    location.place_id = place.place_id;
    location.position = place.geometry.location.toString();
    location.name = place.name;
    location.vicinity = place.vicinity;
    location.rating = place.rating;
    location.visible = ko.observable(true);
    location.test = true;
    viewModel.places.push(location);
    console.log("pushed: " + location);
}

//similar to the addLocation function but pushes corresponding markers to the map

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

//clickMarker function waits for the Foursquare API to run then produces an infowindow above the desired marker on the
// map with relevant information
function clickMarker(place) {
    getFoursquare(place).always(function () {
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
        }, 1400);
    });

}

function getFoursquare(point) {
    // foursquare api url
    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=NONCPLRWZOOGK1CXCJUTJM2J5KWAXNW1F2135GWMLHQIL2LB&client_secret=5GYN3U3I0TM3JLPDB5P4DQW2X0NZNJCL1O2AXTFIJ0Y2ICE5&v=20170111&ll=47.680677,-122.323503&query=\'' + point['name'] + '\'&limit=10';

    // returns the JSON from the foursquare URL and provides the phone number and twitter account, if available of each location
    return $.getJSON(foursquareURL).done(function (response) {
        foursquare = '<strong>Foursquare Info: </strong><br>';
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


//the viewModel searches through the locations array and displays only the elements matching the search both in the
// list and on the map
var viewModel = {
    filter: ko.observable(''),
    places: ko.observableArray(),
    clear: function(){
        this.filter(' ');
    }
};


//the locations property of the viewModel is an array that filters the global array locations and sets the visibility
// on the map to true if it matches the criteria of the search

viewModel.filteredItems = ko.computed(function() {
    var self = this;
    var filter = self.filter().toLowerCase();
    if (!filter) {
        return self.places();
    } else {
        return ko.utils.arrayFilter(self.places(), function(place) {
            if (place.name.toLowerCase().indexOf(filter) >= 0) {
                place.test = true;
                return place.visible(true);
            } else {
                place.test = false;
                placeMaps();
                return place.visible(false);
            }
        }, filter);
    }
}, viewModel);

ko.applyBindings(viewModel);

//shows and hides markers in sync with search.
//also closes infowindows left open before searching
$("#input").keyup(function () {
    infowindow.close();
    placeMaps();
});

