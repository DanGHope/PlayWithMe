var map, myLayer;
var curEvent;

$(document).ready(function() {
    updateMap();
    loadMap();

    function statusChangeCallback(response) {
        console.log('statusChangeCallback');
        console.log(response);

        FB.api(
            "/me",
            function(response) {
                if (response && !response.error) {
                    console.log(response);
                }
            }
        );

        // The response object is returned with a status field that lets the
        // app know the current login status of the person.
        // Full docs on the response object can be found in the documentation
        // for FB.getLoginStatus().
        if (response.status === 'connected') {
            // Logged into your app and Facebook.
            testAPI();
        } else if (response.status === 'not_authorized') {
            // The person is logged into Facebook, but not your app.
            document.getElementById('status').innerHTML = 'Please log ' +
                'into this app.';
        } else {
            // The person is not logged into Facebook, so we're not sure if
            // they are logged into this app or not.
            document.getElementById('status').innerHTML = 'Please log ' +
                'into Facebook.';
        }
    }

    function checkLoginState() {
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    }

    window.fbAsyncInit = function() {
        FB.init({
            appId: '1026885190696711',
            cookie: true, // enable cookies to allow the server to access
            // the session
            xfbml: true, // parse social plugins on this page
            version: 'v2.2' // use version 2.2
        });


        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    };

    // Load the SDK asynchronously
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    function testAPI() {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
            console.log('Successful login for: ' + response.name);
            document.getElementById('status').innerHTML =
                'Thanks for logging in, ' + response.name + '!';
        });
    }

});

function updateList() {
    $("#game-list").remove();
    $("<div id='game-list'></div>").insertAfter('#game-header');
    bounds = map.getBounds();
    myLayer.eachLayer(function(e) {
        if (bounds.contains(e.getLatLng())) {
            var title = e.feature.properties.event;
            if (curEvent) {
                if (e.feature.properties.id == curEvent.id) {
                    title = "<b>" + e.feature.properties.event + "</b>";
                } else {
                    title = e.feature.properties.event;
                }
            }

            var newEvent = $('<div class="panel panel-default"><div class="panel-heading"><a href="#">' + title + '</a></div></div><p>' + e.feature.properties.description + '</p><hr>');
            $("#game-list").append(newEvent);
            if (curEvent) {
                if (e.feature.properties.id == curEvent.id) {
                    var container=$("#left");
                    var scrollTo=newEvent;
                    container.animate({
                        scrollTop: scrollTo.offset().top - container.offset().top - container.scrollTop()
                    });
                }
            }
        }
    });
}

function updateMap() {
    //Request an updated events geojson
    $.ajax({
        type: "GET",
        url: 'php/update_events.php',
        success: function() {
            myLayer.loadURL("php/phpjson.geojson");
        }
    });
}

function loadMap() {

    L.mapbox.accessToken = 'pk.eyJ1IjoiZGFuZ2hvcGUiLCJhIjoiY2loY2M0b3drMDFqbnVlbWF3aGJvYTJ0ZyJ9.NrOUOv9u0AkxEhptyBVexw';

    map = L.mapbox.map('map', 'mapbox.streets');
    myLayer = L.mapbox.featureLayer().addTo(map);

    var geolocate = $("#geolocate")[0];

    if (!navigator.geolocation) {
        geolocate.innerHTML = 'Geolocation is not available';
    } else {
        map.locate();
    }

    map.on('locationfound', function(e) {
        map.fitBounds(e.bounds);
        map.setZoom(14);
        geolocate.parentNode.removeChild(geolocate);
        myLayer.loadURL("php/phpjson.geojson");
    });

    map.on('locationerror', function() {
        geolocate.innerHTML = 'Position could not be found';
    });

    myLayer.on('click', function(e) {
        curEvent = e.layer.feature.properties;
        updateList();
    });

    map.on('click', function(e) {
        console.log(e.containerPoint.toString() + ', ' + e.latlng.toString());
        $.ajax({
            type: "POST",
            url: "php/add_event.php",
            data: {
                lat: e.latlng.lat,
                lng: e.latlng.lng
            },
            success: function(data) {
                console.log("Success: " + data);
                updateMap();
            }
        });
    });

    map.on('move', function() {
        updateList();
    });


}
