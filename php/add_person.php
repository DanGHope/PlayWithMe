<?php
require_once 'dbconfig.php';

try{
    //Connect to DB
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $userid = $_REQUEST['userid'];
    $name = $_REQUEST['name'];

    $stmt = $db->prepare("INSERT INTO `people`(`user_id`, `user_name`) VALUES (?,?)");
    $stmt->bindParam(1,$userid);
    $stmt->bindParam(2,$name);
    $stmt->execute();

    $db = null;

}catch (PDOException $e){
    // report error message
    echo $e->getMessage();
}



?>
