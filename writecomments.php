<?php 
header('Access-Control-Allow-Origin: *');

$filename = '/uac/y16/mkchoi6/www/comments.json';
$contents = $_POST["contents"];

file_put_contents($filename, $contents); 
chmod($filename, 0644);
?>
