<?php
// middleware.php
// Responsabilidade: verificar se os dados da requisição são válidos
//                   ANTES de chegarem ao Controller.

class Middleware {

    /**
     * Valida os campos obrigatórios de uma matrícula.
     * Encerra a execução imediatamente se algo estiver errado.
     *
     * @param  array  $post  Dados $_POST da requisição
     * @return array         Os dados validados e saneados
     */
    public static function validarMatricula(array $post): array {
        $erros = [];

        // --- Verifica se os campos existem e não estão vazios ---
        $nome  = trim($post['nome']  ?? '');
        $idade = trim($post['idade'] ?? '');
        $curso = trim($post['curso'] ?? '');

        if ($nome === '') {
            $erros[] = 'O campo <strong>Nome</strong> é obrigatório.';
        }

        if ($idade === '') {
            $erros[] = 'O campo <strong>Idade</strong> é obrigatório.';
        } elseif (!ctype_digit($idade) || (int)$idade <= 0) {
            // ctype_digit garante que é número inteiro positivo (sem ponto, sem letra)
            $erros[] = 'A <strong>Idade</strong> deve ser um número inteiro positivo.';
        }

        if ($curso === '') {
            $erros[] = 'Selecione um <strong>Curso</strong>.';
        }

        // --- Se houver erros, encerra o processo com mensagem de aviso ---
        if (!empty($erros)) {
            require_once __DIR__ . '/view.php';
            $listaErros = implode('<br>', array_map(fn($e) => "• {$e}", $erros));
            renderView([
                'sucesso'  => false,
                'mensagem' => "⚠️ Por favor, corrija os seguintes campos:<br><br>{$listaErros}",
                'dados'    => [],
            ]);
            exit; // Para aqui — Controller nunca é chamado
        }

        // Retorna dados limpos e tipados
        return [
            'nome'  => $nome,
            'idade' => (int) $idade,
            'curso' => $curso,
        ];
    }
}
