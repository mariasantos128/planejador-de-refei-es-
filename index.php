<?php
// index.php
// Front Controller — ponto de entrada único da aplicação.
// Todo o tráfego do servidor built-in passa por aqui.

require_once __DIR__ . '/router.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$uri    = $_SERVER['REQUEST_URI'];

$router = new Router();
$router->despachar($metodo, $uri);
