/* ==========================================================
   CONTROLLER.JS - GESTÃO DE RECEITAS E INDEXEDDB
   ========================================================== */

const receitasPadrao = [
    { nome: 'Pão na Chapa com Manteiga', categoria: 'Café', ingredientes: 'Pão francês, manteiga', gluten: true, lactose: true, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
    { nome: 'Cuscuz com Ovo', categoria: 'Café', ingredientes: 'Flocão de milho, ovo, sal, manteiga', gluten: false, lactose: true, img: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
    { nome: 'Tapioca com Queijo', categoria: 'Café', ingredientes: 'Goma de tapioca, queijo coalho, sal', gluten: false, lactose: true, img: 'https://images.unsplash.com/photo-1528659588667-142277d33b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
    { nome: 'Arroz, Feijão e Frango', categoria: 'Almoço', ingredientes: 'Arroz, feijão, peito de frango, alho, cebola, óleo, sal', gluten: false, lactose: false, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
    { nome: 'Macarrão à Bolonhesa', categoria: 'Almoço', ingredientes: 'Macarrão, carne moída, molho de tomate, cebola, alho', gluten: true, lactose: false, img: 'https://images.unsplash.com/photo-1621996311214-411db18903c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
    { nome: 'Sopa de Legumes com Carne', categoria: 'Jantar', ingredientes: 'Batata, cenoura, chuchu, carne em cubos, macarrão, cebola, alho', gluten: true, lactose: false, img: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }
];

let receitasAtuais = []; 

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await iniciarBanco();
        await popularBancoInicial();
        await carregarReceitasDoBanco();
    } catch (erro) {
        console.error("Erro ao iniciar DB:", erro);
    }
});

// VERSÃO INTELIGENTE: Verifica se falta alguma receita padrão e adiciona!
async function popularBancoInicial() {
    const itens = await buscarItens(); 
    
    for (const padrao of receitasPadrao) {
        // Procura no banco se essa receita padrão específica já existe
        const jaExiste = itens.find(itemBanco => itemBanco.nome === padrao.nome);
        
        // Se não existir, adiciona no banco!
        if (!jaExiste) {
            await adicionarItem(padrao); 
        }
    }
}

async function carregarReceitasDoBanco() {
    receitasAtuais = await buscarItens(); 
    renderReceitas(receitasAtuais);
}

function renderReceitas(listaParaRenderizar) {
    const grid = document.getElementById('grid-receitas');
    grid.innerHTML = '';
    
    if (!listaParaRenderizar) listaParaRenderizar = receitasAtuais;

    listaParaRenderizar.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'receita-card';
        card.style.border = "1px solid #ccc";
        card.style.padding = "10px";
        card.style.marginTop = "10px";
        card.style.borderRadius = "8px";
        card.style.backgroundColor = "#fff";
        
        const alertaGluten = rec.gluten ? '<span style="color: red; font-size: 12px; margin-right: 5px;">⚠️ Contém Glúten</span>' : '';
        const alertaLactose = rec.lactose ? '<span style="color: orange; font-size: 12px;">⚠️ Contém Lactose</span>' : '';
        const imgHtml = rec.img ? `<img src="${rec.img}" alt="${rec.nome}" style="max-width: 100%; border-radius: 4px; max-height: 150px; object-fit: cover; display:block; margin-bottom: 10px;">` : "";

        card.innerHTML = `
            ${imgHtml}
            <h4>${rec.nome}</h4>
            <p><strong>Categoria:</strong> ${rec.categoria}</p>
            <div class="receita-detalhes" style="display: none;">
                <p style="white-space: pre-wrap;"><strong>Ingredientes:</strong><br>${rec.ingredientes}</p>
                <div style="margin-bottom: 10px;">${alertaGluten} ${alertaLactose}</div>
                <button class="btn-deletar" style="background: #ff4d4d; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; margin-top: 10px;">🗑️ Excluir</button>
            </div>
        `;

        card.addEventListener('click', function(e) {
            if(e.target.tagName.toLowerCase() === 'button') return; 
            const detalhes = this.querySelector('.receita-detalhes');
            detalhes.style.display = detalhes.style.display === 'block' ? 'none' : 'block';
        });

        card.querySelector('.btn-deletar').addEventListener('click', async () => {
             if(confirm(`Deseja realmente apagar a receita "${rec.nome}"?`)) {
                 await deletarItem(rec.id); 
                 await carregarReceitasDoBanco(); 
             }
        });

        grid.appendChild(card);
    });
    
    if (typeof atualizarSelectsCronograma === "function") {
        atualizarSelectsCronograma(); 
    }
}

document.getElementById('busca').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    const filtradas = receitasAtuais.filter(rec => 
        rec.nome.toLowerCase().includes(termo) || 
        rec.categoria.toLowerCase().includes(termo)
    );
    renderReceitas(filtradas);
});

// A função de salvar estava cortada no seu código, arrumei ela aqui:
document.getElementById('btn-salvar-receita').addEventListener('click', async () => {
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

    if(!foto) {
        foto = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"; 
    }

    const novaReceita = {
        nome: nome,
        categoria: categoria,
        ingredientes: ingredientes,
        img: foto,
        gluten: gluten,
        lactose: lactose
    };

    try {
        await adicionarItem(novaReceita); 
        alert('Receita adicionada ao livro com sucesso!');
        
        // Limpa o formulário
        document.getElementById('rec-nome').value = '';
        document.getElementById('rec-ingredientes').value = '';
        document.getElementById('rec-foto').value = '';
        document.getElementById('rec-gluten').checked = false;
        document.getElementById('rec-lactose').checked = false;
        
        // Fecha a aba de adicionar
        document.getElementById('detalhes-form-receita').removeAttribute('open');
        
        // Recarrega tudo do banco
        await carregarReceitasDoBanco(); 
    } catch (erro) {
        alert('Erro ao salvar no banco.');
    }
});