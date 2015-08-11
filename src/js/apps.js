/* apps.js
 * Written by	: Mellisa Octaviani
 * Created on	: 7 Aug 2015
 *
 * This file contains the app's model (points) and view model
 * to handle app logic such as to retrieve 3rd party data, update and render map components 
 */
'use strict';
// Data for places in neighborhood
// category: yellow (sport), green (entertainment), purple (workshop),blue (retail), red (restaurant)

var initialMarker = [{
    id: 0,
    name: 'LA Fitness',
    latitude: 33.337160,
    longitude: -111.877526,
    category: 'yellow'
}, {
    id: 1,
    name: 'Harkins Theatres',
    latitude: 33.298957,
    longitude: -111.900029,
    category: 'green'
}, {
    id: 2,
    name: 'TechShop',
    latitude: 33.299978,
    longitude: -111.838311,
    category: 'purple'
}, {
    id: 3,
    name: 'Walmart',
    latitude: 33.337525,
    longitude: -111.854406,
    category: 'blue'
}, {
    id: 4,
    name: 'Chandler Center for the Arts',
    latitude: 33.307387,
    longitude: -111.842455,
    category: 'green'
}, {
    id: 5,
    name: 'PGA Tour Superstore',
    latitude: 33.336236,
    longitude: -111.839142,
    category: 'yellow'
}, {
    id: 6,
    name: 'Ninja Japanese Restaurant',
    latitude: 33.339919,
    longitude: -111.859536,
    category: 'red'
}, {
    id: 7,
    name: "Carl's Jr.",
    latitude: 33.333270,
    longitude: -111.859487,
    category: 'red'
}, {
    id: 8,
    name: 'Taco Bell',
    latitude: 33.335453,
    longitude: -111.859935,
    category: 'red'
}, {
    id: 9,
    name: 'Subway (restaurant)',
    latitude: 33.313960,
    longitude: -111.841070,
    category: 'red'
}, {
    id: 10,
    name: 'Walgreens',
    latitude: 33.334514,
    longitude: -111.875665,
    category: 'blue'
}, {
    id: 11,
    name: "Lee Lee Int'l Supermarket",
    latitude: 33.336151,
    longitude: -111.874338,
    category: 'blue'
}];

var infowindow; // only allow one info window at one time

//---------------------Model------------------------------
// point object contains name, id, lat, long, and marker
var Point = function(data) {
    this.name = data.name;
    this.id = data.id;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.category = data.category;
    this.marker = null;
};
var map;


// -----------------ViewModel----------------------------

var ViewModel = function() {
    var self = this;
    this.markerList = ko.observableArray();

    // generate map points based on predefined data
    initialMarker.forEach(function(markerItem) {
        var p = new Point(markerItem);

        //generate marker based on item coordinate
        var pos = new google.maps.LatLng(markerItem.latitude, markerItem.longitude);
        var marker = new google.maps.Marker({
            position: pos,
            title: markerItem.name,
            map: map,
            icon: 'http://maps.google.com/mapfiles/ms/icons/' + markerItem.category + '-dot.png'
        });

        //click event handler for marker
        google.maps.event.addListener(marker, 'click', function() {
            setCurrent(p, marker);
        });
        p.marker = marker;
        self.markerList.push(p);
    });

    self.currentMarker = ko.observable(self.markerList()[0]);

    // This function is used to load information and animate selected location
    function setCurrent(clickedMarker, marker) {
        self.currentMarker(clickedMarker);
        centerMarker(marker);
        loadWiki(clickedMarker);
        generateInfo(marker, clickedMarker.name, clickedMarker.latitude, clickedMarker.longitude);
        animateMarker(marker);
    }

    // This function is used to center the map on the selected marker
    function centerMarker(marker) {
        var latLng = marker.getPosition(); // returns LatLng object
        map.panTo(latLng); // setCenter takes a LatLng object
    }

    // This function receives click event input from name list.
    this.setMarker = function(clickedMarker) {
        setCurrent(clickedMarker, clickedMarker.marker);
    };

    // This function is to load address from Foursquare and then display it in windows info.
    function generateInfo(marker, name, latitude, longitude) {
        var foursquareUrl = "";
        var location = [];

        foursquareUrl = 'https://api.foursquare.com/v2/venues/search' +
            '?client_id=2BIWS0KFSP1W12ARXFHNA20WHNGY0NMOAD3AFYM1ZGCFCF32' +
            '&client_secret=I2F4TTJ0HJOIAO2GCPP0T2NJBMMHFVMCLAQ4HIHF5U1JZCNG' +
            '&v=20130815' +
            '&m=foursquare' +
            '&ll=' + latitude + ',' + longitude +
            '&query=' + name +
            '&intent=match';

        //This segment handles generic ajax error
        $.ajaxSetup({
            "error": function() {
                alert("error");
            }
        });

        $.ajax({
            url: foursquareUrl,
            dataType: "jsonp",
            // jsonp: "callback",
            success: function(data) {
                if (data.response.venues.length > 0) {
                    var item = data.response.venues[0];

                    location = {
                        lat: item.location.lat,
                        lng: item.location.lng,
                        name: item.name,
                        loc: item.location.address + " " + item.location.city + ", " + item.location.state + " " + item.location.postalCode
                    };
                    generateInfoWindow(marker, location.name, location.loc);
                } else {
                    generateInfoWindow(marker, name, '');
                }
            }
        });

    }

    // This function is called by genereateInfo() to render info window.
    function generateInfoWindow(marker, name, address) {
        // close all info windows
        if (infowindow != null)
            infowindow.close();

        //generate info window for a given location
        infowindow = new google.maps.InfoWindow({
            content: '<h2>' + name + '</h2><div class="desc">' + address + '</div>'
        });

        infowindow.open(map, marker);
    }

    // This function is used to animate marker
    function animateMarker(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 750);
    }


    //This function is used to get the summary / leading paragraphs / section 0 out of Wikipedia articlies 
    function loadWiki(clickedMarker) {
        var $wikiElem = $('#wikipedia');
        $wikiElem.text("");
        var wikiUrl = "http://en.wikipedia.org/w/api.php?action=parse&page=" + clickedMarker.name + "&prop=text&section=0&format=json&callback=?";
        $wikiElem.append('<h1>' + clickedMarker.name + '</h1>');
        //Get Leading paragraphs (section 0)
        $.getJSON(wikiUrl, function(data) {
            if (data.parse) {
                for (var i in data.parse.text) {
                    var text = data.parse.text[i].split("<p>");
                    var pText = "";

                    for (var p in text) {
                        //Remove html comment
                        text[p] = text[p].split("<!--");
                        if (text[p].length > 1) {
                            text[p][0] = text[p][0].split(/\r\n|\r|\n/);
                            text[p][0] = text[p][0][0];
                            text[p][0] += "</p> ";
                        }
                        text[p] = text[p][0];
                        //Construct a string from paragraphs
                        if (text[p].lastIndexOf("</p>") == text[p].length - 5) {
                            var htmlStrip = text[p].replace(/<(?:.|\n)*?>/gm, ''); //Remove HTML
                            var splitNewline = htmlStrip.split(/\r\n|\r|\n/); //Split on newlines

                            for (var newline in splitNewline) {

                                if (splitNewline[newline].substring(0, 11) != "Cite error:") {
                                    pText += splitNewline[newline];
                                    pText += "\n";
                                }
                            }
                        }
                    }
                    pText = pText.substring(0, pText.length - 2); //Remove extra newline
                    pText = pText.replace(/\[\d+\]/g, ""); //Remove reference tags (e.x. [1], [4], etc)
                    $wikiElem.append('<div>' + pText + '</div>');
                }
            } else {
                $wikiElem.append('<div>No available information</div>');
            }
        });
    }

    // This function is used to filter location based on user's input
    (function($) {
        // custom css expression for a case-insensitive contains()
        jQuery.expr[':'].Contains = function(a, i, m) {
            return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
        };

        function filterList(header, list) {
            // header is any element, list is an unordered list
            // create and add the filter form to the header
            var form = $("<form>").attr({
                    "class": "filterform",
                    "action": "#"
                }),
                input = $("<input>").attr({
                    "class": "filterinput",
                    "type": "text"
                });
            $(form).append(input).appendTo(header);

            $(input)
                .change(function() {
                    var filter = $(this).val();
                    if (filter) {

                        var matches = $(list).find(':Contains(' + filter + ')');
                        $('li', list).not(matches).slideUp("fast", function() {
                            updateVisibility($('li', list).not(matches), false); // update visibility of markers that don't match filter to false
                        });

                        matches.slideDown("fast", function() {
                            updateVisibility(matches, true); // update visibility of markers that match filter to true
                        });
                    } else {
                        $(list).find("li").slideDown("fast", function() {
                            updateVisibility($(list).find("li"), true); // update visibility of all markers to true
                        });
                    }
                    return false;
                })
                .keyup(function() {
                    // fire the above change event after every letter
                    $(this).change();
                });
        }

        //on dom ready
        $(function() {
            filterList($("#form"), $("#list"));
        });
    }(jQuery));

    // This function is used to update markers visibility based on places' ids
    function updateVisibility(updatedMarkers, isVisible) {
        if (infowindow != null) {
            infowindow.close();
        }
        updatedMarkers.each(function(index) {
            var matchedId = $(this).attr("id");
            self.markerList()[matchedId].marker.setVisible(isVisible);
        });
    }

    // Make the weather request
    var getWeather = function(cityStr) {
        var requestString = 'http://api.openweathermap.org/data/2.5/weather?q=' + cityStr + '&units=Imperial';
        var request = new XMLHttpRequest();
        request.addEventListener('load', reqListener);
        request.open("get", requestString, true);
        request.send();
    };

    function reqListener() {
        var results = JSON.parse(this.responseText);
        $('#weather').append('<div>Today is <b>' + results.main.temp + '</b> °F</div>');
    }

    getWeather('Chandler,AZ, US');
};


var position = new google.maps.LatLng(33.321111, -111.859803);

// This function is called after structure is ready
// The purpose is to initialize map and view model
function initialize() {

    var myOptions = {
        zoom: 13,
        center: position,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(
        document.getElementById("map_canvas"),
        myOptions);

    google.maps.event.addDomListener(document.getElementById('reset'), 'click', resetMap);

    ko.applyBindings(new ViewModel());
}

//This function is used to reset map position
function resetMap() {
    if (infowindow != null) {
        infowindow.close();
    }
    map.setCenter(position);
    map.setZoom(13);
    map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
}