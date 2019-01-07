'use strict';

var map;

// get city and state values from user search for api call; clear form
function watchSubmit() {
    $('.city-state-query').submit(function (event) {
        event.preventDefault();
        var city = $('.city').val();
        var state = $('.state').val();
        $('.city').val("");
        $('.state').val("");
        getBeerData(city, state);
    });
}

// make api call with user's values
function getBeerData(city, state) {
    var api_url = "http://beermapping.com/webservice/loccity/b79009d86aaf5ff13096058e40ac0780/" + city + "," + state + "&s=json";
    var settings = {
        url: api_url,
        method: 'GET',
    };
    $.ajax(settings)
        /* if the call is successful (status 200 OK) show results */
        .done(function (result) {
            /* if the results are meeningful, we can just console.log them */
            var mapCenter = city + ',' + state;
            positionMap(mapCenter, map, result);
        })
        /* if the call is NOT successful show errors */
        .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);
        });
}

// initialize google map centered on Philadelphia
// function is called in the callback from the api script src in index.html
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {
            lat: 39.9526,
            lng: -75.1652
        },
        mapTypeId: 'roadmap'
    });
}

function positionMap(address, resultsMap, locations) {
    var geocoder = new google.maps.Geocoder();
    console.log(locations);
    geocoder.geocode({
        'address': address
    }, function (results, status) {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            displayMarkers(resultsMap, locations);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// display makers on google map
function displayMarkers(map, markerPoints) {
    // google maps geocoder api can only handle 10 calls in quick succession
    let size = 10;
    var points = [];
    // breakup api results object into arrays with length 10
    for (let i = 0; i < markerPoints.length; i += size) {
        points.push(markerPoints.slice(i, i + size));
    }
    console.log(points);
    var geocoder = new google.maps.Geocoder();
    let i = 0;
    for (let j = 0; j < 10; j++) {
        //            console.log(markerPoints[i].street + ', ' + markerPoints[i].city + ', ' + markerPoints[i].state +
        //                ', ' + markerPoints[i].zip);
        geocoder.geocode({
            'address': points[i][j].street + ', ' + points[i][j].city + ', ' + points[i][j].state +
                ', ' + points[i][j].zip
        }, function (results, status) {
            if (status === 'OK') {
                console.log(points[i][j].name);
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
                // remove beer graphic and display search results
                $('#results').empty();

                // add button to results div to load next 10
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
                console.log('error');
            }

        });
    }
}


$(watchSubmit);
