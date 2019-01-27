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
    var api_url = "https://beermapping.com/webservice/loccity/b79009d86aaf5ff13096058e40ac0780/" + city + "," + state + "&s=json";
    var settings = {
        url: api_url,
        method: 'GET',
    };
    $.ajax(settings)
        // if the call is successful (status 200 OK) show results 
        .done(function (result) {
            // if the results are meeningful, we can just console.log them 
            var mapCenter = city + ',' + state;
            positionMap(mapCenter, map, result, index);
        })
        // if the call is NOT successful show errors 
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
        zoom: 11,
        center: {
            lat: 39.9526,
            lng: -75.1652
        },
        mapTypeId: 'roadmap'
    });
}

// center map on search city, state
function positionMap(address, resultsMap, locations, index) {
    console.log(resultsMap);
    // test if resultsMap is valid  
    if (resultsMap.length === 0) {
        var geocoder = new google.maps.Geocoder();
        console.log(locations);
        geocoder.geocode({
            'address': address
        }, function (results, status) {
            if (status === 'OK') {
                resultsMap.setCenter(results[0].geometry.location);
                sliceLocations(resultsMap, locations, index);
            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }

        });
    } else {
        alert('Geolocation unsuccessful');
    }
}

// split locations into arrays that do not cause query limit error in google geocoder
function sliceLocations(map, locations, index) {
    // google maps geocoder api can only handle 10 calls in quick succession
    let size = 10;
    var points = [];
    console.log(points);
    console.log(index, size, (parseInt(index) + parseInt(size)));
    let j = 0;

    // breakup api results object into arrays with length 10
    for (let i = parseInt(index); i < (parseInt(index) + parseInt(size)); i++) {
        console.log(i);
        //        points.push(locations[i]);
        points[j] = locations[i];
        j++
    }

    // remove beer graphic 
    $('#results').empty();

    // create values that can be passed to subsequent functions 
    $('#buttonDisplay').empty();
    $('#buttonDisplay').append(`
<form id="valueForm">
<input id="index" type="hidden" value="${(parseInt(index)+10)}"/>
<input id="city" type="hidden" value="${points[0].city}"/>
<input id="state" type="hidden" value="${points[0].state}"/>
<button id="nextButton" class="button">Load Next 10 Results</button>
</form>`);
    $('#buttonDisplay').addClass('hidden');

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

    // iterate through locations and get coordinates for each index of array
    for (let j = 0; j < 10; j++) {
        geocoder.geocode({
            'address': points[j].street + ', ' + points[j].city + ', ' + points[j].state +
                ', ' + points[j].zip
        }, function (results, status) {

            if (status === 'OK') {
                // create information shown when user clicks on marker
                var contentString = `<div class='content'>
<h1>${points[j].name}</h1>
<h2>${points[j].street + ', ' + points[j].city + ', ' + points[j].state +
            ', ' + points[j].zip}</h2>
</div>`;
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });

                // place marker at location
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });

                // handle clicks on marker
                marker.addListener('click', function () {
                    infowindow.open(map, marker)
                });
                map.addListener("click", function (event) {
                    infowindow.close();
                });

                // show search results
                $('#results').append(`<div class = "searchResult"><p class = "locationName">${points[j].name}</p>
<p>${points[j].street + ', ' + points[j].city + ', ' + points[j].state +
            ', ' + points[j].zip}</p> 
</div>`);
            } else {
                console.log('error');
            }

        });
    }

    // show button 5 seconds after results display to search for the next 10 locations
    setTimeout(function () {
        $('#buttonDisplay').removeClass('hidden');
    }, 5000);
    $('#search').html(`<button id='newSearch' class='button'>Start New Search</button>`);
}

// refresh page to start new search
$(document).on('click', '#newSearch', function () {
    location.reload();
});


$(watchSubmit);
