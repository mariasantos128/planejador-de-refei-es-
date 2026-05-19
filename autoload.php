<?php
// autoload.php na raiz do projeto

spl_autoload_register(function ($classe) {
    // Mapeia todas as novas pastas onde o PHP deve procurar as classes
    $diretorios = [
        __DIR__ . '/app/controller/',
        __DIR__ . '/app/model/',
        __DIR__ . '/app/services/',
        __DIR__ . '/app/router/',
        __DIR__ . '/app/middleware/'
    ];

    foreach ($diretorios as $diretorio) {
        $arquivo = $diretorio . $classe . '.php';
        if (file_exists($arquivo)) {
            require_once $arquivo;
            return;
        }
    }
});