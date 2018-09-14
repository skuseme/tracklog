<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$host = 'localhost';
$dbName = 'tracklog';
$username = '';
$password = '';
 
$dbh = new PDO("mysql:host=".$host.";dbname=".$dbName, $username, $password);

$sql = "SELECT DISTINCT(deviceID) FROM tracks";
$sth = $dbh->prepare($sql);
$sth->execute();
$result = $sth->fetchAll(\PDO::FETCH_ASSOC);

print_r(json_encode($result));

?>
