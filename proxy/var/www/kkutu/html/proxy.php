<?php
error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT);

switch($_GET['type']) {
    case "lang":
        $dir = "language/".$_GET['path'];
        $mime = "text/javascript";
        break;

    case "dict":
        $dir = "dict/".$_GET['path'];
        $mime = "text/plain";
        break;

    case "server":
        $dir = "servers";
        $mime = "application/json";
        break;

    case "login":
        $dir = "login".$_GET['path'];
        $mime = "text/html";
        break;
}

header("Content-Type: ".$mime);

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
$content = file_get_contents("https://localhost:2222/".$dir, false, $context);

if (substr($http_response_header[2], 0, 10) === "Location: ") header("Location: ".substr($http_response_header[2], 10));
echo $content;
