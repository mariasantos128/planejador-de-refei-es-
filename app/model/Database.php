<?php
class Database {
    private static $instance = null;

    private function __construct() {}

    public static function getInstance() {
        if (self::$instance === null) {
            try {
                // Caminho absoluto para evitar qualquer erro de pasta
                $caminhoBanco = __DIR__ . '/../../banco.sqlite';
                self::$instance = new PDO("sqlite:" . $caminhoBanco);
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (PDOException $e) {
                die(json_encode(["erro" => "Erro na conexão com o banco: " . $e->getMessage()]));
            }
        }
        return self::$instance;
    }
}