<?php
// service.php
// Responsabilidade: aplicar regras de negócio — sem HTTP, sem SQL.

class MatriculaService {

    // Idade mínima exigida por curso (regra de negócio)
    private const IDADE_MINIMA = [
        'Culinária Infantil'   => 10,
        'Confeitaria Básica'   => 14,
        'Gastronomia Avançada' => 18,
        'Nutrição Esportiva'   => 16,
    ];

    // Cursos com bolsa para maiores de 60 anos (outra regra de negócio)
    private const CURSOS_COM_BOLSA_SENIOR = [
        'Culinária Infantil',
        'Confeitaria Básica',
    ];

    /**
     * Valida e processa os dados do aluno.
     *
     * @param  array  $dados  Dados brutos: ['nome', 'idade', 'curso']
     * @return array          Dados processados com campo 'bolsa'
     * @throws Exception      Quando uma regra de negócio é violada
     */
    public function processarMatricula(array $dados): array {
        $nome  = $dados['nome'];
        $idade = (int) $dados['idade'];
        $curso = $dados['curso'];

        // --- Regra 1: Idade mínima por curso ---
        if (isset(self::IDADE_MINIMA[$curso])) {
            $minima = self::IDADE_MINIMA[$curso];
            if ($idade < $minima) {
                throw new Exception(
                    "❌ O curso <strong>{$curso}</strong> exige idade mínima de {$minima} anos. " .
                    "O aluno possui apenas {$idade} anos."
                );
            }
        }

        // --- Regra 2: Bolsa para alunos seniores (>= 60 anos) ---
        $bolsa = false;
        if ($idade >= 60 && in_array($curso, self::CURSOS_COM_BOLSA_SENIOR)) {
            $bolsa = true;
        }

        // Retorna os dados processados enriquecidos com o campo 'bolsa'
        return [
            'nome'  => $nome,
            'idade' => $idade,
            'curso' => $curso,
            'bolsa' => $bolsa,
        ];
    }
}
