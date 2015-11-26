var map;

$(document).ready(function() {
    updateMap();
    loadMap();
    loadFacebook();
});

function updateMap(){
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
            appId      : '1026885190696711',
            cookie     : true,  // enable cookies to allow the server to access
                            // the session
            xfbml      : true,  // parse social plugins on this page
            version    : 'v2.2' // use version 2.2
        });

        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    };

    // Load the SDK asynchronously
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
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
    $("#logoutButton").click(function(){
        loggedOut();
        FB.logout(function(response){
            console.log(response.status);
        });
    });
}

function logAPIResponse() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
        console.log('Successful login for: ' + response.name);
        $("#status").text('Thanks for logging in, ' + response.name + '!');
        loggedIn(response.name)
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
        map.setZoom(12);
        geolocate.parentNode.removeChild(geolocate);
        myLayer.loadURL("php/phpjson.geojson");
    });

    map.on('locationerror', function() {
        geolocate.innerHTML = 'Position could not be found';
    });
}
