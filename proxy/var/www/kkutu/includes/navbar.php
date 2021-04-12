    <div id="Top">
        <nav class="bootstrap navbar navbar-expand-sm navbar-light bg-light">
            <a class="navbar-brand" href="https://www.romanhue.xyz/">RomanHue.xyz</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav w-100">
                    <li class="nav-item">
                        <a class="nav-link" href="https://www.romanhue.xyz/"><?php echo $lang == "ko" ? "홈" : "Home"; ?></a>
                    </li>
                    <li class="nav-item active">
                        <a class="nav-link" href="/">RHKKuTu <span class='sr-only'>(current)</span></a>
                    </li>
<?php
if ($page != "error") {
?>
                    <li class="nav-item dropdown ml-auto">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Language
                        </a>
                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
<?php if ($syslang == "ko") { ?>
                            <a class="dropdown-item" href="?lang=ko">한국어</a>
                            <a class="dropdown-item" href="?lang=en">English</a>
<?php } else { ?>
                            <a class="dropdown-item" href="?lang=en">English</a>
                            <a class="dropdown-item" href="?lang=ko">한국어</a>
<?php } ?>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item" href="?"><?php echo $lang == "ko" ? "시스템" : "System"; ?></a>
                        </div>
                    </li>
<?php } ?>
                </ul>
            </div>
        </nav>
