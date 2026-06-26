<?php

class ReceitaRepository {
    private $db;

    public function __construct() {
        // PASSO 3: Conecta usando a nossa classe Database blindada
        $this->db = Database::getInstance();
    }

    public function salvar($nome, $ingredientes) {
        $sql = "INSERT INTO receitas (nome, ingredientes) VALUES (:nome, :ingredientes)";
        $stmt = $this->db->prepare($sql);
        
        $stmt->bindValue(':nome', $nome);
        $stmt->bindValue(':ingredientes', $ingredientes);
        
        if ($stmt->execute()) {
            return $this->db->lastInsertId(); // Retorna o ID gerado pelo SQLite
        }
        
        return false;
    }
}