<?php

$host = 'localhost';
$dbName = 'tracklog';
$username = '';
$password = '';
 
$dbCon = new PDO("mysql:host=".$host.";dbname=".$dbName, $username, $password);

$data = json_decode(file_get_contents('php://input'), true);

$deviceID = $data["deviceID"];
$sql = "INSERT INTO tracks(deviceID, timestamp, latitude, longitude, speed, altitude) VALUES(:deviceID, :timestamp, :latitude, :longitude, :speed, :altitude)";
$stmt = $dbCon->prepare($sql);

foreach($data["locations"] as $location){

	$timestamp = $location["timestamp"];
	$latitude = $location["latitude"];
	$longitude = $location["longitude"];
	$speed = $location["speed"];
	$altitude = $location["altitude"];

	$stmt->execute([
		'deviceID' => $deviceID,
		'timestamp' => $timestamp,
		'latitude' => $latitude,
		'longitude' => $longitude,
		'speed' => $speed,
		'altitude' => $altitude
	]);
}

?>
