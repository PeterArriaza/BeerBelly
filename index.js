'use strict';

var map;

// get city and state values from user search for api call; clear form
function watchSubmit() {
	initMap();	
  $('.city-state-query').submit(function( event ) {
    event.preventDefault();
    let city = $('.city').val();
    let state = $('.state').val();
    $('.city').val("");
    $('.state').val("");
    getBeerData(city, state);
  });
}

// make api call with user's values
function getBeerData(city, state) {
	console.log(city);
	console.log(state);
	let api_url = "http://beermapping.com/webservice/loccity/b79009d86aaf5ff13096058e40ac0780/"+city+","+state+"&s=json";
	console.log(api_url);
    const settings = {
    url: api_url,
    method: 'GET',  
    };
  $.ajax(settings)
   /* if the call is successful (status 200 OK) show results */
            .done(function (result) {
                /* if the results are meeningful, we can just console.log them */
                console.log(result);
                let mapCenter = city+','+state;
                positionMap(mapCenter, map, result);
            })
            /* if the call is NOT successful show errors */
            .fail(function (jqXHR, error, errorThrown) {
                console.log(jqXHR);
                console.log(error);
                console.log(errorThrown);
            });
  }

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: {lat: 39.9526, lng: -75.1652},
      mapTypeId: 'roadmap'
    });
}

function positionMap(address, resultsMap, locations) {
	console.log(resultsMap, address, locations);
	var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address': address}, function(results, status) {
      if (status === 'OK') {
        resultsMap.setCenter(results[0].geometry.location);
        // var marker = new google.maps.Marker({
        //   map: resultsMap,
        //   position: results[0].geometry.location
        // });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

// display makers on google map
function displayMarkers() {
    // plot markers on map using coordinates from getAddresses
    
}


$(watchSubmit);