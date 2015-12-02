<?php
require_once 'dbconfig.php';

try{
    //Connect to DB
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $lat = $_REQUEST['lat'];
    $lng = $_REQUEST['lng'];
    $event = $_REQUEST['sport'];

    $stmt = $db->prepare("INSERT INTO `events`(`lat`, `lng`, `event`) VALUES (?,?,?)");
    $stmt->bindParam(1,$lng);
    $stmt->bindParam(2,$lat);
    $stmt->bindParam(3,$event);
    $stmt->execute();

    $db = null;

}catch (PDOException $e){
    // report error message
    echo $e->getMessage();
}



?>
