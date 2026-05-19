<?php
// index.php na raiz - O ponto de entrada do padrão MVC

// 1. Carrega as configurações (banco de dados, etc)
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
}

// 2. Carrega o Autoload que você acabou de criar
require_once __DIR__ . '/autoload.php';

// 3. Redirecionamento temporário ou chamada do Router
// Como as suas telas HTML agora estão dentro de view/html/, 
// se o seu roteador PHP ainda não estiver pronto, você pode testar abrindo direto a tela inicial:
header("Location: view/html/receitas.html");
exit;