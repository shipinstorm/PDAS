<?php
/*  Returns JSON similar to:
{
    "username": "rwacha",
    "displayName": "Rosie Wacha"
}
*/

if (isset($_SERVER['WDAS_AUTH_uid'])) {

    $da_email = $_SERVER['WDAS_AUTH_mail'];
    $uid = $_SERVER['WDAS_AUTH_uid'];

    $name = $_SERVER['WDAS_AUTH_gecos'];

    $arr = array(
        'username' => $uid,
        'displayName' => $name
    );
    header('Content-Type: application/json');
    echo json_encode($arr);
}
?>
