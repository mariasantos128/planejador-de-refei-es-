## Resumo CSS
CSS é uma linguagem usada para estilizar páginas HTML. 
Ele permite alterar cores, espaçamentos, tamanhos e layout.

Usar um arquivo externo como style.css é recomendado porque
organiza melhor o código e permite reutilizar estilos.

## Propriedades importantes
'color' - define a cor a determinado texto
background-color - define a cor do fundo do site

<link rel="stylesheet" href="style.css" - conecta o arquivo html com o css

'margin'  
Define o espaço externo do elemento, ou seja, a distância entre ele e outros elementos.

'padding' 
Define o espaço interno do elemento, ou seja, a distância entre o conteúdo e a borda.

'border' 
define o contorno de um elemento, permitindo ajustar border-width (espessura), border-style (tipo de linha) e border-color (cor)

'box-sizing' 
define como a largura (width) e a altura (height)

'@import url (link da fonte google fonts)
font-family: (fonte);'
define a fonte do arquivo

display: flex: ajuda a organizar elementos na página.

## Medidas px ou rem
-px (Pixel): Unidade absoluta. 
Bom para detalhes precisos, mas ruim para acessibilidade em fontes.

-rem (Root EM): Unidade relativa ao <html>
Se o usuário aumentar a fonte do navegador, o layout em rem se ajusta.

'text-align' 
centraliza o texto

'border-radius' 
arredondamento de elementos

'.styled-image img {
    width: 280px;
    height: 200px;'
    alterar o tamanho da imagem 


## Classes no CSS

As classes ajudam a aplicar estilos em elementos específicos.

Exemplo:

HTML
<p class="titulo">Texto</p>

CSS
.titulo {
 color: blue;
}
