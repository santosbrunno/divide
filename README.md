# 🚗 Divide - Caronas Inteligentes em Santa Catarina

O **Divide** é uma plataforma de caronas compartilhadas focada na região de Santa Catarina (Blumenau, Pomerode, Timbó e região). O sistema conecta motoristas que desejam dividir custos de viagem com passageiros que buscam uma forma econômica, segura e sustentável de se deslocar.

## 🏗️ Estrutura do Projeto

O projeto é dividido em dois grandes módulos:
- **/Divide**: Aplicativo mobile desenvolvido em React Native (Expo).
- **/server**: Servidor backend desenvolvido em Node.js (Express) e banco de dados MySQL.

---

## ✨ Funcionalidades Principais

### 👤 Usuários e Perfis
- **Passageiro**: Busca caronas, reserva vagas e gerencia seu histórico de viagens.
- **Motorista**: Oferece caronas, cadastra veículos e gerencia seus passageiros confirmados.
- **Admin**: Aprova novos motoristas, monitora o faturamento (taxas da plataforma) e estatísticas gerais.

### 🛡️ Segurança e Regras de Negócio
- **Validação de CPF**: Algoritmo rigoroso para garantir a autenticidade dos dados.
- **Aprovação Documental**: Motoristas só podem postar caronas após a aprovação manual dos documentos (CNH/Veículo) pelo administrador.
- **Modelo de Receita**: A plataforma retém uma taxa de **10%** sobre o valor base de cada assento reservado.

### 📱 Interface (UI/UX)
- Dashboards dinâmicos e separados por perfil.
- Cabeçalhos personalizados com saudações e badges de status.
- Design moderno usando a paleta de cores institucional.

---

## 🚀 Tecnologias Utilizadas

### Mobile (Frontend)
- **React Native** com **Expo Router**
- **TypeScript** para maior segurança no código
- **Lucide React Native** para ícones modernos
- **Context API** para gestão de roles e autenticação

### Backend
- **Node.js** com **Express**
- **MySQL** para persistência de dados
- **CORS** para comunicação segura com o app

---

## 🛠️ Como Iniciar

### 1. Servidor e Banco de Dados
Navegue até a pasta `/server`:
```bash
# Instalar dependências
npm install

# Configurar Banco de Dados
# Execute o arquivo schema.sql no seu MySQL Workbench ou terminal.

# Iniciar o servidor
node server.js
```

### 2. Aplicativo Mobile
Navegue até a pasta `/Divide`:
```bash
# Instalar dependências
npm install

# Iniciar o Expo
npx expo start
```

---

## 📊 Estrutura do Banco de Dados

- `users`: Armazena dados cadastrais, CNH e tipo de perfil.
- `vehicles`: Informações dos veículos vinculados aos motoristas.
- `rides`: Detalhes das caronas (origem, destino, data, vagas).
- `bookings`: Reservas realizadas e taxas geradas para a plataforma.

---

## 📝 Licença
Este projeto foi desenvolvido como uma solução de mobilidade regional para Santa Catarina.

---
*Desenvolvido com ❤️ para a comunidade Catarinense.*
