<?php
echo "Battery capacity: " . file_get_contents('/sys/class/power_supply/battery/capacity');
echo "<br>Battery status: " . file_get_contents('/sys/class/power_supply/battery/status');
echo "<br>Server time: " . date("Y-m-d h:i:s a");