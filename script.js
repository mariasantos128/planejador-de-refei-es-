// Aguarda o DOM carregar completamente antes de executar o código
document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================
       IDEIA 1: FILTRO DE BUSCA DE RECEITAS
       Filtra as receitas em tempo real conforme o usuário digita.
       ========================================================== */
    const campoBusca = document.querySelector('#busca');
    const btnFiltrar = document.querySelector('#receitas button[type="button"]'); // Botão filtrar
    const receitas = document.querySelectorAll('#receitas article');

    const filtrarReceitas = () => {
        const termoBusca = campoBusca.value.toLowerCase();

        receitas.forEach(receita => {
            const titulo = receita.querySelector('h4').innerText.toLowerCase();
            const categoria = receita.querySelector('p').innerText.toLowerCase();
            
            // Se o termo estiver no título ou na categoria, mostra; senão, esconde
            if (titulo.includes(termoBusca) || categoria.includes(termoBusca)) {
                receita.style.display = "block";
            } else {
                receita.style.display = "none";
            }
        });
    };

    // Filtra enquanto digita e também ao clicar no botão
    campoBusca.addEventListener('input', filtrarReceitas);
    btnFiltrar.addEventListener('click', filtrarReceitas);


    /* ==========================================================
       IDEIA 2: CHECKLIST INTERATIVO (LISTA DE COMPRAS)
       Risca o item da lista quando o checkbox é marcado.
       ========================================================== */
    const itensCompra = document.querySelectorAll('#compras li');

    itensCompra.forEach(item => {
        const checkbox = item.querySelector('input');
        const label = item.querySelector('label');

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                label.style.textDecoration = "line-through";
                label.style.color = "#888"; // Cinza claro
            } else {
                label.style.textDecoration = "none";
                label.style.color = "#333"; // Cor padrão
            }
        });
    });


    /* ==========================================================
       IDEIA 3: ALERTA DE PERFIL (RESTRIÇÕES ALIMENTARES)
       Destaque visual se o usuário marcar uma restrição que 
       conflite com uma receita visível.
       ========================================================== */
    const checkGluten = document.querySelector('#gluten');
    const checkLactose = document.querySelector('#lactose');

    const verificarRestricoes = () => {
        const avisosPerigo = document.querySelectorAll('#receitas article p strong');

        avisosPerigo.forEach(aviso => {
            const textoAviso = aviso.parentElement.innerText; // Pega o texto do parágrafo ⚠️
            
            // Se o checkbox de Glúten está marcado e a receita contém glúten
            if (checkGluten.checked && textoAviso.includes("Glúten")) {
                aviso.parentElement.style.backgroundColor = "#fff3cd"; // Fundo amarelo alerta
                aviso.parentElement.style.border = "2px solid red";
                aviso.parentElement.style.padding = "5px";
            } 
            // Se o checkbox de Lactose está marcado e a receita contém lactose (lógica futura)
            else if (checkLactose.checked && textoAviso.includes("Lactose")) {
                aviso.parentElement.style.backgroundColor = "#fff3cd";
                aviso.parentElement.style.border = "2px solid red";
            }
            else {
                // Reseta o estilo se o checkbox for desmarcado
                aviso.parentElement.style.backgroundColor = "transparent";
                aviso.parentElement.style.border = "none";
            }
        });
    };

    checkGluten.addEventListener('change', verificarRestricoes);
    checkLactose.addEventListener('change', verificarRestricoes);


    /* ==========================================================
       EXTRA: FEEDBACK DE CONVITE
       Apenas para dar uma resposta visual ao botão de convite.
       ========================================================== */
    const btnConvite = document.querySelector('#usuario button');
    const inputConvite = document.querySelector('#email_convite');

    btnConvite.addEventListener('click', () => {
        if (inputConvite.value !== "") {
            alert(`Convite enviado com sucesso para: ${inputConvite.value}`);
            inputConvite.value = "";
        } else {
            alert("Por favor, digite um e-mail válido.");
        }
    });

});