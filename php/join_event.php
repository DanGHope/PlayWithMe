<?php
require_once 'dbconfig.php';

try{
    //Connect to DB
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $event = $_REQUEST['eventID'];
    $userid = $_REQUEST['userID'];

    $stmt = $db->prepare("INSERT INTO `people`(`user_id`,`id`) VALUES (?,?)");
    $stmt->bindParam(1,$userid);
    $stmt->bindParam(2,$event);
    $stmt->execute();

    $db = null;

}catch (PDOException $e){
    // report error message
    echo $e->getMessage();
}



?>
