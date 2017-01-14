var map;


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

    setMarkers(locations);

    setAllMap();

}

//Determines if locations should be visible
//This function is passed in the knockout viewModel function
function setAllMap() {
  for (var i = 0; i < locations.length; i++) {
    if(locations[i].boolTest === true) {
    locations[i].holdMarker.setMap(map);
    } else {
    locations[i].holdMarker.setMap(null);
    }
  }
}

//Information about the different locations
//Provides information for the locations
var locations = [
    {
    name: "The Thomas Jefferson Memorial",
    lat: 47.680433,
    lng: -122.325661,
    // id: "nav0",
    visible: ko.observable(true),
    boolTest: true
    }
];




function setMarkers(location) {

    for(i=0; i<location.length; i++) {
        location[i].holdMarker = new google.maps.Marker({
          position: new google.maps.LatLng(location[i].lat, location[i].lng),
          map: map,
          name: location[i].name
        });

        

        //Binds infoWindow content to each marker
        location[i].contentString = '<hr style="margin-bottom: 5px"><strong>' +
                                    location[i].name + '</strong>';

        var infowindow = new google.maps.InfoWindow({
            content: locations[i].contentString
        });

        //Click marker to view infoWindow
            //zoom in and center location on click
        new google.maps.event.addListener(location[i].holdMarker, 'click', (function(marker, i) {
          return function() {
            infowindow.setContent(location[i].contentString);
            infowindow.open(map,this);
            var windowWidth = $(window).width();
            if(windowWidth <= 1080) {
                map.setZoom(14);
            } else if(windowWidth > 1080) {
                map.setZoom(16);
            }
            map.setCenter(marker.getPosition());
            location[i].picBoolTest = true;
          };
        })(location[i].holdMarker, i));

        //Click nav element to view infoWindow
            //zoom in and center location on click
        // var searchNav = $('#nav' + i);
        // searchNav.click((function(marker, i) {
        //   return function() {
        //     infowindow.setContent(location[i].contentString);
        //     infowindow.open(map,marker);
        //     map.setZoom(16);
        //     map.setCenter(marker.getPosition());
        //     location[i].picBoolTest = true;
        //   };
        // })(location[i].holdMarker, i));
    }
}

//Query through the different locations from nav bar with knockout.js
    //only display locations and nav elements that match query result
var viewModel = {
    query: ko.observable(''),
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

