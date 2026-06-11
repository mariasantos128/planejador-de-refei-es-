// =========================================================================
// 1. CONFIGURAÇÕES INICIAIS, VARIÁVEIS GLOBAIS E INICIALIZAÇÃO DO BANCO
// =========================================================================

let bancoPronto = false;
let categoriaAtual = "Todas";

// Inicialização Principal Unificada do Sistema
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Garante que o banco de dados IndexedDB iniciou primeiro
        await iniciarBanco();
        bancoPronto = true;
        console.log("✅ Banco de dados IndexedDB pronto!");
        
        // 2. Injeta receitas padrão se o banco estiver vazio
        await adicionarReceitasPadrao();
        
        // 3. Executa a lógica de Receitas APENAS se estiver na página de receitas
        if (document.getElementById("grid-receitas")) {
            await renderizarReceitas("Todas");
        }
        
        // 4. Executa a lógica do Planejamento APENAS se a tabela existir na página
        if (document.getElementById("planejamento")) {
            await popularSeletores();
            destacarDiaAtual();
            console.log("✅ Cronograma e seletores carregados com sucesso!");
        }

        // 5. Executa a listagem da família apenas na página correta
        if (document.getElementById("lista-membros-ui")) {
            await carregarUsuarios();
        }

    } catch (err) {
        console.error("❌ Erro crítico ao iniciar a aplicação:", err);
    }
});



// =========================================================================
// 2. FUNÇÕES UTILITÁRIAS / AUXILIARES
// =========================================================================

// Normaliza textos removendo acentos e espaços extras
function normalizarTexto(texto) {
    if (!texto) return "";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Sistema de Notificações (Toast)
function mostrarNotificacao(mensagem, corFundo = "var(--cor-media)") {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message = mensagem;
    toast.style.backgroundColor = corFundo;
    toast.className = "mostrar";
    setTimeout(() => { toast.className = toast.className.replace("mostrar", ""); }, 3000);
}


// =========================================================================
// 3. MÓDULO: RECEITAS (CARREGAMENTO, CADASTRO E FILTROS) - VERSÃO PREMIUN UNIFICADA
// =========================================================================

// Injeta as receitas iniciais no banco de dados caso esteja vazio
async function adicionarReceitasPadrao() {
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
            { nome: "Fruta Picada", categoria: "Lanche", ingredientes: "Banana, maçã, mamão", foto: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=500&q=80", gluten: false, lactose: false },
            { nome: "Iogurte com Aveia", categoria: "Lanche", ingredientes: "Iogurte natural, aveia em flocos", foto: "https://media.istockphoto.com/id/1396570974/pt/foto/smoothie-bowl-topped-with-fresh-berries-and-granola.jpg?s=612x612&w=0&k=20&c=AthCJYjEiuRuJ3wMDjX0JxFeKAUS1juHsHRMkHgE47A=", gluten: true, lactose: true }
        ];

        for (const rec of receitasPadrao) {
            await adicionarItem(rec);
        }
    }
}

// Renderiza os cards de receita na tela utilizando a estrutura idêntica aos Favoritos
async function renderizarReceitas(categoriaFiltrada = "Todas") {
    categoriaAtual = categoriaFiltrada;
    const grid = document.getElementById("grid-receitas");
    if (!grid) return; 

    const resultado = await buscarItens(); 
    const receitas = Array.isArray(resultado) ? resultado : (resultado ? [resultado] : []);
    const favoritos = JSON.parse(localStorage.getItem('meusFavoritos')) || [];

    grid.innerHTML = ""; 

    const receitasParaExibir = categoriaFiltrada === "Todas" 
        ? receitas 
        : receitas.filter(r => r.categoria === categoriaFiltrada);

    if (receitasParaExibir.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; font-family: \"Poppins\", sans-serif; color: #777;'>Nenhuma receita encontrada.</p>";
        return;
    }

    receitasParaExibir.forEach(rec => {
        const idTratado = Number(rec.id) || rec.id;
        const isFavorito = favoritos.includes(idTratado);

        const article = document.createElement("article");
        article.className = "recipe-card";
        
        article.innerHTML = `
            <div class="recipe-img" style="background-image: url('${rec.foto || 'https://via.placeholder.com/150'}'); background-size: 100%; background-position: center; transition: background-size 0.4s ease;">
                <span class="material-symbols-outlined fav-badge ${isFavorito ? 'active-fav' : ''}" onclick="alternarFavorito(${rec.id}, event)" title="Favoritar">favorite</span>
            </div>
            <div class="recipe-content">
                <span class="recipe-category">${rec.categoria}</span>
                <h3 class="recipe-title">${rec.nome}</h3>
                <div class="recipe-meta">
                    <span><i class="material-symbols-outlined">schedule</i> ${rec.tempo || '25 min'}</span>
                    <span><i class="material-symbols-outlined">signal_cellular_alt</i> ${rec.dificuldade || 'Fácil'}</span>
                </div>
                <div class="recipe-footer">
                    <button class="btn-view" id="btn-ver-${rec.id}">Ver Receita</button>
                    <button class="btn-icon-action" title="Adicionar ao Planejamento">
                        <i class="material-symbols-outlined">calendar_add_on</i>
                    </button>
                </div>
            </div>
        `;
        
        const btnView = article.querySelector(`#btn-ver-${rec.id}`);
        if (btnView) {
            btnView.addEventListener("click", (e) => {
                e.stopPropagation(); 
                abrirModalReceita(rec);
            });
        }
        
        article.onclick = () => abrirModalReceita(rec);
        grid.appendChild(article);
    });
}

async function carregarReceitas(cat) { 
    return renderizarReceitas(cat); 
}

function filtrarPorCategoria(cat) {
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }
    renderizarReceitas(cat);
}

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

// =========================================================================
// 4. MÓDULO: MODAL DETALHES DA RECEITA
// =========================================================================

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

function fecharModal() {
    const modal = document.getElementById("modal-receita");
    if (modal) modal.style.display = "none";
}

document.addEventListener('click', (e) => {
    const modal = document.getElementById("modal-receita");
    if (!modal) return;
    if (e.target.id === 'fechar-modal' || e.target === modal || e.target.classList.contains('close-button')) {
        fecharModal();
    }
});


// =========================================================================
// 5. MÓDULO: FAVORITOS
// =========================================================================

// =========================================================================
// 5. MÓDULO: FAVORITOS (VERSÃO DIRETA NO CENTRO DA TELA)
// =========================================================================

// Cria uma mensagem simples bem no centro da tela, sem barras coloridas na lateral
function mensagemRapidaCentro(texto) {
    // Se já tiver uma mensagem na tela, remove para não acumular
    const avisoExistente = document.getElementById("aviso-centro-rapido");
    if (avisoExistente) avisoExistente.remove();

    const aviso = document.createElement("div");
    aviso.id = "aviso-centro-rapido";
    aviso.textContent = texto;

    // Estilização minimalista bem no centro da tela
    Object.assign(aviso.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "8px",
        fontSize: "16px",
        fontFamily: "'Poppins', sans-serif",
        fontWeight: "500",
        zIndex: "10000",
        pointerEvents: "none",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        transition: "opacity 0.2s ease"
    });

    document.body.appendChild(aviso);

    // Some rápido após 1.5 segundos
    setTimeout(() => {
        aviso.style.opacity = "0";
        setTimeout(() => aviso.remove(), 200);
    }, 1500);
}

// Alterna o estado de favorito de forma direta e sem recarregar a página inteira
function alternarFavorito(id, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const idTratado = Number(id) || id;
    let favoritos = JSON.parse(localStorage.getItem('meusFavoritos')) || [];
    
    const botaoCoracao = event ? event.target : null;
    
    if (favoritos.includes(idTratado)) {
        favoritos = favoritos.filter(fId => fId !== idTratado);
        localStorage.setItem('meusFavoritos', JSON.stringify(favoritos));
        
        if (botaoCoracao) {
            botaoCoracao.classList.remove('active-fav');
            botaoCoracao.style.fontVariationSettings = "'FILL' 0";
        }
        mensagemRapidaCentro("Removido dos favoritos 💔");
    } else {
        favoritos.push(idTratado);
        localStorage.setItem('meusFavoritos', JSON.stringify(favoritos));
        
        if (botaoCoracao) {
            botaoCoracao.classList.add('active-fav');
            botaoCoracao.style.fontVariationSettings = "'FILL' 1";
        }
        mensagemRapidaCentro("Adicionado aos favoritos ❤️");
    }
    
    if (document.getElementById("lista-favoritos")) {
        renderizarFavoritos();
    }
}
    
// Remove o favorito diretamente pela tela de favoritos
function removerFavorito(idReceita) {
    const id = Number(idReceita) || idReceita;
    let favoritos = JSON.parse(localStorage.getItem('meusFavoritos')) || [];
    
    favoritos = favoritos.filter(favId => favId !== id);
    localStorage.setItem('meusFavoritos', JSON.stringify(favoritos));
    
    mensagemRapidaCentro("Removido 💔");
    renderizarFavoritos();
}
// =========================================================================
// 6. MÓDULO: PLANEJAMENTO SEMANAL E SORTEIO
// =========================================================================

async function popularSeletores() {
    const tableRows = document.querySelectorAll("#planejamento tbody tr");
    if (tableRows.length === 0) return;

    const receitas = (await buscarItens()) || []; 
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

            const chaveUnica = `linha-${rowIndex}-select-${selectIndex}`;
            if (planejamentoSalvo[chaveUnica]) {
                select.value = planejamentoSalvo[chaveUnica];
            }

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
        const planejamentoSalvo = JSON.parse(localStorage.getItem('meuPlanejamento')) || {};

        rows.forEach((row, rowIndex) => {
            const tdCategoria = row.querySelector("td[data-categoria]");
            if (!tdCategoria) return;

            const categoriaLinha = normalizarTexto(tdCategoria.dataset.categoria);
            const selects = row.querySelectorAll("select");
            
            const receitasFiltradas = receitas.filter(r => {
                const categoriaReceita = normalizarTexto(r.categoria);
                return categoriaReceita === categoriaLinha || categoriaReceita.includes(categoriaLinha);
            });

            if (receitasFiltradas.length > 0) {
                selects.forEach((select, selectIndex) => {
                    const sorteada = receitasFiltradas[Math.floor(Math.random() * receitasFiltradas.length)];
                    select.value = sorteada.nome;
                    
                    const chaveUnica = `linha-${rowIndex}-select-${selectIndex}`;
                    planejamentoSalvo[chaveUnica] = sorteada.nome;
                    
                    sorteouAlguma = true;
                });
            }
        });
        
        if (sorteouAlguma) {
            localStorage.setItem('meuPlanejamento', JSON.stringify(planejamentoSalvo));
            mostrarNotificacao("Cardápio sorteado! 🎲", "var(--cor-media)");
        } else {
            mostrarNotificacao("Cadastre receitas de Café, Almoço, Lanche e Jantar primeiro!", "#d64545");
        }
    });
}

function destacarDiaAtual() {
    const tabela = document.querySelector("#planejamento table");
    if (!tabela) return;

    const diaJS = new Date().getDay();
    const colunasDaTabela = [7, 1, 2, 3, 4, 5, 6]; 
    const colunaAtual = colunasDaTabela[diaJS];

    const ths = tabela.querySelectorAll("thead th");
    if (ths[colunaAtual]) {
        ths[colunaAtual].style.backgroundColor = "var(--cor-escura, #2A361A)";
        ths[colunaAtual].style.color = "#FFF";
    }

    const linhas = tabela.querySelectorAll("tbody tr");
    linhas.forEach(linha => {
        const tds = linha.querySelectorAll("td");
        if (tds[colunaAtual]) {
            tds[colunaAtual].style.backgroundColor = "rgba(42, 54, 26, 0.1)";
        }
    });
}


// =========================================================================
// 7. MÓDULO: LISTA DE COMPRAS (INTEGRAÇÃO COM O PLANEJAMENTO)
// =========================================================================

function salvarCardapioNaMemoria() {
    const selects = document.querySelectorAll("#planejamento tbody select");
    if (selects.length > 0) {
        const selecionados = Array.from(selects).map(s => s.value).filter(v => v !== "");
        localStorage.setItem("cardapioSalvo", JSON.stringify(selecionados));
    }
}

document.addEventListener("change", (e) => {
    if (e.target.matches("#planejamento select")) {
        salvarCardapioNaMemoria();
    }
});

document.addEventListener("click", (e) => {
    if (e.target.id === "btn-sortear") {
        setTimeout(salvarCardapioNaMemoria, 300);
    }
});

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

            listaSemRepeticao.forEach(item => {
                const li = document.createElement("li");
                li.style.padding = "12px";
                li.style.borderBottom = "1px solid #eee";
                li.style.display = "flex";
                li.style.alignItems = "center";
                li.style.gap = "10px";
                li.style.cursor = "pointer";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.style.width = "18px";
                checkbox.style.height = "18px";
                checkbox.style.cursor = "pointer";

                const span = document.createElement("span");
                span.textContent = item;
                span.style.fontSize = "16px";

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


// =========================================================================
// 8. MÓDULO: SIDEBAR (INTERFACE E COMPORTAMENTO VISUAL)
// =========================================================================

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


// =========================================================================
// 9. MÓDULO: CONFIGURAÇÕES, GESTÃO DE USUÁRIOS E PERFIL REFEITO
// =========================================================================

document.addEventListener("DOMContentLoaded", async () => {
    const dadosSessao = localStorage.getItem('usuarioLogado');
    if (!dadosSessao) {
        console.log("Nenhum usuário logado encontrado no localStorage.");
        return;
    }

    const usuarioSessao = JSON.parse(dadosSessao);

    const sidebarNome = document.getElementById('display-user-name');
    const sidebarAvatar = document.getElementById('user-initial');
    if (sidebarNome) sidebarNome.textContent = usuarioSessao.nome;
    if (sidebarAvatar) sidebarAvatar.textContent = usuarioSessao.nome.charAt(0).toUpperCase();

    const formEditar = document.getElementById("form-editar-perfil");
    if (!formEditar) return; 

    if (usuarioSessao.email === "convidado@teste.com" || usuarioSessao.tipo === "visitante") {
        formEditar.querySelectorAll("input, button").forEach(el => el.disabled = true);
        const aviso = document.createElement("p");
        aviso.style.color = "red";
        aviso.style.marginTop = "15px";
        aviso.style.fontWeight = "bold";
        aviso.innerText = "Contas de convidado não podem alterar configurações do banco.";
        formEditar.appendChild(aviso);
        return;
    }

    try {
        const todosUsuarios = await buscarUsuarios();
        const usuarioAtual = todosUsuarios.find(u => u.email.toLowerCase() === usuarioSessao.email.toLowerCase());

        if (usuarioAtual) {
            document.getElementById('edit-nome').value = usuarioAtual.nome;
            document.getElementById('edit-email').value = usuarioAtual.email;
            document.getElementById('profile-name').textContent = usuarioAtual.nome;
            document.getElementById('profile-email').textContent = usuarioAtual.email;
            
            const avatarGrande = document.getElementById('user-initial-large');
            if (avatarGrande) avatarGrande.textContent = usuarioAtual.nome.charAt(0).toUpperCase();

            if (usuarioAtual.restricoes) {
                const checkboxes = formEditar.querySelectorAll('.restricao');
                checkboxes.forEach(cb => {
                    cb.checked = usuarioAtual.restricoes.includes(cb.value);
                });
            }
        }

        formEditar.addEventListener("submit", async (e) => {
            e.preventDefault();

            const novoNome = document.getElementById("edit-nome").value.trim();
            const novoEmail = document.getElementById("edit-email").value.trim();
            const novaSenha = document.getElementById("edit-senha").value;

            const checkboxesMarcados = formEditar.querySelectorAll(".restricao:checked");
            const novasRestricoes = Array.from(checkboxesMarcados).map(cb => cb.value);

            const senhaFinal = novaSenha !== "" ? novaSenha : (usuarioAtual ? usuarioAtual.senha : usuarioSessao.senha);

            const usuarioAtualizado = {
                id: usuarioAtual ? usuarioAtual.id : usuarioSessao.id,
                nome: novoNome,
                email: novoEmail,
                senha: senhaFinal,
                restricoes: novasRestricoes
            };

            if (typeof atualizarUsuarioNoBanco === "function") {
                await atualizarUsuarioNoBanco(usuarioAtualizado);
            } else {
                const transaction = db.transaction(["usuarios"], "readwrite");
                await new Promise((resolve) => {
                    const request = transaction.objectStore("usuarios").put(usuarioAtualizado);
                    request.onsuccess = () => resolve();
                });
            }

            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));

            alert("Configurações salvas e senha atualizada com sucesso!");
            window.location.reload();
        });

    } catch (error) {
        console.error("Falha ao sincronizar painel de controle de conta:", error);
    }
});

// =========================================================================
// 10. GESTÃO DA FAMÍLIA (Membros adicionais)
// =========================================================================

async function carregarUsuarios() {
    const lista = document.getElementById("lista-membros-ui");
    if (!lista) return;

    const usuariosDoBanco = (await buscarUsuarios()) || [];
    lista.innerHTML = "";

    if (usuariosDoBanco.length === 0) {
        lista.innerHTML = "<p style='color: #888; padding: 20px; text-align: center;'>Nenhum membro na família ainda.</p>";
        return;
    }

    usuariosDoBanco.sort((a, b) => (a.perfil === 'admin' ? -1 : 1));

    usuariosDoBanco.forEach(user => {
        const item = document.createElement("li");
        item.className = "member-item-list"; 

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

document.addEventListener("click", async (e) => {
    if (e.target.id === "btn-convidar") {
        const nomeInput = document.getElementById("nome_convite");
        const emailInput = document.getElementById("email_convite");
        const perfilInput = document.getElementById("perfil_convite");
        
        const checkboxes = document.querySelectorAll("#restricoes-membro-novo input:checked");
        const restricoesSelecionadas = Array.from(checkboxes).map(cb => cb.value);

        if (!nomeInput || !nomeInput.value.trim()) {
            alert("O nome do familiar é obrigatório!");
            return;
        }

        if (emailInput.value && !emailInput.value.includes('@')) {
            alert("Por favor, insira um e-mail válido.");
            return;
        }

        const novoMembro = {
            nome: nomeInput.value.trim(),
            email: emailInput.value.trim(),
            perfil: perfilInput.value,
            restricoes: restricoesSelecionadas
        };

        await adicionarUsuario(novoMembro);
        
        if(typeof mostrarNotificacao === "function") {
            mostrarNotificacao(`✅ ${nomeInput.value} adicionado!`);
        }

        nomeInput.value = "";
        if(emailInput) emailInput.value = "";
        checkboxes.forEach(cb => cb.checked = false);
        
        carregarUsuarios();
    }
});

document.addEventListener("DOMContentLoaded", carregarUsuarios);