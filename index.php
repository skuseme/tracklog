<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
		
		<title>skuse.me</title>

		<link rel="stylesheet" href="semantic.min.css" type="text/css">
		<link rel="stylesheet" href="style.css" type="text/css" />
	</head>

	<body>
		<div id="sidebar" class="ui sidebar vertical menu">
		</div>
		<div class="pusher">
			<div id="topbar">
				<div class="ui search fluid">
					<div class="ui icon input fluid">
						<input class="prompt" type="text" id="searchTxt" placeholder="Start typing your device ID...">
						<i class="search icon"></i>
					</div>
				<div id="searchResult" class="results"></div>
				</div>
			</div>
			<div id="map_canvas"></div>
		</div>

		<div id="loader" class="ui disabled dimmer">
			<div id="loading-text" class="ui text loader"></div>
		</div>
	</body>

	<script src="jquery.min.js"></script>
	<script src="semantic.min.js"></script>
	<script src="core.js"></script>
	<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBNM-KI8zHBfXZKcIN6Tbq4DZ0QkvUfHVU&callback=initMap"></script>
	<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
</html>