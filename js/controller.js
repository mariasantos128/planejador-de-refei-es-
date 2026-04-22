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

// --- GESTÃO DE USUÁRIOS (VERSÃO CORRIGIDA) ---
async function carregarUsuarios() {
    // 1. Corrigido para o ID correto da lista no HTML
    const lista = document.getElementById("lista-membros-ui");
    if (!lista) return;

    // Busca do banco de dados (certifique-se que buscarUsuarios existe no db.js)
    const usuarios = (await buscarUsuarios()) || [];
    lista.innerHTML = "";

    if (usuarios.length === 0) {
        lista.innerHTML = "<p>Nenhum membro cadastrado ainda.</p>";
        return;
    }

    usuarios.forEach(user => {
        const item = document.createElement("li");
        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.style.alignItems = "center";
        item.style.padding = "10px";
        item.style.borderBottom = "1px solid #eee";

        item.innerHTML = `
            <div>
                <strong>${user.nome}</strong><br>
                <small style="color: #666;">E-mail: ${user.email || "Não informado"} | Perfil: ${user.perfil || "Membro"}</small>
            </div>
            <button class="btn-excluir" onclick="removerUsuario(${user.id})" 
                    style="background:#d64545; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">
                Remover
            </button>
        `;
        lista.appendChild(item);
    });
}

// Escuta o clique no botão de salvar usuário
document.addEventListener("click", async (e) => {
    // 2. Corrigido para o ID do botão no HTML
    if (e.target.id === "btn-convidar") {
        
        // 3. Pegando os IDs corretos do HTML
        const nomeInput = document.getElementById("nome_convite");
        const emailInput = document.getElementById("email_convite");
        const perfilInput = document.getElementById("perfil_convite");

        if (!nomeInput.value.trim()) {
            // Se a função mostrarNotificacao não existir ou estiver dando erro, use um alert por enquanto:
            // alert("O nome é obrigatório!");
            if(typeof mostrarNotificacao === "function") {
                mostrarNotificacao("O nome é obrigatório!", "#d64545");
            }
            return;
        }

        // Criando o objeto com os dados exatos do seu formulário
        const novoUser = {
            nome: nomeInput.value.trim(),
            email: emailInput.value.trim(),
            perfil: perfilInput.value
        };

        // Chama a função do IndexedDB
        await adicionarUsuario(novoUser);
        
        // Limpa os campos depois de salvar
        nomeInput.value = "";
        emailInput.value = "";
        
        if(typeof mostrarNotificacao === "function") {
            mostrarNotificacao("Usuário adicionado! 👨‍👩‍👧‍👦");
        }
        
        // Recarrega a lista na tela
        carregarUsuarios();
    }
});

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