<?php
// controller.php
// Responsabilidade: orquestrar Service → Model e decidir a resposta ao usuário.

require_once __DIR__ . '/model.php';
require_once __DIR__ . '/service.php';

class MatriculaController {

    private MatriculaService $service;

    public function __construct() {
        $this->service = new MatriculaService();
    }

    /**
     * Recebe os dados POST, aciona o Service e o Model,
     * e retorna um array com ['sucesso', 'mensagem', 'dados'].
     */
    public function processarMatricula(array $post): array {
        try {
            // 1. Service aplica as regras de negócio
            $dadosProcessados = $this->service->processarMatricula($post);

            // 2. Model salva no banco
            $aluno = new AlunoModel();
            $aluno->setNome($dadosProcessados['nome']);
            $aluno->setIdade($dadosProcessados['idade']);
            $aluno->setCurso($dadosProcessados['curso']);
            $aluno->save();

            // 3. Monta mensagem de sucesso
            $extra = $dadosProcessados['bolsa']
                ? ' 🎉 O aluno também ganhou <strong>bolsa de estudos</strong> por ser aluno sênior!'
                : '';

            return [
                'sucesso'  => true,
                'mensagem' => "✅ Matrícula de <strong>{$dadosProcessados['nome']}</strong> no curso 
                               <strong>{$dadosProcessados['curso']}</strong> realizada com sucesso!{$extra}",
                'dados'    => $dadosProcessados,
            ];

        } catch (Exception $e) {
            return [
                'sucesso'  => false,
                'mensagem' => $e->getMessage(),
                'dados'    => [],
            ];
        }
    }
}
