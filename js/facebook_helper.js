/*
 * PlayWithMe - An ADHOC Sports Web Application
 *
 * Copyright (C) 2015, Dan Hope, Matthew Militante
 * All rights reserved.
 *
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
// Load Facebook Javascript SDK
function loadFacebook() {
    window.fbAsyncInit = function() {
        FB.init({
            appId: '1026885190696711',
            cookie: true, // enable cookies to allow the server to access the session
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

// Hide components on logout
function loggedOut() {
    $("#userProfile").hide("fast");
    $("#loginButton").show("fast");
    $("#status").text('Please log into Facebook.');
}

// Display components on login
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

// Get user's display picture
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

// If user is logged in, fetch data
function logAPIResponse() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
        console.log('Successful login for: ' + response.name);
        getDisplayPicture(response.id);
        $("#status").text('Thanks for logging in, ' + response.name + '!');
        loggedIn(response.name);
        userID = response.id;
        name = response.name;
        $.ajax({
            type: "POST",
            url: "php/add_person.php",
            data: {
                userid: userID,
                name: name
            },
            success: function(data) {
                console.log("Success: " + data);
                updateList();
            }
        });
    });
}

// Call back function for loging
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

// Check login state
function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}
