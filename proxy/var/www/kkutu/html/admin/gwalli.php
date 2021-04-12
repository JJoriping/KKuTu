<?php
error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT);

$opts = [
    "http" => [
        "method" => "GET",
        "header" => "Host: kkutu.romanhue.xyz\r\nUser-Agent: ".$_SERVER['HTTP_USER_AGENT']."\r\n"
    ],
    "ssl" => [
        "verify_peer" => false,
        "verify_peer_name" => false
    ]
];
$context = stream_context_create($opts);

$content = file_get_contents("https://localhost:2222/gwalli".$_GET['path'], false, $context);

if (isset($_GET['path'])) header("Content-Type: application/json");

echo $content;
