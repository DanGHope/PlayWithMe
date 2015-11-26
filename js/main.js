var map, myLayer;
var curEvent;

$(document).ready(function() {
    updateMap();
    loadMap();
    loadFacebook();
});

function updateMap() {
    //Request an updated events geojson
    $.ajax({
        type: "GET",
        url: 'php/update_events.php',
    });
}

// Load Facebook Javascript SDK
function loadFacebook() {
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

}

function loggedOut() {
    $("#userProfile").hide("fast");
    $("#loginButton").show("fast");
    $("#status").text('Please log into Facebook.');
}

function loggedIn(username) {
    // Hide Login Button
    $("#loginButton").hide("fast");
    $("#userProfile").show("fast");
    $("#userName").text(username);
    $("#logoutButton").click(function() {
        loggedOut();
        FB.logout(function(response) {
            console.log(response.status);
        });
    });
}

function getDisplayPicture(userId) {
    FB.api(
        "/" + userId + "/picture",
        function(response) {
            $("#userName").prepend('<img id="userPicture" width="42" height="42">');
            if (response && !response.error) {
                userProfilePicture = response.data.url;
                $("#userPicture").attr("src", userProfilePicture);
            }
        }
    );
}

function logAPIResponse() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
        console.log('Successful login for: ' + response.name);
        getDisplayPicture(response.id);
        $("#status").text('Thanks for logging in, ' + response.name + '!');
        loggedIn(response.name);
    });
}

function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);

    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        logAPIResponse();
    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        console.log('Please log into this app.');
    } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        loggedOut();

    }
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

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
                    var container = $("#left");
                    var scrollTo = newEvent;
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
