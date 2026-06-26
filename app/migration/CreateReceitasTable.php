<?php
// Arquivo de Migration para explicar no Passo 3
class CreateReceitasTable {
    public function up() {
        return "CREATE TABLE IF NOT EXISTS receitas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            ingredientes TEXT NOT NULL
        );";
    }
}