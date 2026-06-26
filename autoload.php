<?php
spl_autoload_register(function ($classe) {
    // Lista exaustiva de possíveis nomes de pastas (segurança máxima no Linux)
    $diretorios = [
        'app/',
        'app/controller/',
        'app/controllers/',
        'app/Controller/',
        'app/Controllers/',
        'app/model/',
        'app/models/',
        'app/Model/',
        'app/service/',
        'app/services/',
        'app/Service/',
        'app/repository/',
        'app/repositories/',
        'app/Repository/'
    ];

    foreach ($diretorios as $diretorio) {
        $arquivo = __DIR__ . '/' . $diretorio . $classe . '.php';
        if (file_exists($arquivo)) {
            // Se o arquivo existir mas tiver 0 bytes (vazio), o PHP não carrega a classe
            if (filesize($arquivo) > 0) {
                require_once $arquivo;
                return;
            }
        }
    }
});