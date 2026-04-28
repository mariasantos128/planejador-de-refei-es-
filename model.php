<?php
// model.php
// Responsabilidade: comunicação exclusiva com a tabela 'alunos' no SQLite.

class AlunoModel {
    // Propriedades privadas — só acessíveis via Getters e Setters
    private string $nome;
    private int    $idade;
    private string $curso;

    // ==========================================
    // GETTERS
    // ==========================================
    public function getNome(): string  { return $this->nome; }
    public function getIdade(): int    { return $this->idade; }
    public function getCurso(): string { return $this->curso; }

    // ==========================================
    // SETTERS
    // ==========================================
    public function setNome(string $nome): void   { $this->nome  = trim($nome); }
    public function setIdade(int   $idade): void  { $this->idade = $idade; }
    public function setCurso(string $curso): void { $this->curso = trim($curso); }

    // ==========================================
    // SAVE — Persiste os dados no banco SQLite
    // ==========================================
    public function save(): bool {
        $pdo = new PDO('sqlite:' . __DIR__ . '/database.sqlite');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Prepared Statement → protege contra SQL Injection
        $stmt = $pdo->prepare(
            "INSERT INTO alunos (nome, idade, curso) VALUES (:nome, :idade, :curso)"
        );

        $stmt->bindValue(':nome',  $this->nome);
        $stmt->bindValue(':idade', $this->idade, PDO::PARAM_INT);
        $stmt->bindValue(':curso', $this->curso);

        return $stmt->execute();
    }
}
