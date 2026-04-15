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
            { nome: "Pão com Ovo", categoria: "Café", ingredientes: "Pão francês, 1 ovo, manteiga", foto: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=500", gluten: true, lactose: true },
            { nome: "Cuscuz com Manteiga", categoria: "Café", ingredientes: "Flocão de milho, água, sal, manteiga", foto: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?q=80&w=500", gluten: false, lactose: true },
            { nome: "Tapioca com Queijo", categoria: "Café", ingredientes: "Massa de tapioca, queijo coalho ou mussarela", foto: "https://images.unsplash.com/photo-1504113888839-1c8eb50233d3?q=80&w=500", gluten: false, lactose: true },
            
            // ALMOÇO / JANTAR
            { nome: "Arroz, Feijão e Ovo", categoria: "Almoço", ingredientes: "Arroz branco, feijão carioca, 2 ovos fritos", foto: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=500", gluten: false, lactose: false },
            { nome: "Frango Grelhado com Arroz", categoria: "Almoço", ingredientes: "Peito de frango, arroz, salada de alface", foto: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500", gluten: false, lactose: false },
            { nome: "Carne de Panela", categoria: "Jantar", ingredientes: "Acém ou músculo, batata, cenoura, molho de tomate", foto: "https://images.unsplash.com/photo-1534939561126-855b86141680?q=80&w=500", gluten: false, lactose: false },
            { nome: "Macarrão com Carne Moída", categoria: "Jantar", ingredientes: "Macarrão espaguete, carne moída, molho", foto: "https://images.unsplash.com/photo-1621996316541-0154080a527e?q=80&w=500", gluten: true, lactose: false },
            
            // LANCHE
            { nome: "Fruta Picada", categoria: "Lanche", ingredientes: "Banana, maçã, mamão", foto: "https://images.unsplash.com/photo-1582285141103-34e405a76da0?q=80&w=500", gluten: false, lactose: false },
            { nome: "Iogurte com Aveia", categoria: "Lanche", ingredientes: "Iogurte natural, aveia em flocos", foto: "https://images.unsplash.com/photo-1517093740263-149d8c474c10?q=80&w=500", gluten: true, lactose: true }
        ];

        for (const rec of receitasPadrao) {
            await adicionarItem(rec);
        }
    }
}

// --- GESTÃO DE RECEITAS ---
// --- GESTÃO DE RECEITAS ---
async function carregarReceitas() {
    const grid = document.getElementById("grid-receitas");
    if (!grid) return; 

    const receitas = (await buscarItens()) || [];
    grid.innerHTML = "";

    if (receitas.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1 / -1; text-align: center;'>Nenhuma receita cadastrada ainda. Adicione uma acima!</p>";
        return;
    }

    receitas.forEach(rec => {
        const card = document.createElement("div");
        card.className = "receita-card";
        
        const imagemPadrao = "https://images.unsplash.com/photo-1495195134817-a169d32d0391?q=80&w=500";
        const fotoUrl = rec.foto ? rec.foto : imagemPadrao;
        
        // Estilos para centralizar e deixar clicável
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.alignItems = "center";
        card.style.cursor = "pointer";

        card.innerHTML = `
            <img src="${fotoUrl}" class="receita-img" style="object-fit: cover; width: 130px; height: 130px; border-radius: 50%; border: 4px solid var(--cor-clara, #CFE0BC);">
            <h4 style="margin-top: 10px; text-align: center;">${rec.nome}</h4>
            
            <div class="receita-detalhes" style="display: none; width: 100%; margin-top: 15px; padding-top: 15px; border-top: 1px solid #ccc; text-align: left;">
                <p><small><strong>Categoria:</strong> ${rec.categoria}</small></p>
                <p><strong>Ingredientes:</strong> ${rec.ingredientes}</p>
                <p>${rec.gluten ? '🚫 Contém Glúten' : '✅ Sem Glúten'}</p>
                <p>${rec.lactose ? '🚫 Contém Lactose' : '✅ Sem Lactose'}</p>
                <button class="btn-excluir" style="width: 100%; margin-top: 10px;" onclick="removerReceita(${rec.id})">Excluir</button>
            </div>
        `;
        
        // Ação de clicar na foto/nome para revelar os detalhes
        card.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON') {
                const detalhes = card.querySelector('.receita-detalhes');
                detalhes.style.display = detalhes.style.display === 'block' ? 'none' : 'block';
            }
        };
        
        grid.appendChild(card);
    });
}

const btnSalvar = document.getElementById("btn-salvar-receita");
if (btnSalvar) {
    btnSalvar.addEventListener("click", async () => {
        const novaRec = {
            nome: document.getElementById("rec-nome").value.trim(),
            categoria: document.getElementById("rec-categoria").value,
            ingredientes: document.getElementById("rec-ingredientes").value.trim(),
            foto: document.getElementById("rec-foto").value.trim(),
            gluten: document.getElementById("rec-gluten").checked,
            lactose: document.getElementById("rec-lactose").checked
        };

        if (!novaRec.nome || !novaRec.ingredientes) {
            mostrarNotificacao("Preencha o nome e os ingredientes!", "#d64545");
            return;
        }

        await adicionarItem(novaRec);
        
        document.getElementById("rec-nome").value = "";
        document.getElementById("rec-foto").value = "";
        document.getElementById("rec-ingredientes").value = "";
        document.getElementById("rec-gluten").checked = false;
        document.getElementById("rec-lactose").checked = false;
        
        mostrarNotificacao("Receita cadastrada com sucesso! 🥗");
        carregarReceitas();
    });
}

async function removerReceita(id) {
    if (confirm("Tem certeza que deseja apagar essa receita?")) {
        await deletarItem(id);
        mostrarNotificacao("Receita excluída!", "#d64545");
        carregarReceitas();
    }
}

// --- FUNÇÃO PARA IGNORAR ACENTOS E MAIÚSCULAS ---
function normalizarTexto(texto) {
    if (!texto) return "";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// --- PLANEJAMENTO ---
async function popularSeletores() {
    const tableRows = document.querySelectorAll("#planejamento tbody tr");
    if (tableRows.length === 0) return;

    const receitas = (await buscarItens()) || []; 

    tableRows.forEach(row => {
        const tdCategoria = row.querySelector("td[data-categoria]");
        if (!tdCategoria) return;

        const categoriaLinha = normalizarTexto(tdCategoria.dataset.categoria);
        const selects = row.querySelectorAll("select");
        
        const receitasFiltradas = receitas.filter(r => {
            const categoriaReceita = normalizarTexto(r.categoria);
            return categoriaReceita === categoriaLinha || categoriaReceita.includes(categoriaLinha);
        });

        selects.forEach(select => {
            const valorAtual = select.value;
            select.innerHTML = '<option value="">-- Selecione --</option>';
            
            receitasFiltradas.forEach(r => {
                const opt = document.createElement("option");
                opt.value = r.nome;
                opt.textContent = r.nome;
                select.appendChild(opt);
            });

            if (valorAtual && receitasFiltradas.find(r => r.nome === valorAtual)) {
                select.value = valorAtual;
            }
        });
    });
}

const btnSortear = document.getElementById("btn-sortear");
if (btnSortear) {
    btnSortear.addEventListener("click", async () => {
        const receitas = (await buscarItens()) || [];
        const rows = document.querySelectorAll("#planejamento tbody tr");
        let sorteouAlguma = false;

        rows.forEach(row => {
            const tdCategoria = row.querySelector("td[data-categoria]");
            if (!tdCategoria) return;

            const categoriaLinha = normalizarTexto(tdCategoria.dataset.categoria);
            const selects = row.querySelectorAll("select");
            
            const receitasFiltradas = receitas.filter(r => {
                const categoriaReceita = normalizarTexto(r.categoria);
                return categoriaReceita === categoriaLinha || categoriaReceita.includes(categoriaLinha);
            });

            if (receitasFiltradas.length > 0) {
                selects.forEach(select => {
                    const sorteada = receitasFiltradas[Math.floor(Math.random() * receitasFiltradas.length)];
                    select.value = sorteada.nome;
                    sorteouAlguma = true;
                });
            }
        });
        
        if (sorteouAlguma) {
            mostrarNotificacao("Cardápio sorteado! 🎲", "var(--cor-media)");
        } else {
            mostrarNotificacao("Cadastre receitas de Café, Almoço, Lanche e Jantar primeiro!", "#d64545");
        }
    });
}

// --- LÓGICA DE LOGIN ---
const btnLogin = document.getElementById("btn-login");
if (btnLogin) {
    btnLogin.addEventListener("click", () => {
        const nome = document.getElementById("login-nome").value.trim();
        if (nome) {
            mostrarNotificacao("Bem-vindo(a), " + nome + "! 🌿", "var(--cor-escura)");
            setTimeout(() => { window.location.href = "usuarios.html"; }, 1500);
        } else {
            mostrarNotificacao("Por favor, digite seu nome para entrar!", "#d64545");
        }
    });
}

// --- GESTÃO DE USUÁRIOS ---
async function carregarUsuarios() {
    const lista = document.getElementById("lista-usuarios");
    if (!lista) return;

    const usuarios = (await buscarUsuarios()) || [];
    lista.innerHTML = "";

    if (usuarios.length === 0) {
        lista.innerHTML = "<p style='grid-column: 1 / -1; text-align: center;'>Nenhum membro cadastrado ainda.</p>";
        return;
    }

    usuarios.forEach(user => {
        const itemLista = document.createElement("li");
        
        itemLista.innerHTML = `
            <div>
                <strong>${user.nome}</strong> 
                <small>Restrições: ${user.restricoes || "Nenhuma"}</small>
            </div>
            <button class="btn-excluir" style="width: 100%;" onclick="removerUsuario(${user.id})">Remover</button>
        `;
        
        lista.appendChild(itemLista);
    });
}

const btnSalvarUsuario = document.getElementById("btn-salvar-usuario");
if (btnSalvarUsuario) {
    btnSalvarUsuario.addEventListener("click", async () => {
        const nomeUsuario = document.getElementById("user-nome").value.trim();
        const restricoes = document.getElementById("user-restricoes").value.trim();

        if (!nomeUsuario) {
            mostrarNotificacao("Preencha o nome do usuário!", "#d64545");
            return;
        }

        await adicionarUsuario({ nome: nomeUsuario, restricoes: restricoes });

        document.getElementById("user-nome").value = "";
        document.getElementById("user-restricoes").value = "";

        mostrarNotificacao("Usuário cadastrado com sucesso! 👨‍👩‍👧‍👦");
        carregarUsuarios(); 
    });
}

async function removerUsuario(id) {
    if (confirm("Tem certeza que deseja remover este membro da família?")) {
        await deletarUsuario(id);
        mostrarNotificacao("Usuário removido!", "#d64545");
        carregarUsuarios(); 
    }
}

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