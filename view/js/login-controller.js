function mostrarCadastro() {
    document.getElementById('box-login').style.display = 'none';
    document.getElementById('box-cadastro').style.display = 'block';
}

function mostrarLogin() {
    document.getElementById('box-cadastro').style.display = 'none';
    document.getElementById('box-login').style.display = 'block';
}

function entrarComoConvidado() {
    const usuario = { 
        nome: 'Convidado', 
        email: 'convidado@teste.com',
        tipo: 'visitante',
        restricoes: [] 
    };
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    alert("Entrando como convidado...");
    
    // CORRIGIDO: Avança da raiz (index.html) para dentro de view/html/
    window.location.href = 'view/html/dashboard.html';
}

// =======================================================
// LÓGICA DE LOGIN REAL (Integrada com IndexedDB)
// =======================================================
const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const campoSenha = document.getElementById('login-senha');
        const senha = campoSenha ? campoSenha.value : '';
        
        try {
            const usuariosCadastrados = await buscarUsuarios();
            
            const usuarioEncontrado = usuariosCadastrados.find(
                u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
            );

            if (usuarioEncontrado) {
                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
                alert(`Login realizado! Bem-vindo(a), ${usuarioEncontrado.nome}!`);
                
                // CORRIGIDO: Avança da raiz (index.html) para dentro de view/html/
                window.location.href = 'view/html/dashboard.html';
            } else {
                alert("E-mail ou senha incorretos! Verifique seus dados ou crie uma nova conta.");
            }
        } catch (error) {
            console.error("Erro ao validar login:", error);
            alert("Ocorreu um erro ao conectar com o banco de dados.");
        }
    });
}

// =======================================================
// LÓGICA DE CADASTRO REAL (Integrada com IndexedDB)
// =======================================================
const formCadastro = document.getElementById('form-cadastro');
if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('cad-nome').value.trim();
        const email = document.getElementById('cad-email').value.trim();
        const campoSenhaCadastro = document.getElementById('cad-senha');
        const senha = campoSenhaCadastro ? campoSenhaCadastro.value : '';
        
        const checkboxes = document.querySelectorAll('.restricao:checked');
        const restricoes = Array.from(checkboxes).map(cb => cb.value);

        const novoUsuario = {
            nome: nome,
            email: email,
            senha: senha,
            restricoes: restricoes
        };

        try {
            const usuariosExistentes = await buscarUsuarios();
            const emailJaExiste = usuariosExistentes.some(u => u.email.toLowerCase() === email.toLowerCase());

            if (emailJaExiste) {
                alert("Este e-mail já está cadastrado por outro usuário!");
                return;
            }

            await adicionarUsuario(novoUsuario);
            localStorage.setItem('usuarioLogado', JSON.stringify(novoUsuario));
            
            alert("Conta criada com sucesso! Redirecionando...");
            
            // CORRIGIDO: Avança da raiz (index.html) para dentro de view/html/
            window.location.href = 'view/html/dashboard.html';
            
        } catch (error) {
            console.error("Erro ao realizar cadastro:", error);
            alert("Erro ao tentar salvar os dados no banco de dados.");
        }
    });
}