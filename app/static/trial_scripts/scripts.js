
var map = null, marker = null, flightPath, active= false;
var interval = 1000000;
var wait;
var end, begin;
var tid;
var curIndex = 0;


window.onload = function () {
    $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyDlOAhgmvkQB6GhtfR4_IzhqP6ahwvatcM&callback=initMap');
    $(window).triggerHandler('resize');


}


function initMap() {
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        mapTypeId: 'roadmap'
    });

    marker = new google.maps.Marker({
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5
        },
        map: map
    });

   
  
    startUpdateCoord(jsonString, 0);
    
    
  
}

function pauseMp4() {
    var mp4 = document.getElementById("mp4");
    mp4.pause();
}


function playMp4() {
    var mp4 = document.getElementById("mp4");
    mp4.play();
}

function updateVideoWidth() {
    var mp4 = document.getElementById("mp4");
    var videoWidth = $('.video').width();
    mp4.width = videoWidth;
}

function pausePlay() {
    if (active) {
        active = false;
        console.log("paused");
        setTimeout(function () {
            pauseMp4();
        }, 1000);
        interval = 10000000;
       
        
        
    }
    else {
        active = true;
        playMp4();
        interval = (end.time_usec - begin.time_usec) / 1000;
        clearTimeout(tid);
        startUpdateCoord(jsonString, curIndex);
        console.log("played");


    }

}

function startUpdateCoord(locations, index) {
        end = locations[index];
        begin = locations[index - 1];
    if (index === 0) {
        updateCoord(end.lat, end.lon, true);
        startUpdateCoord(locations, ++index);
    } else if (begin && end) {
        //update speed
        $('#speed').html(parseFloat(Math.round(end.speed_m_s*2.23694))); 
        //update compass
        $('#compass').css({
            transform: 'rotateZ(' + end.bearing_degrees + 'deg)'
        });
        tid = setTimeout(function () {
            updateCoord(end.lat, end.lon);
            startUpdateCoord(locations, ++index);
            curIndex = index;
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
// }

window.onresize = function () {
    updateVideoWidth();
    // updateSpeedPostion();
}