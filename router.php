<?php
// router.php
// Responsabilidade: avaliar a URL e o método HTTP e direcionar para a ação correta.

require_once __DIR__ . '/view.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/controller.php';

class Router {

    public function despachar(string $metodo, string $uri): void {
        // Normaliza a URI (remove query string, se houver)
        $caminho = strtok($uri, '?') ?: '/';

        // --- Rota principal "/" ---
        if ($caminho === '/') {

            if ($metodo === 'GET') {
                // Exibe o formulário vazio
                renderView();
                return;
            }

            if ($metodo === 'POST') {
                // 1. Middleware valida os campos (encerra se inválido)
                $dados = Middleware::validarMatricula($_POST);

                // 2. Controller orquestra Service + Model
                $controller = new MatriculaController();
                $resultado  = $controller->processarMatricula($dados);

                // 3. View exibe o resultado
                renderView($resultado);
                return;
            }
        }

        // --- Rota não encontrada ---
        http_response_code(404);
        echo '<h2>404 — Página não encontrada</h2>';
    }
}
