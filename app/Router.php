<?php
class Router {
    public function dispatch($url) {
        // Limpa a URL de parâmetros GET extras, se houver
        $url = parse_url($url, PHP_URL_PATH);

        if ($url === '/receita/cadastrar') {
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $controller = new ReceitaController();
                $controller->cadastrar();
            } else {
                http_response_code(405);
                echo json_encode(["erro" => "Método não permitido. Use POST."]);
            }
        } 
        else {
            http_response_code(404);
            echo json_encode(["erro" => "Rota não encontrada."]);
        }
    }
}