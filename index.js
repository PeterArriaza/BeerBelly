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
function getBeerData(city, state, index = 0) {
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
            positionMap(mapCenter, map, result, index);
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

// center map on search city, state
function positionMap(address, resultsMap, locations, index) {
    var geocoder = new google.maps.Geocoder();
    console.log(locations);
    geocoder.geocode({
        'address': address
    }, function (results, status) {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            sliceLocations(resultsMap, locations, index);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// split locations into arrays that do not cause query limit error in google geocoder
function sliceLocations(map, locations, index) {
    // google maps geocoder api can only handle 10 calls in quick succession
    let size = 10;
    var points = [];
    // breakup api results object into arrays with length 10
    for (let i = index; i < locations.length; i += size) {
        points.push(locations.slice(i, i + size));
    }
    console.log(points);
    //    displayMarkers(map, points);
    // remove beer graphic 
    $('#results').empty();
    console.log(points[0][0].city);
    // create values that can be passed to subsequent functions 
    $('#buttonDisplay').append(`
<form>
<input id="index" type="hidden" value="${(index+10)}"/>
<input id="city" type="hidden" value="${points[0][0].city}"/>
<input id="state" type="hidden" value="${points[0][0].state}"/>
<button id="nextButton" class="hidden">Load Next 10 Results</button>
</form>`);
    displayMarkers(map, points, index);
}

// load next 10 search results on click 
$(document).on('click', '#nextButton', function (event) {
    event.preventDefault();
    let indexValue = $(this).parent().find('#index').val();
    let cityVal = $(this).parent().find('#city').val();
    let stateVal = $(this).parent().find('#state').val();

    getBeerData(cityVal, stateVal, indexValue);

});

// display makers on google map
function displayMarkers(map, points, index) {
    var geocoder = new google.maps.Geocoder();
    let i = 0;

    for (let j = 0; j < 10; j++) {
        console.log(points[i][j].street + ', ' + points[i][j].city + ', ' + points[i][j].state +
            ', ' + points[i][j].zip);
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

                // show search results
                $('#results').append(`<div class = "searchResult"><p class = "locationName">${points[i][j].name}</p>
<p>${points[i][j].street + ', ' + points[i][j].city + ', ' + points[i][j].state +
            ', ' + points[i][j].zip}</p> 
</div>`)
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
                console.log('error');
            }

        });
    }
    // show button after results display to search for the next 10 locations
    $('#nextButton').removeClass('hidden');
}


$(watchSubmit);
