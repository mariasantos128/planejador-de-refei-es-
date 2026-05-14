// controller.js

let bancoPronto = false;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await iniciarBanco();
        bancoPronto = true;
        
        await adicionarReceitasPadrao();
        
        if (document.getElementById("grid-receitas")) {
            carregarReceitas();
        }
        
        if (document.getElementById("planejamento")) {
            popularSeletores();
        }

        if (document.getElementById("planejamento")) {
            popularSeletores();
            destacarDiaAtual(); // <--- ADICIONE ESTA LINHA AQUI
        }

        if (document.getElementById("lista-usuarios")) {
            carregarUsuarios();
        }

    } catch (err) {
        console.error("Erro ao iniciar a aplicação:", err);
    }
});

// --- SISTEMA DE NOTIFICAÇÕES ---
function mostrarNotificacao(mensagem, corFundo = "var(--cor-media)") {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    toast.style.backgroundColor = corFundo;
    toast.className = "mostrar";
    setTimeout(() => { toast.className = toast.className.replace("mostrar", ""); }, 3000);
}

// --- FUNÇÃO PARA INJETAR RECEITAS PADRÃO ATUALIZADA ---
async function adicionarReceitasPadrao() {
    // A proteção || [] garante que nunca dê erro no forEach
    const receitasAtuais = (await buscarItens()) || [];
    
    if (receitasAtuais.length === 0) {
        const receitasPadrao = [
            // CAFÉ DA MANHÃ
            { nome: "Pão com Ovo", categoria: "Café", ingredientes: "Pão francês, 1 ovo, manteiga", foto: "https://media.istockphoto.com/id/943148622/pt/foto/bread-with-scrambled-egg-brazilian-pao-com-ovo.webp?a=1&b=1&s=612x612&w=0&k=20&c=r-fjqQYmHu7JR8GhPBrlY-MuIZyWQmDwIwQVZvIdOVg=", gluten: true, lactose: true },
            { nome: "Cuscuz com Manteiga", categoria: "Café", ingredientes: "Flocão de milho, água, sal, manteiga", foto: "https://media.istockphoto.com/id/1304749748/pt/foto/brazilian-couscous-on-wooden-background-brazilian-breakfast-concept.jpg?s=612x612&w=0&k=20&c=DkJBjeivl_M7QLwKLSD-CRYRDkv3e4i5_KFCZ1Uya68=", gluten: false, lactose: true },
            { nome: "Tapioca com Queijo", categoria: "Café", ingredientes: "Massa de tapioca, queijo coalho ou mussarela", foto: "https://media.istockphoto.com/id/1256543084/pt/foto/tapioca-for-breakfast.jpg?s=612x612&w=0&k=20&c=AU62YE1mgTrK5ePN8qkNy1Pgmupqyuh2VEj2vNd1Ts8=", gluten: false, lactose: true },
            
            // ALMOÇO / JANTAR
            { nome: "Arroz, Feijão e Ovo", categoria: "Almoço", ingredientes: "Arroz branco, feijão carioca, 2 ovos fritos", foto: "https://media.istockphoto.com/id/491516552/pt/foto/arroz-e-feij%C3%B5es.jpg?s=612x612&w=0&k=20&c=1N4796xrpSpyXm_kTkbrRPqVlhdju8EhhwELpmHnbWs=", gluten: false, lactose: false },
            { nome: "Frango Grelhado com Arroz", categoria: "Almoço", ingredientes: "Peito de frango, arroz, salada de alface", foto: "https://media.istockphoto.com/id/2207230263/pt/foto/rice-beans-grilled-chicken-steak-salad-and-farofa.jpg?s=612x612&w=0&k=20&c=1uQOxbLjiZrLZU4gnoBX8xekTWORdQFNpvnKEjBmltA=", gluten: false, lactose: false },
            { nome: "Carne de Panela", categoria: "Jantar", ingredientes: "Acém ou músculo, batata, cenoura, molho de tomate", foto: "https://media.istockphoto.com/id/516816644/pt/foto/caseiras-lenta-cozinheiro-ca%C3%A7arola-com-carne-assada.jpg?s=612x612&w=0&k=20&c=MjBH3VKYVYOfNMDSj2OdoMiYbARIrxFZkVW8yJtAYrY=", gluten: false, lactose: false },
            { nome: "Macarrão com Carne Moída", categoria: "Jantar", ingredientes: "Macarrão espaguete, carne moída, molho", foto: "https://media.istockphoto.com/id/1215312647/pt/foto/pasta-fettuccine-with-beef-ragout-sauce-in-black-bowl-grey-background-close-up-top-view.jpg?s=612x612&w=0&k=20&c=EnfZd3RvJ7V8bWdekE9R714bMToUIi6O6i-hhh8YPfc=", gluten: true, lactose: false },
            
            // LANCHE
            { nome: "Fruta Picada", categoria: "Lanche", ingredientes: "Banana, maçã, mamão", foto: "https://media.istockphoto.com/id/501512015/pt/foto/fruta-fresca-de-mistura-de-salada.jpg?s=612x612&w=0&k=20&c=mmHCjiLl1kQD3NVksDZJAe1RNJDINxTnGPUf3fwowyg=", gluten: false, lactose: false },
            { nome: "Iogurte com Aveia", categoria: "Lanche", ingredientes: "Iogurte natural, aveia em flocos", foto: "https://media.istockphoto.com/id/1396570974/pt/foto/smoothie-bowl-topped-with-fresh-berries-and-granola.jpg?s=612x612&w=0&k=20&c=AthCJYjEiuRuJ3wMDjX0JxFeKAUS1juHsHRMkHgE47A=", gluten: true, lactose: true }
        ];

        for (const rec of receitasPadrao) {
            await adicionarItem(rec);
        }
    }
}

// --- VARIÁVEIS GLOBAIS ---
let categoriaAtual = "Todas";

// --- FUNÇÃO PARA NORMALIZAR TEXTO ---
function normalizarTexto(texto) {
    if (!texto) return "";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// --- FUNÇÃO PRINCIPAL: CARREGAR RECEITAS ---
async function renderizarReceitas(categoriaFiltrada = "Todas") {
    categoriaAtual = categoriaFiltrada;
    const grid = document.getElementById("grid-receitas");
    if (!grid) return; 

    const resultado = await buscarItens(); 
    // Garante que receitas seja sempre uma lista (evita o erro do forEach)
    const receitas = Array.isArray(resultado) ? resultado : (resultado ? [resultado] : []);
    const favoritos = JSON.parse(localStorage.getItem('meusFavoritos')) || [];

    grid.innerHTML = ""; 

    const receitasParaExibir = categoriaFiltrada === "Todas" 
        ? receitas 
        : receitas.filter(r => r.categoria === categoriaFiltrada);

    if (receitasParaExibir.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Nenhuma receita encontrada.</p>";
        return;
    }

    receitasParaExibir.forEach(rec => {
        const isFavorito = favoritos.includes(rec.id);
        const card = document.createElement("div");
        card.className = "receita-card";
        
        card.innerHTML = `
            <div class="card-foto" style="background-image: url('${rec.foto || 'https://via.placeholder.com/150'}')">
                <button class="btn-favorito" onclick="alternarFavorito(${rec.id}, event)">
                    <i class="material-symbols-outlined">${isFavorito ? 'favorite' : 'favorite_border'}</i>
                </button>
            </div>
            <div class="card-info">
                <span class="badge-categoria">${rec.categoria}</span>
                <h4>${rec.nome}</h4>
            </div>
        `;
        
        card.onclick = () => abrirModalReceita(rec);
        grid.appendChild(card);
    });
}

// Para manter compatibilidade se você chamar por outro nome
async function carregarReceitas(cat) { return renderizarReceitas(cat); }

// --- MODAL: ABRIR E FECHAR ---
function abrirModalReceita(receita) {
    const modal = document.getElementById("modal-receita");
    if (!modal) return;

    document.getElementById("modal-titulo").innerText = receita.nome;
    
    const campoMeta = document.getElementById("modal-meta");
    if (campoMeta) {
        campoMeta.innerHTML = `
            <span>⏱️ ${receita.tempo || '15 min'}</span>
            <span style="margin: 0 10px;">|</span>
            <span>👨‍🍳 ${receita.dificuldade || 'Fácil'}</span>
        `;
    }

    const lista = document.getElementById("modal-ingredientes");
    const textoIng = receita.ingredientes || "";
    const arrayIng = textoIng.split(',').filter(i => i.trim() !== "");
    lista.innerHTML = arrayIng.map(i => `<li>${i.trim()}</li>`).join("");

    document.getElementById("modal-passo").innerText = receita.passoAPasso || "Prepare com carinho! 👩‍🍳";

    modal.style.display = "flex"; 
}

// Gerenciador de cliques para fechar o modal
document.addEventListener('click', (e) => {
    const modal = document.getElementById("modal-receita");
    if (!modal) return;
    if (e.target.id === 'fechar-modal' || e.target === modal || e.target.classList.contains('close-button')) {
        modal.style.display = "none";
    }
});

// --- SALVAR RECEITA ---
const btnSalvar = document.getElementById("btn-salvar-receita");
if (btnSalvar) {
    btnSalvar.addEventListener("click", async () => {
        const novaRec = {
            nome: document.getElementById("rec-nome").value.trim(),
            categoria: document.getElementById("rec-categoria").value,
            ingredientes: document.getElementById("rec-ingredientes").value.trim(),
            foto: document.getElementById("rec-foto").value.trim(),
            tempo: document.getElementById("rec-tempo")?.value || "15 min",
            dificuldade: document.getElementById("rec-dificuldade")?.value || "Fácil",
            gluten: document.getElementById("rec-gluten").checked,
            lactose: document.getElementById("rec-lactose").checked
        };

        if (!novaRec.nome || !novaRec.ingredientes) {
            alert("Preencha nome e ingredientes!");
            return;
        }

        await adicionarItem(novaRec);
        alert("Receita salva!");
        renderizarReceitas();
    });
}

// --- FILTROS E FAVORITOS ---
function filtrarPorCategoria(cat) {
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
    if (event) event.target.classList.add('active');
    renderizarReceitas(cat);
}

function alternarFavorito(id, event) {
    event.stopPropagation();
    let favoritos = JSON.parse(localStorage.getItem('meusFavoritos')) || [];
    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(fId => fId !== id);
    } else {
        favoritos.push(id);
    }
    localStorage.setItem('meusFavoritos', JSON.stringify(favoritos));
    renderizarReceitas(categoriaAtual);
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        try {
            if (typeof adicionarReceitasPadrao === "function") await adicionarReceitasPadrao();
            await renderizarReceitas("Todas");
        } catch (e) { console.error(e); }
    }, 200);
});

// --- PLANEJAMENTO ---
// --- PLANEJAMENTO COM PERSISTÊNCIA ---
async function popularSeletores() {
    const tableRows = document.querySelectorAll("#planejamento tbody tr");
    if (tableRows.length === 0) return;

    const receitas = (await buscarItens()) || []; 
    
    // 1. Carrega o que está salvo no "banco" do navegador
    const planejamentoSalvo = JSON.parse(localStorage.getItem('meuPlanejamento')) || {};

    tableRows.forEach((row, rowIndex) => {
        const tdCategoria = row.querySelector("td[data-categoria]");
        if (!tdCategoria) return;

        const categoriaLinha = normalizarTexto(tdCategoria.dataset.categoria);
        const selects = row.querySelectorAll("select");
        
        const receitasFiltradas = receitas.filter(r => {
            const categoriaReceita = normalizarTexto(r.categoria);
            return categoriaReceita === categoriaLinha || categoriaReceita.includes(categoriaLinha);
        });

        selects.forEach((select, selectIndex) => {
            select.innerHTML = '<option value="">-- Selecione --</option>';
            
            receitasFiltradas.forEach(r => {
                const opt = document.createElement("option");
                opt.value = r.nome;
                opt.textContent = r.nome;
                select.appendChild(opt);
            });

            // 2. RECUPERAR: Verifica se existe um valor salvo para esta linha e este select específico
            const chaveUnica = `linha-${rowIndex}-select-${selectIndex}`;
            if (planejamentoSalvo[chaveUnica]) {
                select.value = planejamentoSalvo[chaveUnica];
            }

            // 3. SALVAR: Adiciona um evento para salvar sempre que o usuário mudar a opção
            select.addEventListener('change', (e) => {
                const novoPlanejamento = JSON.parse(localStorage.getItem('meuPlanejamento')) || {};
                novoPlanejamento[chaveUnica] = e.target.value;
                localStorage.setItem('meuPlanejamento', JSON.stringify(novoPlanejamento));
                console.log("💾 Escolha salva no navegador!");
            });
        });
    });
}

const btnSortear = document.getElementById("btn-sortear");
if (btnSortear) {
    btnSortear.addEventListener("click", async () => {
        const receitas = (await buscarItens()) || [];
        const rows = document.querySelectorAll("#planejamento tbody tr");
        let sorteouAlguma = false;
        
        // 1. Criamos um objeto para guardar o que vai ser sorteado agora
        // Pegamos o que já existe salvo para não apagar outras coisas
        const planejamentoSalvo = JSON.parse(localStorage.getItem('meuPlanejamento')) || {};

        rows.forEach((row, rowIndex) => { // Pegamos o rowIndex aqui
            const tdCategoria = row.querySelector("td[data-categoria]");
            if (!tdCategoria) return;

            const categoriaLinha = normalizarTexto(tdCategoria.dataset.categoria);
            const selects = row.querySelectorAll("select");
            
            const receitasFiltradas = receitas.filter(r => {
                const categoriaReceita = normalizarTexto(r.categoria);
                return categoriaReceita === categoriaLinha || categoriaReceita.includes(categoriaLinha);
            });

            if (receitasFiltradas.length > 0) {
                selects.forEach((select, selectIndex) => { // Pegamos o selectIndex aqui
                    const sorteada = receitasFiltradas[Math.floor(Math.random() * receitasFiltradas.length)];
                    select.value = sorteada.nome;
                    
                    // 2. SALVAMENTO: Criamos a mesma chave que a função popularSeletores usa
                    const chaveUnica = `linha-${rowIndex}-select-${selectIndex}`;
                    planejamentoSalvo[chaveUnica] = sorteada.nome;
                    
                    sorteouAlguma = true;
                });
            }
        });
        
        if (sorteouAlguma) {
            // 3. GRAVA NO LOCALSTORAGE: Só agora salvamos tudo de uma vez
            localStorage.setItem('meuPlanejamento', JSON.stringify(planejamentoSalvo));
            
            mostrarNotificacao("Cardápio sorteado! 🎲", "var(--cor-media)");
        } else {
            mostrarNotificacao("Cadastre receitas de Café, Almoço, Lanche e Jantar primeiro!", "#d64545");
        }
    });
}

/*=====================USUARIOS==========================*/
// --- FUNÇÃO PARA CARREGAR OS DADOS DO USUÁRIO LOGADO ---
function carregarPerfilLogado() {
    // 1. Pega o "pacote" que o login salvou
    const dadosSessao = localStorage.getItem('usuarioLogado');

    if (dadosSessao) {
        const usuario = JSON.parse(dadosSessao);

        // --- ATUALIZA A SIDEBAR (BARRA LATERAL) EM TODAS AS PÁGINAS ---
        const sidebarNome = document.getElementById('display-user-name');
        const sidebarAvatar = document.getElementById('user-initial');

        if (sidebarNome) sidebarNome.textContent = usuario.nome;
        if (sidebarAvatar) sidebarAvatar.textContent = usuario.nome.charAt(0).toUpperCase();

        // --- ATUALIZA A PÁGINA DE CONFIGURAÇÕES (SE ESTIVER NELA) ---
        const inputNome = document.getElementById('edit-nome');
        const inputEmail = document.getElementById('edit-email');
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const avatarGrande = document.getElementById('user-initial-large');

        if (inputNome) inputNome.value = usuario.nome;
        if (inputEmail) inputEmail.value = usuario.email;
        if (profileName) profileName.textContent = usuario.nome;
        if (profileEmail) profileEmail.textContent = usuario.email;
        if (avatarGrande) avatarGrande.textContent = usuario.nome.charAt(0).toUpperCase();

        // Marca os checkboxes de restrição nas configurações
        if (usuario.restricoes) {
            const checkboxes = document.querySelectorAll('.checkbox-grid-profile input');
            checkboxes.forEach(cb => {
                cb.checked = usuario.restricoes.includes(cb.value);
            });
        }
    } else {
        console.log("Nenhum usuário logado encontrado no localStorage.");
    }
}

// Executa essa função toda vez que QUALQUER página abrir
document.addEventListener('DOMContentLoaded', carregarPerfilLogado);

/*======================================================
// --- GESTÃO DE FAMÍLIA (VERSÃO FINAL UNIFICADA) ---
========================================================*/

async function carregarUsuarios() {
    const lista = document.getElementById("lista-membros-ui");
    if (!lista) return;

    // Busca do banco de dados (IndexedDB via db.js)
    const usuariosDoBanco = (await buscarUsuarios()) || [];
    lista.innerHTML = "";

    if (usuariosDoBanco.length === 0) {
        lista.innerHTML = "<p style='color: #888; padding: 20px; text-align: center;'>Nenhum membro na família ainda.</p>";
        return;
    }

    // Ordena: Admin primeiro
    usuariosDoBanco.sort((a, b) => (a.perfil === 'admin' ? -1 : 1));

    usuariosDoBanco.forEach(user => {
        const item = document.createElement("li");
        item.className = "member-item-list"; 

        // Gera as tags de restrição para cada pessoa
        const tagsHTML = user.restricoes && user.restricoes.length > 0 
            ? user.restricoes.map(r => `<span class="tag-restricao">${r}</span>`).join('')
            : '<span class="tag-nenhuma">Sem restrições</span>';

        const adminBadge = user.perfil === 'admin' ? '<span class="badge-admin">Admin</span>' : '';

        item.innerHTML = `
            <div class="member-info-wrapper">
                <div class="member-name-row">
                    <strong>${user.nome}</strong> ${adminBadge}
                </div>
                <div class="member-sub-row">
                    <small style="color: #666;">${user.email || "Sem e-mail"}</small>
                </div>
                <div class="member-tags-container" style="margin-top: 8px; display: flex; gap: 5px; flex-wrap: wrap;">
                    ${tagsHTML}
                </div>
            </div>
            <button class="btn-excluir-circle" onclick="removerUsuario(${user.id})" title="Remover" style="background:none; border:none; cursor:pointer; display: flex; align-items: center;">
                <span class="material-symbols-outlined" style="color: #ffcdd2; font-size: 20px;">delete</span>
            </button>
        `;
        lista.appendChild(item);
    });
}

// Evento de clique para Adicionar Membro
document.addEventListener("click", async (e) => {
    if (e.target.id === "btn-convidar") {
        const nomeInput = document.getElementById("nome_convite");
        const emailInput = document.getElementById("email_convite");
        const perfilInput = document.getElementById("perfil_convite");
        
        // Captura quais restrições foram marcadas para essa pessoa
        const checkboxes = document.querySelectorAll("#restricoes-membro-novo input:checked");
        const restricoesSelecionadas = Array.from(checkboxes).map(cb => cb.value);

        if (!nomeInput || !nomeInput.value.trim()) {
            alert("O nome do familiar é obrigatório!");
            return;
        }

        // Validação básica de e-mail
        if (emailInput.value && !emailInput.value.includes('@')) {
            alert("Por favor, insira um e-mail válido.");
            return;
        }

        const novoMembro = {
            nome: nomeInput.value.trim(),
            email: emailInput.value.trim(),
            perfil: perfilInput.value,
            restricoes: restricoesSelecionadas // Salvando o array de restrições
        };

        // Salva no banco de dados
        await adicionarUsuario(novoMembro);
        
        // Feedback visual
        if(typeof mostrarNotificacao === "function") {
            mostrarNotificacao(`✅ ${nomeInput.value} adicionado!`);
        }

        // Limpa o formulário
        nomeInput.value = "";
        if(emailInput) emailInput.value = "";
        checkboxes.forEach(cb => cb.checked = false);
        
        // Recarrega a lista atualizada
        carregarUsuarios();
    }
});

// Inicializa a lista ao carregar a página
document.addEventListener("DOMContentLoaded", carregarUsuarios);  


// --- FUNÇÃO PARA DESTACAR O DIA ATUAL NO CRONOGRAMA ---
function destacarDiaAtual() {
    const tabela = document.querySelector("#planejamento table");
    if (!tabela) return;

    // Pega o dia de hoje (0 = Domingo, 1 = Segunda, etc.)
    const diaJS = new Date().getDay();
    
    // Mapeia o dia para a coluna da nossa tabela 
    // Nossa tabela é: 0(Refeição), 1(Segunda), 2(Terça)... 7(Domingo)
    const colunasDaTabela = [7, 1, 2, 3, 4, 5, 6]; 
    const colunaAtual = colunasDaTabela[diaJS];

    // Escurece o cabeçalho (Segunda, Terça, etc)
    const ths = tabela.querySelectorAll("thead th");
    if (ths[colunaAtual]) {
        ths[colunaAtual].style.backgroundColor = "var(--cor-escura, #2A361A)";
        ths[colunaAtual].style.color = "#FFF";
    }

    // Escurece o fundo das opções de comida daquele dia
    const linhas = tabela.querySelectorAll("tbody tr");
    linhas.forEach(linha => {
        const tds = linha.querySelectorAll("td");
        if (tds[colunaAtual]) {
            tds[colunaAtual].style.backgroundColor = "rgba(42, 54, 26, 0.1)"; // Um tom escuro bem transparente
        }
    });
}

// ==========================================
// --- COMUNICAÇÃO ENTRE AS PÁGINAS E LISTA DE COMPRAS ---
// ==========================================

// 1. SALVAR AS ESCOLHAS: Toda vez que você mudar algo no planejamento, ele salva na memória
function salvarCardapioNaMemoria() {
    const selects = document.querySelectorAll("#planejamento tbody select");
    if (selects.length > 0) {
        const selecionados = Array.from(selects).map(s => s.value).filter(v => v !== "");
        localStorage.setItem("cardapioSalvo", JSON.stringify(selecionados));
    }
}

// Escuta quando você escolhe uma comida manualmente na tabela
document.addEventListener("change", (e) => {
    if (e.target.matches("#planejamento select")) {
        salvarCardapioNaMemoria();
    }
});

// Escuta quando você clica no botão de Sortear
document.addEventListener("click", (e) => {
    if (e.target.id === "btn-sortear") {
        setTimeout(salvarCardapioNaMemoria, 300);
    }
});

// 2. GERAR A LISTA NA PÁGINA DE COMPRAS
document.addEventListener("DOMContentLoaded", () => {
    const btnGerarCompras = document.getElementById("btn-gerar-compras");
    const containerLista = document.getElementById("conteudo-lista-compras");

    if (btnGerarCompras && containerLista) {
        btnGerarCompras.addEventListener("click", async () => {
            const comidasSelecionadas = JSON.parse(localStorage.getItem("cardapioSalvo")) || [];
            const receitasNoBanco = (await buscarItens()) || [];
            let ingredientesParaComprar = [];

            comidasSelecionadas.forEach(nomeReceita => {
                const receita = receitasNoBanco.find(r => r.nome === nomeReceita);
                if (receita && receita.ingredientes) {
                    const itens = receita.ingredientes.split(",").map(i => i.trim());
                    ingredientesParaComprar = ingredientesParaComprar.concat(itens);
                }
            });

            if (ingredientesParaComprar.length === 0) {
                containerLista.innerHTML = "<p style='color: #d64545; font-weight: bold;'>Nenhuma receita selecionada no Planejamento. Escolha os pratos lá primeiro!</p>";
                return;
            }

            const listaSemRepeticao = [...new Set(ingredientesParaComprar.filter(i => i !== ""))];

            const ul = document.createElement("ul");
            ul.style.listStyle = "none";
            ul.style.padding = "0";

           // Escreve os ingredientes na tela com checkbox para marcar
            listaSemRepeticao.forEach(item => {
                const li = document.createElement("li");
                li.style.padding = "12px";
                li.style.borderBottom = "1px solid #eee";
                li.style.display = "flex";
                li.style.alignItems = "center";
                li.style.gap = "10px";
                li.style.cursor = "pointer";

                // Cria o Checkbox
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.style.width = "18px";
                checkbox.style.height = "18px";
                checkbox.style.cursor = "pointer";

                // Texto do ingrediente
                const span = document.createElement("span");
                span.textContent = item;
                span.style.fontSize = "16px";

                // Evento para riscar o texto quando marcar o checkbox
                const alternarMarcacao = () => {
                    if (checkbox.checked) {
                        span.style.textDecoration = "line-through";
                        span.style.color = "#888";
                        li.style.backgroundColor = "#f9f9f9";
                    } else {
                        span.style.textDecoration = "none";
                        span.style.color = "#333";
                        li.style.backgroundColor = "transparent";
                    }
                };

                checkbox.addEventListener("change", alternarMarcacao);
                
                // Permite clicar na linha inteira para marcar
                li.onclick = (e) => {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                        alternarMarcacao();
                    }
                };

                li.appendChild(checkbox);
                li.appendChild(span);
                ul.appendChild(li);
            });
            
            containerLista.innerHTML = ""; 
            containerLista.appendChild(ul); 
            
            if (typeof mostrarNotificacao === "function") {
                mostrarNotificacao("Lista de ingredientes gerada!", "var(--cor-media)");
            }
        });
    }
});
  //SIDE BAR
  document.addEventListener('DOMContentLoaded', () => {
    const btnToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const body = document.body;

    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            body.classList.toggle('sidebar-collapsed');
        });
    }
});

// NO FINAL DO ARQUIVO controller.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Página carregada! Aguardando banco de dados...");
    
    // Pequeno intervalo para garantir que o db.js abriu a conexão
    setTimeout(() => {
        popularSeletores()
            .then(() => console.log("✅ Seletores preenchidos com sucesso!"))
            .catch(err => console.error("❌ Erro ao popular seletores:", err));
    }, 100); // 100ms é o suficiente para o IndexedDB acordar
});



// ESCUTADOR GLOBAL PARA FECHAR O MODAL
// Função isolada para fechar o modal
function fecharModal() {
    const modal = document.getElementById("modal-receita");
    if (modal) modal.style.display = "none";
}

// Escuta cliques no X e no fundo do modal
document.addEventListener('click', (e) => {
    const modal = document.getElementById("modal-receita");
    if (!modal) return;

    if (e.target.id === 'fechar-modal' || e.target === modal || e.target.classList.contains('close-button')) {
        fecharModal();
    }
});