<?php
class Database {
    private static $instance = null;

    private function __construct() {}

    public static function getInstance() {
        if (self::$instance === null) {
            // Lê o arquivo config.ini
            $config = parse_ini_file(__DIR__ . '/../config.ini');
            
            // Cria o caminho para o arquivo do banco (vai ser criado na raiz do projeto)
            $dbPath = __DIR__ . '/../' . $config['path'];
            
            // Conecta usando SQLite
            self::$instance = new PDO("sqlite:" . $dbPath);
            self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Cria a tabela automaticamente se ela não existir
            $sql = "CREATE TABLE IF NOT EXISTS receitas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                ingredientes TEXT NOT NULL
            )";
            self::$instance->exec($sql);
        }
        return self::$instance;
    }
}