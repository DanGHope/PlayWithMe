<!--
 *
 * PlayWithMe - An ADHOC Sports Web Application
 *
 * Copyright (C) 2015, Dan Hope, Matthew Militante
 * All rights reserved.
 *
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 -->
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
    $name = $_REQUEST['name'];
    $date = $_REQUEST['date'];
    $owner = $_REQUEST['owner'];
    $desc = $_REQUEST['desc'];
    $players = $_REQUEST['players'];

    $stmt = $db->prepare("INSERT INTO `events`(`lat`, `lng`, `event`, `name`, `date`, `user_id`, `description`, `players`) VALUES (?,?,?,?,?,?,?,?)");
    $stmt->bindParam(1,$lng);
    $stmt->bindParam(2,$lat);
    $stmt->bindParam(3,$event);
    $stmt->bindParam(4,$name);
    $stmt->bindParam(5,$date);
    $stmt->bindParam(6,$owner);
    $stmt->bindParam(7,$desc);
    $stmt->bindParam(8,$players);
    $stmt->execute();

    $db = null;

}catch (PDOException $e){
    // report error message
    echo $e->getMessage();
}



?>
