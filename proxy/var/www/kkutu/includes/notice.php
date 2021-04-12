<?php
$discharging = (strpos(file_get_contents('/sys/class/power_supply/battery/status'), 'Dis') !== false);
$capacity = (int)file_get_contents('/sys/class/power_supply/battery/capacity');

if ($capacity >= 75) {
        $urgency = 'primary';
} else if ($capacity >= 50) {
        $urgency = 'warning';
} else {
        $urgency = 'danger';
}

$show = $urgency === 'danger' || $discharging;

if ($show) : ?>
        <div class="alert alert-<?=$urgency?>" role="alert">
                [Battery] <?php echo $capacity . '%, ' . file_get_contents('/sys/class/power_supply/battery/status'); ?>
        </div>
<?php endif; ?>

<?php /*        <div class="alert alert-primary" role="alert">
            <?php echo $lang == "ko" ? "최근 서버를 이전하였습니다. 문제 발생 시 하단 이메일로 문의 바랍니다." : "The server has migrated recently. If any problem occurs, please contact the admin by the email below."; ?>

        </div>
*/ ?>
