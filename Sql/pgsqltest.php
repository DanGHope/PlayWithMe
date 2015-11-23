<?php

require_once 'dbconfig.php';

$sql = 'SELECT * FROM users';

try{
    //Connect to DB
    $conn = new PDO("pgsql:host=$host;port=5432;dbname=$db",$username,$password);
    if($conn){
        echo $status = $conn->getAttribute(PDO::ATTR_CONNECTION_STATUS)."<br>";
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    echo $stmt->rowCount();

    $result = $stmt->fetchAll();
    foreach($result as $row){
        echo "<li>{$row['firstname']}, {$row['lastname']}</li>";
    }

    $conn = null;

}catch (PDOException $e){
    // report error message
    echo $e->getMessage();
}

?>
