<?php
if (!isset($errorCode)) $errorCode = $_GET["code"];
if ($errorCode != "maintenance") http_response_code(intval($errorCode));
if ($errorCode == "404") {
    $errorStr = "404 Not Found";
    $errorInfo = $lang == "ko" ? "요청한 페이지를 서버에서 찾을 수 없습니다" : "Request page was not found on this server";
} else if ($errorCode == "403") {
    //htaccess or directory indexing
    $errorStr = "403 Forbidden";
    $errorInfo = $lang == "ko" ? "여긴 왜들어옴?" : "Why are you trying to access this?";
} else if ($errorCode == "401") {
    //admin login failure
    $errorStr = "401 Unauthorized";
    $errorInfo = $lang == "ko" ? "인증 실패" : "Authentication failed";
} else if ($errorCode == "500") {
    $errorStr = "500 Internal Server Error";
    $errorInfo = $lang == "ko" ? "알 수 없는 서버 오류가 발생하였습니다. 하단 이메일로 문의 바랍니다." : "An unknown server error occurred. Please contact the admin using the email below.";
} else if ($errorCode == "502") {
    $errorStr = "502 Bad Gateway";
    $errorInfo = $lang == "ko" ? "알 수 없는 서버 오류가 발생하였습니다. 하단 이메일로 문의 바랍니다." : "An unknown server error occurred. Please contact the admin using the email below.";
} else if ($errorCode == "503") {
    $errorStr = "503 Service Temporarily Unavailable";
    $errorInfo = $lang == "ko" ? "알 수 없는 서버 오류가 발생하였습니다. 하단 이메일로 문의 바랍니다." : "An unknown server error occurred. Please contact the admin using the email below.";
} else if ($errorCode == "504") {
    $errorStr = "504 Gateway Timeout";
    $errorInfo = $lang == "ko" ? "알 수 없는 서버 오류가 발생하였습니다. 하단 이메일로 문의 바랍니다." : "An unknown server error occurred. Please contact the admin using the email below.";
} else if ($errorCode == "maintenance") {
    //maintenance notice
    $errorStr = "Under Maintenance";
    $errorInfo = $lang == "ko" ? "서버 점검중입니다. 몇 분 후 다시 접속해 주시기 바랍니다." : "The server is now under maintenance. Please visit again a few minutes later.";
} else {
    //direct access to ytsl.tk/error.php
    $errorStr = "200 OK";
    $errorInfo = $lang == "ko" ? "여긴 왜들어옴?" : "Why are you trying to access this?";
}
?>
<!DOCTYPE html>
<html>
<head>
    <title><?=$errorStr?> - RHFiles</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
<?php $page = "error"; include '/var/www/rhfiles.tk/includes/navbar.php'; ?>
<?php include '/var/www/rhfiles.tk/includes/notice.php'; ?>
    <div id="content" style="margin-left: 10px; margin-right: 10px; margin-top: 4px; margin-bottom: 4px;">
        <h3><?=$errorStr?></h3>
        <p><?=$errorInfo?></p>
    </div>
<?php include '/var/www/rhfiles.tk/includes/footer.php'; ?>
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV" crossorigin="anonymous"></script>
</body>
</html>
