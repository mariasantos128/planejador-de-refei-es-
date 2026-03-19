// Aguarda o DOM carregar completamente antes de executar o código
document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================
       1. FILTRO DE BUSCA DE RECEITAS
       ========================================================== */
    const campoBusca = document.querySelector('#busca');
    const receitas = document.querySelectorAll('#receitas article');

    campoBusca.addEventListener('input', () => {
        const termoBusca = campoBusca.value.toLowerCase();
        receitas.forEach(receita => {
            const texto = receita.innerText.toLowerCase();
            receita.style.display = texto.includes(termoBusca) ? "block" : "none";
        });
    });

    /* ==========================================================
       2. ALERTA DE PERFIL (RESTRIÇÕES ALIMENTARES)
       ========================================================== */
    const checkGluten = document.querySelector('#gluten');
    const checkLactose = document.querySelector('#lactose');

    const verificarRestricoes = () => {
        const avisosPerigo = document.querySelectorAll('#receitas article p strong');
        avisosPerigo.forEach(aviso => {
            const textoAviso = aviso.parentElement.innerText;
            if (checkGluten.checked && textoAviso.includes("Glúten")) {
                aviso.parentElement.style.backgroundColor = "#fff3cd";
                aviso.parentElement.style.border = "2px solid red";
                aviso.parentElement.style.padding = "5px";
            } else {
                aviso.parentElement.style.backgroundColor = "transparent";
                aviso.parentElement.style.border = "none";
            }
        });
    };
    checkGluten.addEventListener('change', verificarRestricoes);
    checkLactose.addEventListener('change', verificarRestricoes);

    /* ==========================================================
       3. PREENCHER CARDÁPIO DA SEMANA TODA AUTOMATICAMENTE
       ========================================================== */
    const opcoesCafe = ["Omelete", "Pão com Ovo", "Panqueca de Aveia"];
    const opcoesAlmoco = ["Macarrão à Bolonhesa", "Salada Completa", "Frango Grelhado"];
    const opcoesJantar = ["Sopa de Legumes", "Lanche Natural", "Torta Salgada"];

    const linhasTabela = document.querySelectorAll('#planejamento tbody tr');
    
    linhasTabela.forEach((linha, index) => {
        const selects = linha.querySelectorAll('select');
        let opcoesParaPreencher = [];

        if (index === 0) opcoesParaPreencher = opcoesCafe;
        if (index === 1) opcoesParaPreencher = opcoesAlmoco;
        if (index === 2) opcoesParaPreencher = opcoesJantar;

        selects.forEach(select => {
            select.innerHTML = '<option value="">-- Selecione --</option>';
            opcoesParaPreencher.forEach(prato => {
                const novaOpcao = document.createElement('option');
                novaOpcao.value = prato;
                novaOpcao.textContent = prato;
                select.appendChild(novaOpcao);
            });
        });
    });

    /* ==========================================================
       4. DESTACAR O DIA DE HOJE E BOTÃO DE SORTEAR
       ========================================================== */
    const diaHoje = new Date().getDay(); 
    const colunaHoje = diaHoje === 0 ? 7 : diaHoje; 

    // Pinta a coluna de hoje
    document.querySelectorAll('#planejamento th')[colunaHoje].style.backgroundColor = '#d4edda';
    document.querySelectorAll('#planejamento tbody tr').forEach(linha => {
        linha.querySelectorAll('td')[colunaHoje].style.backgroundColor = '#f1fcf3';
    });

    // Cria o botão de sortear
    const btnPreencher = document.createElement('button');
    btnPreencher.type = 'button';
    btnPreencher.innerHTML = '🎲 Sortear Cardápio da Semana';
    btnPreencher.style.marginBottom = '15px';
    
    document.querySelector('#planejamento').insertBefore(btnPreencher, document.querySelector('#planejamento table'));

    btnPreencher.addEventListener('click', () => {
        document.querySelectorAll('#planejamento select').forEach(select => {
            const opcoes = select.querySelectorAll('option');
            if (opcoes.length > 1) {
                // Escolhe uma opção aleatória ignorando o "-- Selecione --"
                select.selectedIndex = Math.floor(Math.random() * (opcoes.length - 1)) + 1;
            }
        });
    });

    /* ==========================================================
       5. GERADOR AUTOMÁTICO DE LISTA DE COMPRAS
       ========================================================== */
    const ingredientesPorReceita = {
        "Omelete": { hortifruti: ["Tomate", "Cebola"], mercearia: ["Ovos", "Sal"] },
        "Pão com Ovo": { mercearia: ["Pão de Forma", "Ovos", "Manteiga"] },
        "Macarrão à Bolonhesa": { hortifruti: ["Cebola"], acougue: ["500g de Carne Moída"], mercearia: ["Macarrão", "Molho de Tomate"] },
        "Salada Completa": { hortifruti: ["Alface", "Tomate", "Cenoura"], mercearia: ["Azeite"] },
        "Sopa de Legumes": { hortifruti: ["Batata", "Cenoura", "Chuchu"], acougue: ["Músculo em cubos"] }
    };

    const btnGerarLista = document.querySelector('#compras button');

    btnGerarLista.addEventListener('click', () => {
        const listaFinal = { hortifruti: new Set(), acougue: new Set(), mercearia: new Set() };
        
        document.querySelectorAll('#planejamento select').forEach(select => {
            const prato = select.value;
            if (prato && ingredientesPorReceita[prato]) {
                const ing = ingredientesPorReceita[prato];
                if (ing.hortifruti) ing.hortifruti.forEach(i => listaFinal.hortifruti.add(i));
                if (ing.acougue) ing.acougue.forEach(i => listaFinal.acougue.add(i));
                if (ing.mercearia) ing.mercearia.forEach(i => listaFinal.mercearia.add(i));
            }
        });

        desenharListaDeCompras(listaFinal);
    });

    function desenharListaDeCompras(lista) {
        const secaoCompras = document.querySelector('#compras');
        let novoHTML = `<h2>4. Lista de Compras</h2><button type="button" id="btn-gerar-novamente">Gerar Lista com Base no Cronograma</button>`;

        const criarSetor = (nome, itens) => {
            if (itens.size === 0) return '';
            let html = `<h3>Setor: ${nome}</h3><ul>`;
            itens.forEach(item => html += `<li><input type="checkbox"> <label>${item}</label></li>`);
            return html + `</ul>`;
        };

        novoHTML += criarSetor('Hortifruti', lista.hortifruti);
        novoHTML += criarSetor('Açougue', lista.acougue);
        novoHTML += criarSetor('Mercearia', lista.mercearia);

        secaoCompras.innerHTML = novoHTML;

        // Reativa o clique para riscar os itens da lista
        document.querySelectorAll('#compras li').forEach(item => {
            const checkbox = item.querySelector('input');
            const label = item.querySelector('label');
            checkbox.addEventListener('change', () => {
                label.style.textDecoration = checkbox.checked ? "line-through" : "none";
                label.style.color = checkbox.checked ? "#888" : "#333";
            });
        });
        
        document.querySelector('#btn-gerar-novamente').addEventListener('click', () => btnGerarLista.click());
    }
});