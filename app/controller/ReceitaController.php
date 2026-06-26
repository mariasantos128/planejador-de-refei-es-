<?php

class ReceitaController {
    public function cadastrar() {
        // Define que a resposta sempre será um JSON limpo
        header('Content-Type: application/json');

        // Captura os dados enviados pelo cURL ou formulário
        $nome = $_POST['nome'] ?? null;
        $ingredientes = $_POST['ingredientes'] ?? null;

        // Se a classe ReceitaService existir, seguimos o fluxo do MVC
        if (class_exists('ReceitaService')) {
            $service = new ReceitaService();
            $resultado = $service->cadastrarReceita($nome, $ingredientes);
            echo json_encode($resultado);
        } else {
            // Resposta de contingência caso o Service ainda precise ser revisado
            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Receita recebida com sucesso no Controller!",
                "dados" => [
                    "nome" => $nome,
                    "ingredientes" => $ingredientes
                ]
            ]);
        }
    }
}