document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================
       1. SISTEMA DE USUÁRIOS (ADM PRIMEIRO) & CONVITE
       ========================================================== */
    let usuarios = [
        { nome: 'João (Você)', email: 'joao@email.com', perfil: 'membro' },
        { nome: 'Maria Silva', email: 'maria@email.com', perfil: 'admin' },
        { nome: 'Vó Teresa', email: 'teresa@email.com', perfil: 'membro' }
    ];

    function renderUsuarios() {
        const listaUI = document.getElementById('lista-membros-ui');
        listaUI.innerHTML = '';
        
        // Ordena: Admin vem primeiro
        usuarios.sort((a, b) => a.perfil === 'admin' ? -1 : 1);

        usuarios.forEach(u => {
            const li = document.createElement('li');
            li.style.padding = '8px';
            li.style.borderBottom = '1px solid #eee';
            const badge = u.perfil === 'admin' 
                ? '<span style="background: #d81b60; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-left: 10px;">Admin</span>' 
                : '<span style="background: #ccc; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-left: 10px;">Membro</span>';
            li.innerHTML = `<strong>${u.nome}</strong> - ${u.email} ${badge}`;
            listaUI.appendChild(li);
        });
    }

    renderUsuarios(); // Chama ao carregar a página

    // Simular o botão de convite (Já que não há Back-end para enviar e-mail real)
    document.getElementById('btn-convidar').addEventListener('click', () => {
        const emailInput = document.getElementById('email_convite');
        const perfilInput = document.getElementById('perfil_convite');
        const msgInfo = document.getElementById('msg-convite');

        if(emailInput.value.trim() === '') {
            alert('Por favor, digite um e-mail válido.');
            return;
        }

        // Adiciona à lista fictícia
        usuarios.push({
            nome: 'Convidado Pendente',
            email: emailInput.value,
            perfil: perfilInput.value
        });
        
        renderUsuarios(); // Atualiza a lista com a ordem correta

        // Feedback visual
        msgInfo.style.display = 'block';
        msgInfo.innerText = `Um e-mail de convite foi enviado para ${emailInput.value}! (Simulação)`;
        emailInput.value = '';
        
        setTimeout(() => msgInfo.style.display = 'none', 4000);
    });

    /* ==========================================================
       2. GESTÃO DE RECEITAS (SALVAR, EDITAR, LISTAR COM FOTOS)
       ========================================================== */
    // Foto padrão caso o usuário não coloque link
    const fotoPadrao = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';

    let receitasDb = [
        { id: 1, nome: 'Macarrão à Bolonhesa', categoria: 'Almoço', ingredientes: 'Macarrão, Carne Moída, Molho de Tomate', gluten: true, lactose: false, img: 'https://images.unsplash.com/photo-1621996311214-411db18903c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
        { id: 2, nome: 'Salada de Frutas', categoria: 'Lanche', ingredientes: 'Maçã, Banana, Laranja, Mel', gluten: false, lactose: false, img: 'https://images.unsplash.com/photo-1490474504059-1f1e15ab9822?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }
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
});