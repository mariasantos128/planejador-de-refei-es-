/* ==========================================================
   1. SISTEMA DE USUÁRIOS (ADM PRIMEIRO) & CONVITE
   ========================================================== */
// Puxa da memória ou começa vazio se for a primeira vez
let usuarios = JSON.parse(localStorage.getItem('membrosFamilyChef')) || [];

function renderUsuarios() {
    // CORRIGIDO: Padronizei o nome da variável para listaUI
    const listaUI = document.getElementById('lista-membros-ui');
    
    // TRAVA: Só executa se a listaUI existir na página
    if (!listaUI) return; 
    
    listaUI.innerHTML = '';
    
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

renderUsuarios(); 

// CORRIGIDO: Trava no botão de convidar
const btnConvidar = document.getElementById('btn-convidar');
if (btnConvidar) {
    btnConvidar.addEventListener('click', () => {
        const nomeInput = document.getElementById('nome_convite');
        const emailInput = document.getElementById('email_convite');
        const perfilInput = document.getElementById('perfil_convite');
        const msgInfo = document.getElementById('msg-convite');

        if(!nomeInput || !emailInput || nomeInput.value.trim() === '' || emailInput.value.trim() === '') {
            alert('Por favor, preencha o Nome e o E-mail antes de adicionar.');
            return;
        }

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(emailInput.value.trim())) {
            alert('Por favor, insira um endereço de e-mail válido (ex: nome@email.com).');
            return;
        }

        usuarios.push({
            nome: nomeInput.value.trim(),
            email: emailInput.value.trim(),
            perfil: perfilInput.value
        });
        
        // Salva a lista atualizada na memória do navegador!
        localStorage.setItem('membrosFamilyChef', JSON.stringify(usuarios));
        
        renderUsuarios();

        msgInfo.innerHTML = `✅ <strong>${nomeInput.value}</strong> foi adicionado(a) com sucesso!`;
        msgInfo.style.display = 'block';
        
        nomeInput.value = '';
        emailInput.value = '';
        perfilInput.value = 'membro';
        
        setTimeout(() => {
            msgInfo.style.display = 'none';
        }, 3500);
    });
}
    
/* ==========================================================
   2. GESTÃO DE RECEITAS (SALVAR, EDITAR, LISTAR COM FOTOS)
   ========================================================== */

let receitasDb = []; 

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await iniciarBanco(); 
        await atualizarTela();
    } catch (erro) {
        console.error("Erro ao iniciar DB:", erro);
    }
});

async function atualizarTela() {
    receitasDb = await buscarItens(); 
    renderReceitas(); 
    
}
function renderReceitas() {
    const grid = document.getElementById('grid-receitas');
    
    // CORRIGIDO: Troquei "lista" por "grid" na trava!
    if (!grid) return; 
    
    grid.innerHTML = '';
    
    // Adicionado proteção para não dar erro se o campo de busca não existir
    const campoBusca = document.getElementById('busca');
    const termoBusca = campoBusca ? campoBusca.value.toLowerCase() : '';

    receitasDb.forEach(rec => {
        if (!rec.nome.toLowerCase().includes(termoBusca) && !rec.categoria.toLowerCase().includes(termoBusca)) return;

        const card = document.createElement('div');
        card.className = 'receita-card';
        
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

        card.addEventListener('click', function(e) {
            if(e.target.tagName.toLowerCase() === 'button') return; 
            const detalhes = this.querySelector('.receita-detalhes');
            detalhes.style.display = detalhes.style.display === 'block' ? 'none' : 'block';
        });

        card.querySelector('.btn-editar').addEventListener('click', () => carregarEdicao(rec));

        grid.appendChild(card);
    });
    
    if (typeof atualizarSelectsCronograma === "function") {
        atualizarSelectsCronograma(); 
    }
}

// CORRIGIDO: Nome da variável alterado para evitar conflito com o controller.js
const inputBusca = document.getElementById('busca');
if (inputBusca) {
    inputBusca.addEventListener('input', renderReceitas);
} 


// CORRIGIDO: Trava no botão de salvar receita
const btnSalvarRec = document.getElementById('btn-salvar-receita');
if (btnSalvarRec) {
    btnSalvarRec.addEventListener('click', async () => {
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

        if(!foto) foto = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

        const receitaSalvar = { nome, categoria, ingredientes, gluten, lactose, img: foto };

        try {
            if (id) {
                await deletarItem(Number(id));
            }
            
            await adicionarItem(receitaSalvar); 
            alert(id ? 'Receita atualizada com sucesso!' : 'Receita salva com sucesso!');
            
            limparFormReceita();
            const detalhesForm = document.getElementById('detalhes-form-receita');
            if (detalhesForm) detalhesForm.removeAttribute('open');
            
            await atualizarTela(); 
        } catch (erro) {
            alert("Erro ao salvar a receita.");
        }
    });
}

function carregarEdicao(rec) {
    document.getElementById('detalhes-form-receita').setAttribute('open', 'true'); 
    document.getElementById('rec-id').value = rec.id;
    document.getElementById('rec-nome').value = rec.nome;
    document.getElementById('rec-categoria').value = rec.categoria;
    document.getElementById('rec-ingredientes').value = rec.ingredientes;
    
    // Removi a referência a fotoPadrao pois não estava declarada
    document.getElementById('rec-foto').value = rec.img;
    document.getElementById('rec-gluten').checked = rec.gluten;
    document.getElementById('rec-lactose').checked = rec.lactose;
    
    document.getElementById('detalhes-form-receita').scrollIntoView({ behavior: 'smooth' });
}

function limparFormReceita() {
    const campos = ['rec-id', 'rec-nome', 'rec-ingredientes', 'rec-foto'];
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const checks = ['rec-gluten', 'rec-lactose'];
    checks.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
    });
}

renderReceitas(); 

/* ==========================================================
   3. ATUALIZAÇÃO DO CRONOGRAMA SEMANAL
   ========================================================== */
function atualizarSelectsCronograma() {
    console.log("🕵️ Iniciando atualização do cronograma...");
    
    const areaPlanejamento = document.getElementById('planejamento');
    if (!areaPlanejamento) {
        console.log("❌ Tabela com id='planejamento' não encontrada nesta página.");
        return;
    }

    console.log(`✅ Tabela encontrada! Receitas carregadas do banco: ${receitasDb.length}`);

    const linhasTabela = document.querySelectorAll('#planejamento tbody tr');
    
    linhasTabela.forEach((linha, index) => {
        const selects = linha.querySelectorAll('select');
        const td = linha.querySelector('td');
        
        // Verifica se a tag <td> existe e se tem o data-categoria
        let catAlvo = td ? td.getAttribute('data-categoria') : null;
        
        if (!catAlvo) {
            console.log(`⚠️ Linha ${index + 1}: Sem atributo 'data-categoria'. Nenhuma opção será gerada aqui.`);
            return; // Pula essa linha se não tiver categoria
        }

        let opcoesParaPreencher = receitasDb.filter(r => r.categoria === catAlvo || r.categoria === 'Lanche');
        
        console.log(`🍽️ Linha ${index + 1} (Categoria: ${catAlvo}): Encontradas ${opcoesParaPreencher.length} opções.`);

        selects.forEach(select => {
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
   3.5. SISTEMA DE SORTEIO DE REFEIÇÕES (ALEATÓRIO)
   ========================================================== */
const btnSortear = document.getElementById('btn-sortear');
if (btnSortear) {
    btnSortear.addEventListener('click', () => {
        const linhasTabela = document.querySelectorAll('#planejamento tbody tr');
        
        if(receitasDb.length === 0) {
            alert('Você precisa cadastrar algumas receitas primeiro para poder sortear!');
            return;
        }

        linhasTabela.forEach((linha, index) => {
            const selects = linha.querySelectorAll('select');
            let catAlvo = linha.querySelector('td').getAttribute('data-categoria');
            let opcoesDisponiveis = receitasDb.filter(r => r.categoria === catAlvo || r.categoria === 'Lanche');
            
            if (opcoesDisponiveis.length > 0) {
                selects.forEach(select => {
                    const indiceAleatorio = Math.floor(Math.random() * opcoesDisponiveis.length);
                    select.value = opcoesDisponiveis[indiceAleatorio].nome;
                });
            }
        });
    });
}

/* ==========================================================
   4. LISTA DE COMPRAS
   ========================================================== */
const btnGerarCompras = document.getElementById('btn-gerar-compras');
if (btnGerarCompras) {
    btnGerarCompras.addEventListener('click', () => {
        const listaFinal = new Set();
        
        document.querySelectorAll('#planejamento select').forEach(select => {
            const pratoNome = select.value;
            if (pratoNome) {
                const receita = receitasDb.find(r => r.nome === pratoNome);
                if(receita) {
                    let ings = receita.ingredientes.split(',');
                    ings.forEach(ing => listaFinal.add(ing.trim()));
                }
            }
        });

        const containerLista = document.getElementById('conteudo-lista-compras');
        if (!containerLista) return;

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

        document.querySelectorAll('#conteudo-lista-compras li').forEach(li => {
            const checkbox = li.querySelector('input');
            const label = li.querySelector('label');
            checkbox.addEventListener('change', () => {
                label.style.textDecoration = checkbox.checked ? "line-through" : "none";
                label.style.color = checkbox.checked ? "#aaa" : "#333";
            });
        });
    });
}