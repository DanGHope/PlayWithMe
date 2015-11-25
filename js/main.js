var map;

$(document).ready(function() {
    loadMap();

    // Change Modal to Sign Up form
    $("#createAccount").click(function(){
        $(".modal-title").text('Create New Account');
        $("#loginButton").prop('value', 'Create');
    });

    $(".close").click(function(){
        $(".modal-title").text('Login');
        $("#loginButton").prop('value', 'Login');
    });

});


function loadMap() {

    L.mapbox.accessToken = 'pk.eyJ1IjoiZGFuZ2hvcGUiLCJhIjoiY2loY2M0b3drMDFqbnVlbWF3aGJvYTJ0ZyJ9.NrOUOv9u0AkxEhptyBVexw';

    var map = L.mapbox.map('map', 'mapbox.streets');
    var myLayer = L.mapbox.featureLayer().addTo(map);

    var geolocate = $("#geolocate")[0];

    if (!navigator.geolocation) {
        geolocate.innerHTML = 'Geolocation is not available';
    } else {
        map.locate();
    }

    map.on('locationfound', function(e) {
        map.fitBounds(e.bounds);

        myLayer.setGeoJSON({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [e.latlng.lng, e.latlng.lat]
            },
            properties: {
                'title': 'Here I am!',
                'marker-color': '#ff8888',
                'marker-symbol': 'star'
            }
        });

        geolocate.parentNode.removeChild(geolocate);
    });

    map.on('locationerror', function() {
        geolocate.innerHTML = 'Position could not be found';
    });
}
