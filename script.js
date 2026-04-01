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

let receitasDb = []; // Começa vazio, pois vai puxar do Banco de Dados!

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await iniciarBanco(); // Chama a função do seu db.js
        await atualizarTela();
    } catch (erro) {
        console.error("Erro ao iniciar DB:", erro);
    }
});

async function atualizarTela() {
    receitasDb = await buscarItens(); // Puxa as receitas salvas no IndexedDB
    renderReceitas(); // Desenha elas na tela
}

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
// Salvar Nova ou Editar Existente (AGORA COM BANCO DE DADOS!)
document.getElementById('btn-salvar-receita').addEventListener('click', async () => {
    const id = document.getElementById('rec-id').value; // Puxa o ID para saber se é edição
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

    // Se o usuário não colocar foto, usa uma padrão
    if(!foto) foto = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

    const receitaSalvar = { 
        nome, 
        categoria, 
        ingredientes, 
        gluten, 
        lactose, 
        img: foto 
    };

    try {
        if (id) {
            // Se tem ID, é porque estamos EDITANDO. 
            // Então deletamos a versão velha do banco antes de salvar a nova!
            await deletarItem(Number(id));
        }
        
        await adicionarItem(receitaSalvar); // Salva no banco de verdade
        alert(id ? 'Receita atualizada com sucesso!' : 'Receita salva com sucesso!');
        
        limparFormReceita();
        document.getElementById('detalhes-form-receita').removeAttribute('open');
        
        await atualizarTela(); // Recarrega a lista puxando do banco
    } catch (erro) {
        alert("Erro ao salvar a receita.");
    }
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
