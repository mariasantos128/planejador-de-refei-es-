<?php

class ReceitaService {
    private $repository;

    public function __construct() {
        // O Service instancia o Repository (Model) para lidar com o banco
        $this->repository = new ReceitaRepository();
    }

    public function cadastrarReceita($nome, $ingredientes) {
        // PASSO 3: Regra de negócio / Validação
        if (empty($nome) || empty($ingredientes)) {
            return [
                "sucesso" => false, 
                "erro" => "Campos obrigatorios: nome e ingredientes nao podem ser vazios."
            ];
        }

        // Se passar na validação, manda salvar no banco
        $id = $this->repository->salvar($nome, $ingredientes);

        if ($id) {
            return [
                "sucesso" => true,
                "mensagem" => "Receita cadastrada com sucesso no SQLite!",
                "id" => $id
            ];
        }

        return ["sucesso" => false, "erro" => "Erro ao salvar no banco de dados."];
    }
}