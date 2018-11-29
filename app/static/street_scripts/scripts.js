
var map = null, marker = null;
var flightPlanCoordinates = [];
var markers = [];
var flightPath, viewer;




function getList (flightPath) {
    $.post('/image_set', {
        date: flightPath.tag
        }).done(function(response) {
            viewer.destroy();
        //    // $('#imageplayer').imgplay({rate: 0.5});
        //    // $("#imageplayer .imageplayer").add("<img src=\"static/images/"+flightPath.tag+"/"+"001.bmp"+"\"/>");
        //    /* for (var i = 0; i < response.length; i++) {
        //         var string = "<img data-src=\"static/images/"+flightPath.tag+"/"+response[i]+"\"/>";
        //         $(".imageplayer").add(string);
        //     }*/
            
            var string = "";
            var open = "<ul id=\"images\">\n";
            
            for (var i = 0; i < response.length; i++) {
                string += "<li><img src=\"../static/images/"+flightPath.tag+"/"+response[i]+"\"/></li>\n";
            }
            var close = "</ul>";
            $("#imageplayer").html(open + string + close);
            console.log(document.getElementById('images'));
            
            viewer = new Viewer(document.getElementById('images'), {
                inline: true,
                toolbar: {
                    zoomIn: 0,
                    zoomOut: 0,
                    oneToOne: 0,
                    reset: 0,
                    prev: 1,
                    play: {
                      show: 0,
                      size: 'large',
                    },
                    next: 1,
                    rotateLeft: 0,
                    rotateRight: 0,
                    flipHorizontal: 0,
                    flipVertical: 0,
                  },
                transition: false,
                viewed: function() {
                  viewer.zoomTo(1);
                }
              });
            

              document.getElementById('images').addEventListener('view', function () {
                console.log(event.detail.index);
                map.setCenter(markers[event.detail.index].getPosition());

              }, false);
              
              viewer = new Viewer(image);
    }).fail(function() {
        console.log("error");
       // $(destElem).text("{{ _('Error: Could not contact server.') }}");
    });
}


(function($) {
    $(document).ready(function() {
        viewer = new Viewer(document.getElementById('images'), {
            inline: true,
            toolbar: {
                zoomIn: 0,
                zoomOut: 0,
                oneToOne: 0,
                reset: 0,
                prev: 1,
                play: {
                  show: 0,
                  size: 'large',
                },
                next: 1,
                rotateLeft: 0,
                rotateRight: 0,
                flipHorizontal: 0,
                flipVertical: 0,
              },
            transition: false,
            viewed: function() {
              viewer.zoomTo(1);
            }
          });
          
          // View a list of images
         
       // $('#imageplayer').data('imgplay').play();

       

    });
})(jQuery);

for (var i = 0; i < jsonString.length; i++) {
    var temp = [];
    for (var j = 0; j < jsonString[i].length; j++) {
        temp.push({
            lat: jsonString[i][j].lat,
            lng: jsonString[i][j].lon,
            date: jsonString[i][j].trial_date
        });
    }
    flightPlanCoordinates.push(temp);
}


window.onload = function () {
    $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyDlOAhgmvkQB6GhtfR4_IzhqP6ahwvatcM&callback=initMap');
    $(window).triggerHandler('resize');
}

function initMap() {
   
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: new google.maps.LatLng(jsonString[0][0].lat, jsonString[0][0].lon),
        mapTypeId: 'roadmap'
    });
    for (var i = 0; i < jsonString.length; i++) {
        var color;
        switch(i%3) { // Draw appropriate polylines so they have different colors
            case 1:
                color = 'red';
                break;
            case 2:
                color = 'blue';
                break;
            default:
                color = 'black';
                break;
        }
        flightPath = new google.maps.Polyline({
            path: flightPlanCoordinates[i],
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 1.0,
            strokeWeight: 4,
            tag: flightPlanCoordinates[i][0].date
          });
        flightPath.setMap(map);
        addClickZoom(flightPath);
        console.log("array length: " + flightPath.getPath().getArray().length)
          
    }
    dynamicMarkers();
}
   
    
    


   /*marker = new google.maps.Marker({
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5
        },
        // draggable: true,
        map: map
    });
*/
   





function addMarkers(flightPath) {
   /* for (var i = 0; i < jsonString.length; i++) {
        for (var j = 0; j < jsonString[i].length; j++) {
            var marker = new google.maps.Marker({
                position: {lat: jsonString[i][j].lat, lng: jsonString[i][j].lon},
                map: map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 5
                },
                id: j
            });
            addImage(marker, marker.id);
        }
    }*/
    
     for (var i = 0; i < flightPath.getPath().getArray().length; i++) {
         var marker = new google.maps.Marker({
            position: {
                lat: flightPath.getPath().getArray()[i].lat(),
                lng: flightPath.getPath().getArray()[i].lng(),
            },
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 4
            },
         });
         setImageTo(marker, i);
         markers.push(marker);
     }
}


function addClickZoom(flightPath) { // zoom in and draw markers
    google.maps.event.addListener(flightPath, 'click', function() {
        deleteMarkers();
        map.setZoom(20);
        lat = flightPath.getPath().getArray()[0].lat();
        lng = flightPath.getPath().getArray()[0].lng();
        map.setCenter(new google.maps.LatLng(lat, lng));
        addMarkers(flightPath);
        console.log(flightPath.tag);
        getList(flightPath);
    });
   

   

}

function setImageTo(marker, id) {

    google.maps.event.addListener(marker, 'click', function() {
        viewer.view(id);
        console.log(id);
    });
    
}
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function deleteMarkers() {
    clearMarkers();
    markers = [];
}

function clearMarkers() {
    setMapOnAll(null);
}

function showMarkers() {
    setMapOnAll(map);
}

function dynamicMarkers() {
    google.maps.event.addListener(map, 'bounds_changed', function (){
        for (var i = 0; i < markers.length; i++) {
            if (map.getBounds().contains(markers[i].getPosition())) {
                markers[i].setMap(map);
            }
            else {
                markers[i].setMap(null);
            }
        }
    })
}
/*function startUpdateCoord(locations, index) {
    var end = locations[index];
    var begin = locations[index - 1];
    if (index === 0) {
        updateCoord(end.lat, end.lon, true);
        startUpdateCoord(locations, ++index);
    } else if (begin && end) {
        var interval = (end.time_usec - begin.time_usec) / 1000;
        // console.log(interval);
        // update speed
        $('#speed').html(parseFloat(end.speed_m_s).toFixed(1)); 
        setTimeout(function () {
            updateCoord(end.lat, end.lon);
            startUpdateCoord(locations, ++index);
        }, interval);
    }
}

function updateCoord(lat, lng, setCenter) {
    var pos = { lat, lng };

    if (setCenter) {
        map.setCenter(pos);
        // console.log();
        flightPath = new google.maps.Polyline({
            path: [pos],
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 5
        });

        flightPath.setMap(map);
    }
    var path = flightPath.getPath();

    // Because path is an MVCArray, we can simply append a new coordinate
    // and it will automatically appear.
    path.push(new google.maps.LatLng(lat, lng));

    marker.setPosition(pos);
}

// function updateSpeedPostion() {
//     const postion = $('#mp4').position();
//     $('#speed').css({
//         left: postion.left + 'px',
//         top: postion.top + 'px',
//     });
//     // console.log(postion);
// }*/
