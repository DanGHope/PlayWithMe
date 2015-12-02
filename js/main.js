var map, myLayer;
var curEvent;
var new_lat, new_lng;
var userID;

$(document).ready(function() {
    updateMap();
    loadMap();
    userID = -1;
    loadFacebook();

    $("#createGameButton").click(function() {
        var spt = $("#sportSelector").val();
        var dsc = $("#sportDescription").val();
        var date = $("#sportDate").val();
        console.log("DATE: "+date);
        var name = $("#sportName").val();
        createEvent(name, date, spt, dsc, new_lat, new_lng, userID);
        $("#createGameForm").modal("toggle");
    });

    $(".form_datetime").datetimepicker({
        format: "dd MM yyyy - hh:ii"
    });

});

function updateMap() {
    //Request an updated events geojson
    $.ajax({
        type: "GET",
        url: 'php/update_events.php',
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

function createEvent(name, date, sport, desc, lat, lng, userid) {
    $.ajax({
        type: "POST",
        url: "php/add_event.php",
        data: {
            name: name,
            date: date,
            sport: sport,
            desc: desc,
            lat: lat,
            lng: lng,
            owner: userid
        },
        success: function(data) {
            console.log("Success: " + data);
            updateMap();
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
        console.log(userID);
        if (userID != -1) {
            console.log(e.containerPoint.toString() + ', ' + e.latlng.toString());
            $("#createGameForm").modal("toggle");
            new_lat = e.latlng.lat;
            new_lng = e.latlng.lng;
        } else {
            $("#loginForm").modal("toggle");
        }
    });

    map.on('move', function() {
        updateList();
    });


}
