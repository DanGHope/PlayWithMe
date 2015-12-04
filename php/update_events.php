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

function generate_geojson($db){
    $stmt = $db->prepare("SELECT * FROM events JOIN people USING(`user_id`)");
    $stmt->execute();
    $result = $stmt->fetchAll();
    $stmt2 = $db->prepare("SELECT `people`.`user_id`,`user_name` FROM people JOIN attending USING(`user_id`) JOIN events USING(`id`) WHERE `id`=:eventID");

    $geojson = array( 'type' => 'FeatureCollection', 'features' => array());

    foreach($result as $row){
        $name = $row['name'];
        $event = $row['event'];
        $description = $row['description'];
        $owner = $row['user_id'];
        $ownername = $row['user_name'];
        $players = $row['players'];
        $date = $row['date'];
        $eventID = $row['id'];

        $stmt2->bindParam(":eventID",$eventID);
        $stmt2->execute();
        $people = $stmt2->fetchAll();

        switch($event){
            case 'Soccer':
            $sym = 'soccer';
            break;

            case 'Baseball':
            $sym = 'baseball';
            break;

            case 'Cycling':
            $sym = 'bicycle';
            break;

            case 'Running':
            $sym = 'school';
            break;

            case 'Football':
            $sym = 'america-football';
            break;

            case 'Basketball':
            $sym = 'basketball';
            break;

            default:
            $sym = 'pitch';
        }

        $marker = array(
            'type' => 'Feature',
            'properties' => array(
                'marker-color' => '#24d999',
                'marker-size' => 'medium',
                'marker-symbol' => $sym,
                'event' => $event,
                'title' => $name,
                'description' => $description,
                'owner' => $owner,
                'ownername' => $ownername,
                'date' => $date,
                'players' => $players,
                'id' => $eventID
            ),
            'geometry' => array(
                'type' => 'Point',
                'coordinates' => array(
                    $row['lat'],
                    $row['lng']
                )
            ),
            'people' => $people
        );
        array_push($geojson['features'], $marker);
    }

    $json_string = json_encode($geojson);

    $file = 'phpjson.geojson';
    file_put_contents($file, $json_string);
}

try{
    //Connect to DB
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    generate_geojson($db);

    $db = null;

}catch (PDOException $e){
    // report error message
    echo $e->getMessage();
}



?>
