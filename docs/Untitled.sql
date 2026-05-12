CREATE TABLE `usuarios` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `senha` varchar(255) NOT NULL,
  `criado_em` timestamp DEFAULT (now())
);

CREATE TABLE `receitas` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `categoria` varchar(255) COMMENT 'carne, massa, vegano, etc',
  `dificuldade` varchar(255),
  `tempo_preparo` varchar(255),
  `modo_preparo` text
);

CREATE TABLE `planejamento_semanal` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `usuario_id` integer,
  `receita_id` integer,
  `dia_semana` varchar(255),
  `refeicao` varchar(255) COMMENT 'almoco, jantar'
);

CREATE TABLE `lista_compras` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `usuario_id` integer,
  `item_nome` varchar(255),
  `categoria` varchar(255) COMMENT 'hortifruti, açougue, laticinios',
  `comprado` boolean DEFAULT false
);

ALTER TABLE `planejamento_semanal` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

ALTER TABLE `planejamento_semanal` ADD FOREIGN KEY (`receita_id`) REFERENCES `receitas` (`id`);

ALTER TABLE `lista_compras` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
