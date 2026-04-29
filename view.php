<?php
// view.php
// Responsabilidade: renderizar a interface HTML do formulário de matrícula.

/**
 * @param array|null $resultado  Resultado retornado pelo Controller (ou null se GET)
 */
function renderView(?array $resultado = null): void {
    $mensagem = '';
    if ($resultado !== null) {
        $cor   = $resultado['sucesso'] ? '#4a7c2f' : '#d64545';
        $fundo = $resultado['sucesso'] ? '#eaf4e1' : '#fdecea';
        $mensagem = "
        <div style='background:{$fundo}; border-left: 5px solid {$cor}; padding: 15px 20px;
                    border-radius: 8px; margin-bottom: 25px; color: {$cor};'>
            {$resultado['mensagem']}
        </div>";
    }
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sabor Semanal 👨‍🍳 — Matrícula de Aluno</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap">
    <style>
        :root {
            --cor-fundo:  #EAEFDF;
            --cor-clara:  #CFE0BC;
            --cor-media:  #7FA653;
            --cor-escura: #63783D;
            --cor-texto:  #2A361A;
        }
        * { box-sizing: border-box; }
        body {
            font-family: 'Poppins', sans-serif;
            background: var(--cor-fundo);
            color: var(--cor-texto);
            margin: 0; padding: 0;
            min-height: 100vh;
            display: flex; flex-direction: column;
        }
        header {
            background: var(--cor-escura);
            padding: 20px;
            text-align: center;
        }
        header h1 { color: #fff; margin: 0; font-size: 24px; }

        main {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 40px 20px;
        }
        .card {
            background: #fff;
            border-radius: 16px;
            padding: 40px;
            width: 100%;
            max-width: 520px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.08);
        }
        .card h2 {
            color: var(--cor-escura);
            margin-top: 0;
            border-bottom: 2px solid var(--cor-clara);
            padding-bottom: 12px;
        }
        label {
            display: block;
            font-weight: 600;
            margin-bottom: 6px;
            font-size: 14px;
        }
        input[type="text"],
        input[type="number"],
        select {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--cor-clara);
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 15px;
            transition: border 0.3s;
        }
        input:focus, select:focus {
            outline: none;
            border-color: var(--cor-media);
            box-shadow: 0 0 0 3px rgba(127,166,83,0.2);
        }
        button[type="submit"] {
            background: var(--cor-media);
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 14px;
            width: 100%;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s, transform 0.2s;
        }
        button[type="submit"]:hover {
            background: var(--cor-texto);
            transform: translateY(-2px);
        }
        footer {
            text-align: center;
            padding: 16px;
            font-size: 13px;
            color: var(--cor-escura);
        }
    </style>
</head>
<body>
    <header>
        <h1>Sabor Semanal 👨‍🍳 — Sistema de Matrículas</h1>
    </header>

    <main>
        <div class="card">
            <h2>📋 Nova Matrícula</h2>

            <?= $mensagem ?>

            <form method="POST" action="/">
                <label for="nome">Nome completo:</label>
                <input type="text" id="nome" name="nome"
                       placeholder="Ex: Ana Paula Souza"
                       value="<?= htmlspecialchars($_POST['nome'] ?? '') ?>" required>

                <label for="idade">Idade:</label>
                <input type="number" id="idade" name="idade"
                       placeholder="Ex: 25" min="1" max="120"
                       value="<?= htmlspecialchars($_POST['idade'] ?? '') ?>" required>

                <label for="curso">Curso:</label>
                <select id="curso" name="curso" required>
                    <option value="">— Selecione um curso —</option>
                    <option value="Culinária Infantil"   <?= (($_POST['curso'] ?? '') === 'Culinária Infantil')   ? 'selected' : '' ?>>Culinária Infantil (mín. 10 anos)</option>
                    <option value="Confeitaria Básica"   <?= (($_POST['curso'] ?? '') === 'Confeitaria Básica')   ? 'selected' : '' ?>>Confeitaria Básica (mín. 14 anos)</option>
                    <option value="Gastronomia Avançada" <?= (($_POST['curso'] ?? '') === 'Gastronomia Avançada') ? 'selected' : '' ?>>Gastronomia Avançada (mín. 18 anos)</option>
                    <option value="Nutrição Esportiva"   <?= (($_POST['curso'] ?? '') === 'Nutrição Esportiva')   ? 'selected' : '' ?>>Nutrição Esportiva (mín. 16 anos)</option>
                </select>

                <button type="submit">Realizar Matrícula 🎓</button>
            </form>
        </div>
    </main>

    <footer>Sabor Semanal &copy; <?= date('Y') ?> — Projeto Sabor Semanal</footer>
</body>
</html>
<?php
}
