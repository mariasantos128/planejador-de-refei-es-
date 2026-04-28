<?php
// migration.php
// Execute UMA VEZ antes de usar a aplicação: php migration.php

class Migration {
    private PDO $pdo;

    public function __construct() {
        // Cria (ou abre) o arquivo database.sqlite na mesma pasta
        $this->pdo = new PDO('sqlite:' . __DIR__ . '/database.sqlite');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function executar(): void {
        $sql = "CREATE TABLE IF NOT EXISTS alunos (
            id     INTEGER PRIMARY KEY AUTOINCREMENT,
            nome   TEXT    NOT NULL,
            idade  INTEGER NOT NULL,
            curso  TEXT    NOT NULL
        )";

        $this->pdo->exec($sql);
        echo "[Migration] Tabela 'alunos' criada (ou já existia) com sucesso!\n";
        echo "[Migration] Arquivo 'database.sqlite' pronto para uso.\n";
    }
}

// Roda a migration automaticamente ao executar este arquivo
$migration = new Migration();
$migration->executar();
