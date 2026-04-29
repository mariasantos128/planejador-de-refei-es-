function mostrarCadastro() {
    document.getElementById('box-login').style.display = 'none';
    document.getElementById('box-cadastro').style.display = 'block';
}

function mostrarLogin() {
    document.getElementById('box-cadastro').style.display = 'none';
    document.getElementById('box-login').style.display = 'block';
}

function entrarComoConvidado() {
    localStorage.setItem('usuarioAtivo', JSON.stringify({ nome: 'Convidado', tipo: 'visitante' }));
    alert("Entrando como convidado...");
    window.location.href = 'html/dashboard.html';
}

// Lógica de envio (Simulação)
document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const nomeUsuario = document.getElementById('login-email').value.split('@')[0]; // Pega o nome antes do @
    localStorage.setItem('nomeUsuario', nomeUsuario); // Salva o nome no localStorage
    alert("Login realizado!");
    window.location.href = 'html/dashboard.html';
});

document.getElementById('form-cadastro').addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Conta criada com sucesso!");
    mostrarLogin();
});