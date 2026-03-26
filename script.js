/* ==========================================================
   1. SISTEMA DE USUÁRIOS (ADM PRIMEIRO) & CONVITE
   ========================================================== */

let usuarios = []; // Começa vazio!

function renderUsuarios() {
    const listaUI = document.getElementById('lista-membros-ui');
    listaUI.innerHTML = ''; // Limpa a lista antes de desenhar
    
    // Se não tiver ninguém, mostra um aviso amigável
    if (usuarios.length === 0) {
        listaUI.innerHTML = '<li style="color: #888; padding: 8px; font-style: italic;">Nenhum membro adicionado ainda.</li>';
        return;
    }

    // Ordena: Administrador vem primeiro
    usuarios.sort((a, b) => {
        if (a.perfil === 'admin' && b.perfil !== 'admin') return -1;
        if (a.perfil !== 'admin' && b.perfil === 'admin') return 1;
        return 0;
    });

    // Cria os itens na tela
    usuarios.forEach(u => {
        const li = document.createElement('li');
        li.style.padding = '10px 8px';
        li.style.borderBottom = '1px solid #eee';
        
        const badge = u.perfil === 'admin' 
            ? '<span style="background: #d81b60c4; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; margin-left: 10px; font-weight: bold;">Admin</span>' 
            : '<span style="background: #888; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; margin-left: 10px;">Membro</span>';
        
        li.innerHTML = `<strong>${u.nome}</strong> - ${u.email} ${badge}`;
        listaUI.appendChild(li);
    });
}

// Renderiza a lista vazia ao abrir a página
renderUsuarios(); 

// Quando clicar no botão de adicionar:
document.getElementById('btn-convidar').addEventListener('click', () => {
    const nomeInput = document.getElementById('nome_convite');
    const emailInput = document.getElementById('email_convite');
    const perfilInput = document.getElementById('perfil_convite');
    const msgInfo = document.getElementById('msg-convite');

    // Verifica se os campos existem e se foram preenchidos
    if(!nomeInput || !emailInput || nomeInput.value.trim() === '' || emailInput.value.trim() === '') {
        alert('Por favor, preencha o Nome e o E-mail antes de adicionar.');
        return;
    }

    // Salva o usuário na nossa lista
    usuarios.push({
        nome: nomeInput.value.trim(),
        email: emailInput.value.trim(),
        perfil: perfilInput.value
    });
    
    // Atualiza a lista na tela
    renderUsuarios(); 

    // Exibe a mensagem de SUCESSO
    msgInfo.innerHTML = `✅ <strong>${nomeInput.value}</strong> foi adicionado(a) com sucesso!`;
    msgInfo.style.display = 'block';
    
    // Limpa os campos para o próximo
    nomeInput.value = '';
    emailInput.value = '';
    perfilInput.value = 'membro';
    
    // Faz a mensagem sumir depois de 3.5 segundos
    setTimeout(() => {
        msgInfo.style.display = 'none';
    }, 3500);
});
    
   /* ==========================================================
   2. GESTÃO DE RECEITAS (SALVAR, EDITAR, LISTAR COM FOTOS)
   ========================================================== */

let receitasDb = [
    // CAFÉ DA MANHÃ
    { id: 1, nome: 'Pão na Chapa com Manteiga', categoria: 'Café', ingredientes: 'Pão francês, manteiga', gluten: true, lactose: true, 
      img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }, // Link da foto do pão
    
    { id: 2, nome: 'Cuscuz com Ovo', categoria: 'Café', ingredientes: 'Flocão de milho, ovo, sal, manteiga', gluten: false, lactose: true, 
      img: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }, // Link da foto
      
    { id: 3, nome: 'Tapioca com Queijo', categoria: 'Café', ingredientes: 'Goma de tapioca, queijo coalho, sal', gluten: false, lactose: true, 
      img: 'https://images.unsplash.com/photo-1528659588667-142277d33b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }, // Link da foto
    
    // ALMOÇO
    { id: 4, nome: 'Arroz, Feijão e Frango', categoria: 'Almoço', ingredientes: 'Arroz, feijão, peito de frango, alho, cebola, óleo, sal', gluten: false, lactose: false, 
      img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }, // Link da foto
      
    { id: 5, nome: 'Macarrão à Bolonhesa', categoria: 'Almoço', ingredientes: 'Macarrão, carne moída, molho de tomate, cebola, alho', gluten: true, lactose: false, 
      img: 'https://images.unsplash.com/photo-1621996311214-411db18903c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }, // Link da foto
      
    { id: 6, nome: 'Estrogonofe de Carne', categoria: 'Almoço', ingredientes: 'Carne em tiras, creme de leite, champignon, ketchup, mostarda, arroz, batata palha', gluten: false, lactose: true, 
      img: 'https://images.unsplash.com/photo-1606850245648-52fb18124237?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }, // Link da foto
    
    // JANTAR
    { id: 7, nome: 'Sopa de Legumes com Carne', categoria: 'Jantar', ingredientes: 'Batata, cenoura, chuchu, carne em cubos, macarrão, cebola, alho', gluten: true, lactose: false, 
      img: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }, // Link da foto
      
    { id: 8, nome: 'Omelete Recheado', categoria: 'Jantar', ingredientes: 'Ovo, queijo, presunto, tomate, orégano, sal', gluten: false, lactose: true, 
      img: 'https://images.unsplash.com/photo-1510693214829-1ee06798e188?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }, // Link da foto
      
    { id: 9, nome: 'Cachorro Quente', categoria: 'Jantar', ingredientes: 'Pão de hot dog, salsicha, molho de tomate, milho, batata palha', gluten: true, lactose: false, 
      img: 'https://images.unsplash.com/photo-1615486171430-848e0d9b439c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }, // Link da foto
    
    // LANCHE
    { id: 10, nome: 'Salada de Frutas', categoria: 'Lanche', ingredientes: 'Maçã, banana, mamão, laranja, mel', gluten: false, lactose: false, 
      img: 'https://images.unsplash.com/photo-1490474504059-1f1e15ab9822?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }, // Link da foto
      
    { id: 11, nome: 'Bolo de Fubá', categoria: 'Lanche', ingredientes: 'Fubá, farinha de trigo, açúcar, leite, ovo, óleo, fermento', gluten: true, lactose: true, 
      img: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' } // Link da foto
];

function renderReceitas() {
    const grid = document.getElementById('grid-receitas');
    grid.innerHTML = '';
    const termoBusca = document.getElementById('busca').value.toLowerCase();

    receitasDb.forEach(rec => {
        // Filtro de busca
        if (!rec.nome.toLowerCase().includes(termoBusca) && !rec.categoria.toLowerCase().includes(termoBusca)) return;

        const card = document.createElement('div');
        card.className = 'receita-card';
        
        // Verificação de alergias (usando lógica anterior)
        const alertaGluten = rec.gluten ? '<p style="color: red;"><strong>⚠️ Contém Glúten</strong></p>' : '';
        const alertaLactose = rec.lactose ? '<p style="color: red;"><strong>⚠️ Contém Lactose</strong></p>' : '';

        card.innerHTML = `
            <img src="${rec.img}" alt="${rec.nome}" class="receita-img">
            <h4>${rec.nome}</h4>
            <div class="receita-detalhes">
                <p><strong>Categoria:</strong> ${rec.categoria}</p>
                <p><strong>Ingredientes:</strong> ${rec.ingredientes}</p>
                ${alertaGluten}
                ${alertaLactose}
                <button class="btn-editar" data-id="${rec.id}">✏️ Editar</button>
            </div>
        `;

        // Interatividade: Mostrar detalhes só ao clicar no card
        card.addEventListener('click', function(e) {
            // Se clicou no botão de editar, não fecha/abre o card
            if(e.target.tagName.toLowerCase() === 'button') return; 
            
            const detalhes = this.querySelector('.receita-detalhes');
            detalhes.style.display = detalhes.style.display === 'block' ? 'none' : 'block';
        });

        // Ação do botão editar
        card.querySelector('.btn-editar').addEventListener('click', () => carregarEdicao(rec));

        grid.appendChild(card);
    });
    
    atualizarSelectsCronograma(); // Atualiza as opções do calendário
}

// Busca ao digitar
document.getElementById('busca').addEventListener('input', renderReceitas);

// Salvar Nova ou Editar Existente
document.getElementById('btn-salvar-receita').addEventListener('click', () => {
    const id = document.getElementById('rec-id').value;
    const nome = document.getElementById('rec-nome').value;
    const categoria = document.getElementById('rec-categoria').value;
    const ingredientes = document.getElementById('rec-ingredientes').value;
    let foto = document.getElementById('rec-foto').value;
    const gluten = document.getElementById('rec-gluten').checked;
    const lactose = document.getElementById('rec-lactose').checked;

    if(!nome || !ingredientes) {
        alert('Nome e ingredientes são obrigatórios!');
        return;
    }

    if(!foto) foto = fotoPadrao;

    if (id) {
        // Editando
        const index = receitasDb.findIndex(r => r.id == id);
        receitasDb[index] = { id: Number(id), nome, categoria, ingredientes, foto, gluten, lactose, img: foto };
        alert('Receita atualizada com sucesso!');
    } else {
        // Criando nova
        const novaId = receitasDb.length ? Math.max(...receitasDb.map(r => r.id)) + 1 : 1;
        receitasDb.push({ id: novaId, nome, categoria, ingredientes, gluten, lactose, img: foto });
        alert('Receita adicionada com sucesso!');
    }

    // Limpa o form e atualiza a tela
    limparFormReceita();
    document.getElementById('detalhes-form-receita').removeAttribute('open'); // Fecha o painel
    renderReceitas();
});

function carregarEdicao(rec) {
    document.getElementById('detalhes-form-receita').setAttribute('open', 'true'); // Abre o form
    document.getElementById('rec-id').value = rec.id;
    document.getElementById('rec-nome').value = rec.nome;
    document.getElementById('rec-categoria').value = rec.categoria;
    document.getElementById('rec-ingredientes').value = rec.ingredientes;
    document.getElementById('rec-foto').value = rec.img === fotoPadrao ? '' : rec.img;
    document.getElementById('rec-gluten').checked = rec.gluten;
    document.getElementById('rec-lactose').checked = rec.lactose;
    
    // Rola a tela suavemente para o formulário
    document.getElementById('detalhes-form-receita').scrollIntoView({ behavior: 'smooth' });
}

function limparFormReceita() {
    document.getElementById('rec-id').value = '';
    document.getElementById('rec-nome').value = '';
    document.getElementById('rec-ingredientes').value = '';
    document.getElementById('rec-foto').value = '';
    document.getElementById('rec-gluten').checked = false;
    document.getElementById('rec-lactose').checked = false;
}

renderReceitas(); // Chama renderização inicial

    /* ==========================================================
       3. ATUALIZAÇÃO DO CRONOGRAMA SEMANAL
       ========================================================== */
    function atualizarSelectsCronograma() {
        const linhasTabela = document.querySelectorAll('#planejamento tbody tr');
        
        linhasTabela.forEach((linha, index) => {
            const selects = linha.querySelectorAll('select');
            
            // Filtra as receitas baseadas na linha (Café, Almoço, Jantar)
            let catAlvo = index === 0 ? 'Café' : index === 1 ? 'Almoço' : 'Jantar';
            let opcoesParaPreencher = receitasDb.filter(r => r.categoria === catAlvo || r.categoria === 'Lanche');

            selects.forEach(select => {
                // Mantém a seleção atual se existir
                const valorAtual = select.value; 
                select.innerHTML = '<option value="">-- Selecione --</option>';
                
                opcoesParaPreencher.forEach(prato => {
                    const novaOpcao = document.createElement('option');
                    novaOpcao.value = prato.nome;
                    novaOpcao.textContent = prato.nome;
                    if(prato.nome === valorAtual) novaOpcao.selected = true;
                    select.appendChild(novaOpcao);
                });
            });
        });
    }

    /* ==========================================================
       4. LISTA DE COMPRAS
       ========================================================== */
    document.getElementById('btn-gerar-compras').addEventListener('click', () => {
        const listaFinal = new Set();
        
        document.querySelectorAll('#planejamento select').forEach(select => {
            const pratoNome = select.value;
            if (pratoNome) {
                // Encontra a receita no "Banco de Dados"
                const receita = receitasDb.find(r => r.nome === pratoNome);
                if(receita) {
                    // Separa os ingredientes por vírgula e adiciona à lista
                    let ings = receita.ingredientes.split(',');
                    ings.forEach(ing => listaFinal.add(ing.trim()));
                }
            }
        });

        const containerLista = document.getElementById('conteudo-lista-compras');
        if(listaFinal.size === 0) {
            containerLista.innerHTML = '<p style="color: red;">Selecione pratos no cronograma primeiro!</p>';
            return;
        }

        let html = '<ul style="text-align: left; display: inline-block;">';
        listaFinal.forEach(item => {
            html += `<li><input type="checkbox"> <label>${item}</label></li>`;
        });
        html += '</ul>';
        containerLista.innerHTML = html;

        // Adiciona evento de riscar o item comprado
        document.querySelectorAll('#conteudo-lista-compras li').forEach(li => {
            const checkbox = li.querySelector('input');
            const label = li.querySelector('label');
            checkbox.addEventListener('change', () => {
                label.style.textDecoration = checkbox.checked ? "line-through" : "none";
                label.style.color = checkbox.checked ? "#aaa" : "#333";
            });
        });
    });
