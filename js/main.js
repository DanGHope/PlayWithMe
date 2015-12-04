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
        console.log("DATE: " + date);
        var name = $("#sportName").val();
        var players = $("#sportPlayers").val();
        createEvent(name, date, spt, dsc, new_lat, new_lng, userID, players);
        $("#createGameForm").modal("toggle");
    });

    $("#myGamesButton").click(function() {
        updateMyGames();
    });

    $(".form_datetime").datetimepicker({
        format: "yy-mm-dd hh:mm:00"
    });
});

function createGameItemOnList(title, eventID, hostID, firstName, sport, date, playerCount, description){
    var submitBtn = $('<button type="submit" class="btn btn-success pull-right" onclick="joinEvent(' + eventID + ')" >Join Game</button>');
    
    var listItem = $('<div class="panel panel-default">');
    var title = $('<div class="panel-heading"><a href="#">'+ title +'</a></div>');
    listItem.append(title);

    var body = $('<div class="panel-body">');
    var bodyRow = $('<div class="row">');
    body.append(bodyRow);
    listItem.append(body);

    var userInfo = $('<div class="col-md-3">');
    var userDetails = $('<h5>Host:</h5><img src="http://graph.facebook.com/'+ hostID +'/picture?type=square"><p>' + firstName + '</p>')
    userInfo.append(userDetails);
    bodyRow.append(userInfo);

    var gameInfo = $('<div class="col-md-9">');
    var eventDetails = $('<div class="row"><div class="col-md-3"><label for="sport">Sport:</label><p>' + sport + '</p></div><div class="col-md-4"><label for="eventDate">Date</label><p>' + date + '</p></div><div class="col-md-2"><label for="playerCount">Players:</label><p>' + playerCount + '</p></div></div>');
    gameInfo.append(eventDetails);

    var eventDescription = $('<div class="row"><div class="col-md-3"><label for="description">Description:</label></div><div class="col-md-4"></div><div class="col-md-2"></div></div><div class="row"><div class="col-md-9"><p align="left">' + description + '</p></div></div>')
    gameInfo.append(eventDescription);

    bodyRow.append(gameInfo);
    body.append(submitBtn);
    $('#game-list').append(listItem);
}

function createMyGamesForm(id, title, owner, sport, desc, date, people) {
    var leaveBtn = $('<a id="leaveGameBtn" class="btn btn-warning pull-right" onclick="leaveEvent(' + id + ')" href="#"><i class="fa fa-user-times fa-lg"></i> Leave</a>');
    var deleteBtn = $('<a id="deleteGameBtn" class="btn btn-danger pull-right" onclick="deleteEvent(' + id + ')" href="#"><i class="fa fa-trash-o fa-lg"></i> Delete</a>');
    var m = $('<li class="list-group-item"></li>');
    var m1 = $('<div class="clearfix"></div>');
    m.append(m1);
    var t0 = $('<h4 class="panel-title pull-left"><a id="#gameTitle" data-toggle="collapse" aria-expanded="false" data-target="#collapse' + id + '" href="#collapseOne"></a></h4>');
    var t = $('<a id="#gameTitle" data-toggle="collapse" aria-expanded="false" data-target="#collapse' + id + '" href="#collapseOne">' + title + '</a>');
    t0.append(t);
    m1.append(t0);
    if (owner) {
        m1.append(deleteBtn);
    } else {
        m1.append(leaveBtn);
    }
    var m2 = $('<div id="collapse' + id + '" aria-expanded="false" class="panel-collapse collapse"></div>');
    m.append(m2);
    var b = $('<div class="panel-body">');
    m2.append(b);
    var c0 = $('<div class="panel panel-default"><div class="panel-body"><p class="pull-left">Sport: ' + sport + '</p></div></div>');
    b.append(c0);
    var c1 = $('<div class="panel panel-default"><div class="panel-body"><p class="pull-left">Description: ' + desc + '</p></div></div>');
    b.append(c1);
    var c2 = $('<div class="panel panel-default"><div class="panel-body"><p class="pull-left">Date/Time: ' + date + '</p></div></div>');
    b.append(c2);
    var c3 = $('<div class="panel panel-default"><div class="panel-body"><p class="pull-left">Participants: ' + people + '</p></div></div>');
    b.append(c3);
    $("#myGamesList").append(m);
}
//title, owner, sport, desc, date, people
function updateMyGames() {
    $("#myGamesList").empty();
    myLayer.eachLayer(function(e) {
        var i = e.feature.properties.id;
        var t = e.feature.properties.title;
        var s = e.feature.properties.event;
        var de = e.feature.properties.description;
        var da = e.feature.properties.date;
        var p = e.feature.people.length + " / " + e.feature.properties.players;
        if (e.feature.properties.owner == userID) {
            createMyGamesForm(i, t, 1, s, de, da, p);
        } else if ($.inArray(userID, e.feature.people) >= 0) {
            createMyGamesForm(i, t, 0, s, de, da, p);
        }
    });

}

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
            var title = e.feature.properties.title;
            if (curEvent) {
                if (e.feature.properties.id == curEvent.id) {
                    title = "<b>" + e.feature.properties.title + "</b>";
                } else {
                    title = e.feature.properties.title;
                }
            }
            var o = e.feature.properties.owner;
            var i = e.feature.properties.id;
            var t = e.feature.properties.title;
            var s = e.feature.properties.event;
            var de = e.feature.properties.description;
            var da = e.feature.properties.date;
            var p = e.feature.people.length + " / " + e.feature.properties.players;
            var n = getName(o);

            /*
             *createGameItemOnList(title, id, firstName, sport, date, playerCount, description){
             */
            $("#game-list").append(createGameItemOnList(t, i, o, n, s, da, p, de));
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

function createEvent(name, date, sport, desc, lat, lng, userid, players) {
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
            owner: userid,
            players: players
        },
        success: function(data) {
            console.log("Success: " + data);
            updateMap();
        }
    });
}

function joinEvent(id) {
    $.ajax({
        type: "POST",
        url: "php/join_event.php",
        data: {
            userID: userID,
            eventID: id
        },
        success: function(data) {
            console.log("Success: " + data);
        }
    });
}

function leaveEvent(id) {
    $.ajax({
        type: "POST",
        url: "php/leave_event.php",
        data: {
            userID: userID,
            eventID: id
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
        console.log(e.layer.feature.properties.id);
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
