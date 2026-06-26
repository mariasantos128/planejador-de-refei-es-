<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'app/Router.php'; 
require_once 'autoload.php';

$url = $_SERVER['REQUEST_URI'];

$router = new Router();
$router->dispatch($url);