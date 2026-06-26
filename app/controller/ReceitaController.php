<?php

class ReceitaController {
    public function cadastrar() {
        header('Content-Type: application/json');

        $nome = $_POST['nome'] ?? null;
        $ingredientes = $_POST['ingredientes'] ?? null;

        // Instancia o Service e executa o fluxo
        $service = new ReceitaService();
        $resultado = $service->cadastrarReceita($nome, $ingredientes);
        
        echo json_encode($resultado);
    }
}