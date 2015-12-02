<?php
require_once 'dbconfig.php';

function generate_geojson($db){
    $stmt = $db->prepare("SELECT * FROM events");
    $stmt->execute();
    $result = $stmt->fetchAll();

    $geojson = array( 'type' => 'FeatureCollection', 'features' => array());

    foreach($result as $row){
        $event = $row['event'];
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
                'title' => $event,
                'description' => "Looking for people to play $event",
                'id' => $row['id']
            ),
            'geometry' => array(
                'type' => 'Point',
                'coordinates' => array(
                    $row['lat'],
                    $row['lng']
                )
            )
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
