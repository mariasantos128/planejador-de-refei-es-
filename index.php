<?php
require_once 'php/Database.php';
require_once 'php/ReceitaRepository.php';
require_once 'php/ReceitaService.php';
require_once 'php/ReceitaController.php';
require_once 'php/middleware.php';

$mensagemErroBanco = "";

try {
    // Aqui ele vai tentar conectar e dar o erro "could not find driver"
    $pdo = Database::getInstance();
    
    $repository = new ReceitaRepository($pdo);
    $service    = new ReceitaService($repository);
    $controller = new ReceitaController($service);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $dadosSanitizados = sanitizarEntradaPost();
        $controller->store($dadosSanitizados);
    }

} catch (Exception $e) {
    // AQUI ESTÁ O PASSO 6! Capturamos o erro sem mostrar a tela feia do PHP
    $mensagemErroBanco = "Excelente! O sistema capturou um erro de banco de dados: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Planejador de Refeições</title>
</head>
<body>
    <h2>Planejador de Refeições (Modo Arquitetura)</h2>
    
    <?php if(!empty($mensagemErroBanco)): ?>
        <div style="background: #ffcccc; padding: 10px; border: 1px solid red;">
            <strong>Teste do Passo 6 concluído:</strong> <?php echo $mensagemErroBanco; ?>
        </div>
    <?php endif; ?>

    <br>
    <form method="POST" action="index.php">
        <label>Nome da Refeição:</label><br>
        <input type="text" name="nome"><br><br>
        
        <label>Ingredientes:</label><br>
        <input type="text" name="ingredientes"><br><br>
        
        <button type="submit">Salvar Refeição</button>
    </form>
</body>
</html>