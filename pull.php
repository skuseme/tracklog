<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$host = 'localhost';
$dbName = 'tracklog';
$username = '';
$password = '';

$dbh = new PDO("mysql:host=".$host.";dbname=".$dbName, $username, $password);
$dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, FALSE);
$sql = "SELECT * from tracks WHERE deviceID = :deviceID ORDER BY timestamp DESC LIMIT :trackLimit";
$sth = $dbh->prepare($sql);

if(isset($_POST['deviceID'])){

	if($_POST['trackLimit'] >= 50000){
		$trackLimit = 50000;
	}else{
		$trackLimit = $_POST['trackLimit'];
	}

	$sth->execute(['deviceID' => $_POST['deviceID'], 'trackLimit' => $trackLimit]);
	$result = $sth->fetchAll(\PDO::FETCH_ASSOC);

	$keys = [];
	$data = [];

	foreach($result as $key => $row){
		if(isset($lastDate)){
			$diff = strtotime($lastDate) - strtotime($row['timestamp']);
			if($diff > 7200){
				array_push($keys, $key);
			}
		}
		$lastDate = $row['timestamp'];
	}

	$lastKey = 0;
	foreach($keys as $key){
		array_push($data, array_reverse(array_slice($result, $lastKey, $key-$lastKey, true)));
		$lastKey = $key;
	}
	array_push($data, array_reverse(array_slice($result, $lastKey, count($result)-$lastKey, true)));

	print_r(json_encode($data));
}
?>
