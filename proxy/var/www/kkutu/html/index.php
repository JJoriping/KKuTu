<?php
error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT);
$opts = [
    "http" => [
        "method" => "GET",
        "header" => "Host: kkutu.romanhue.xyz\r\nUser-Agent: ".$_SERVER['HTTP_USER_AGENT']
    ],
    "ssl" => [
        "verify_peer" => false,
        "verify_peer_name" => false
    ]
];
$context = stream_context_create($opts);

$content = file_get_contents("https://localhost:2222?server=".$_GET['server'], false, $context);
$split1 = explode("<div id=\"Top\">", $content);
$split2 = explode("</title>", $split1[0]);

echo $split2[0];
echo '</title><link rel="stylesheet" href="/css/bootstrap-navbar.css">';
echo $split2[1];
include '../includes/navbar.php';
echo $split1[1];
?>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV" crossorigin="anonymous"></script>
</body>
</html>
