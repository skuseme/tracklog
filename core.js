//27376D81-A3E4-4415-9722-20CED9A5284D

var trackCoords = [];
var trackAltitude = [['Time', 'Altitude']];
var trackSpeed = [['Time', 'Speed']];

var autocomplete = [];

//Max 10000
var trackLimit = 30000;

function secondsToTime(miliseconds){
	var seconds = miliseconds/1000
	var numdays = Math.floor(seconds / 86400);
	var numhours = Math.floor((seconds % 86400) / 3600);
	var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
	var numseconds = ((seconds % 86400) % 3600) % 60;
	return numdays + " days " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";
}

function LeftMenu(controlDiv){
	var controlUI = document.createElement('div');
	controlUI.style.float = 'left';
	controlUI.style.margin = '8px';
	controlUI.innerHTML = '<a><i class="bars big icon"></i></a>';
	controlDiv.appendChild(controlUI);

	controlUI.addEventListener('click', function(){
		$('.ui.sidebar').sidebar('toggle');
	});
}

function populateSidebar(item){
	var sidebar = $("#sidebar");
	sidebar.append('<a id="' + item[0].id + '" class="sidebar-track item">' + item[0].startPlace + " to " + item[0].endPlace + '</a>');
}

function initMap() {
	// Create a map object and specify the DOM element for display.
	var map = new google.maps.Map(document.getElementById('map_canvas'), {
		center: {lat: -25.2744, lng: 133.7751},
		zoom: 5,
		mapTypeControl: true,
		mapTypeControlOptions: {
			position: google.maps.ControlPosition.TOP_RIGHT
		}
	});

	var leftMenuDiv = document.createElement('div');
	var leftMenu = new LeftMenu(leftMenuDiv);

	leftMenuDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(leftMenuDiv);

	var bounds = new google.maps.LatLngBounds();

	//If tracks have been populated
	if(trackCoords.length > 0){
		$("#sidebar").html(null);
		//Draw tracks
		$.each(trackCoords, function(index, record){
			var trackPoints = [];
			for(var i=0; i < record.length; i++){
				trackPoints.push({lat: record[i].lat, lng: record[i].lng});
			}
			var trackPath = new google.maps.Polyline({
				path: trackPoints,
				geodesic: true,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			trackPath.setMap(map);

			//Draw start marker
			var startMarker = new google.maps.Marker({
				position:trackPath.getPath().getAt(0),
				label: "A", 
				map:map
			});

			//Draw end marker
			var endMarker =  new google.maps.Marker({
				position:trackPath.getPath().getAt(trackPath.getPath().getLength()-1), 
				label: "B",
				map:map
			});

			var startTime = new Date(record[0].dtg)
			var endTime = new Date(record[record.length-1].dtg)
			var travelTime = secondsToTime(endTime - startTime)
			//var startPlace = lookupPlace(record[0].lat, record[0].lng)
			//var endPlace = lookupPlace(record[record.length-1].lat, )

			var startPlace = null
			var endPlace = null

			$.ajax({
				url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + record[0].lat + "," + record[0].lng + "&key=AIzaSyBNM-KI8zHBfXZKcIN6Tbq4DZ0QkvUfHVU",
				dataType: "json",
				method: "POST",
				async: true
			}).done(function(data) {
				startPlace = data.results[0].address_components[2].long_name + ", " + data.results[0].address_components[3].short_name
				$.ajax({
					url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + record[record.length-1].lat + "," + record[record.length-1].lng + "&key=AIzaSyBNM-KI8zHBfXZKcIN6Tbq4DZ0QkvUfHVU",
					dataType: "json",
					method: "POST",
					async: true
				}).done(function(data) {
					endPlace = data.results[0].address_components[2].long_name + ", " + data.results[0].address_components[3].short_name
					var markerContent = "<div id='markerInfo'><b>" + startPlace + " to " + endPlace + "</b><br />" + startTime + "<br />" + "Travel Time: " + travelTime + "</div>";

					var MarkerInfo = new google.maps.InfoWindow({
						content: markerContent
					});

					startMarker.addListener('click', function() {
						MarkerInfo.open(map, startMarker);
					});

					var tripInfo = [{id: index, startPlace: startPlace, endPlace: endPlace, startTime: startTime, endTime: endTime, travelTime: travelTime}];
					populateSidebar(tripInfo);
				});
			});

			for (var i = 0; i < record.length; i++) {
				bounds.extend(record[i]);
			}
		});
		//Find edges of tracks and set map bounds/zoom
		map.fitBounds(bounds);
	}
	google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
		loader(false, 0);
	});
}

function initAltitudeChart(data){
	// Create the data table.
	var data = google.visualization.arrayToDataTable(data);

	// Set chart options
	var options = {
		'title': 'Altitude (metres)',
		'height': '150',
		'legend': 'none'
	};

	var chart = new google.visualization.AreaChart(document.getElementById('altitude_canvas'));
	chart.draw(data, options);
}

function initSpeedChart(data){
	// Create the data table.
	var data = google.visualization.arrayToDataTable(data);

	// Set chart options
	var options = {
		'title': 'Speed (km/h)',
		'height': '150',
		'legend': 'none'
	};

	var chart = new google.visualization.AreaChart(document.getElementById('speed_canvas'));
	chart.draw(data, options);
}

function buildAutoComplete(){
	$.ajax({
		url: "autocomplete.php",
		dataType: "json",
		method: "POST",
	}).done(function(data) {
		autocomplete = [];
		for(var i=0; i < data.length; i++){
			autocomplete.push({title: data[i].deviceID});
		}
		$(".ui.search").search({
			source: autocomplete,
			minCharacters: 1,
			onSelect: function(result){
			searchTracks(result.title);
	 		}
		});
	});
}

function searchTracks(searchTxt){
	loader(true, 0);
	console.log("Searching for: " + searchTxt);
	$.ajax({
		url: "pull.php",
		dataType: "json",
		method: "POST",
		data: {
			deviceID: searchTxt,
			trackLimit: trackLimit
		}
	}).done(function(data) {
		trackCoords = [];
		trackAltitude = [['Time', 'Altitude']];
		trackSpeed = [['Time', 'Speed']];
		loader(true, data.length);
		$.each(data, function(index, record){
			trackArray = [];
			for(var i=0; i < record.length; i++){
				var trackLatLon = {lat: parseFloat(record[i].latitude), lng: parseFloat(record[i].longitude), dtg: record[i].timestamp};
				trackArray.push(trackLatLon);
				//trackAltitude.push([record[i].timestamp, parseFloat(record[i].altitude)]);
				//trackSpeed.push([record[i].timestamp, parseFloat(record[i].speed)]);
			}
			trackCoords.push(trackArray);
		});
		initMap();
		console.log(trackCoords);
		//initAltitudeChart(trackAltitude);
		//initSpeedChart(trackSpeed);
	});
}

function loader(enabled, trackCount){
	if(enabled === true){
		$("#loader").removeClass("disabled");
		$("#loader").addClass("active");
		if(trackCount === -1){
			$("#loading-text").html("Loading map...");
		}else if(trackCount === 0){
			$("#loading-text").html("Searching tracks...");
		}else{
			$("#loading-text").html("Plotting " +  trackCount + " tracks...");
		}
	}else{
		$("#loader").addClass("disabled");
		$("#loader").removeClass("active");
		$("#loading-text").html("");
	}
}

$(document).ready(function(){
	loader(true, -1);
	buildAutoComplete();

	$('body').on('click', '.sidebar-track', function () {
		console.log(this.id);
	});
});

