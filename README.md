# 🚗 Divide - Caronas Inteligentes & Sustentáveis (Santa Catarina)

O **Divide** é uma plataforma premium de caronas compartilhadas focada na mobilidade inteligente de Santa Catarina (Blumenau, Pomerode, Timbó e região). Conectamos motoristas que buscam dividir custos com passageiros que valorizam economia, segurança e uma experiência de viagem superior.

---

## ✨ Diferenciais & Novidades (v2.0)

### 🎨 Estética Premium "Verde Floresta"
- **Design de Alto Impacto**: Interface inspirada na natureza Catarinense, utilizando paletas de **Verde Floresta (#2D5A27)**, **Dourado (#D4AF37)** e **Laranja Terral**.
- **Efeitos Modernos**: Uso de gradientes lineares, sombras (glow effects), glassmorphism e micro-animações para uma sensação de app de alto luxo.
- **Visualização de Rota**: Simulação dinâmica do trajeto na tela de criação de oferta.

### 💰 Economia Justa e Sustentável
- **Lógica para Motoristas**: Cálculo automático de ganhos baseado em distância (**R$ 0,60/km**), garantindo o lucro líquido justo para quem dirige.
- **Booking Summary**: Componente de confirmação transparente que detalha o valor da carona e a taxa de serviço (10%) para o passageiro.
- **Sustentabilidade**: Política de precificação baseada em modelos de baixa emissão e compartilhamento eficiente.

### 📱 Experiência do Usuário (UX)
- **Criação Ágil de Ofertas**: Seletores nativos de data/hora otimizados para Android, iOS e Web/Desktop.
- **Previsão de Lucro**: O motorista visualiza seus "Ganhos Previstos" em tempo real enquanto configura a viagem.
- **Dashboards Personalizados**: Painéis exclusivos para Passageiros, Motoristas e Administradores com estatísticas dinâmicas.

---

## 🏗️ Estrutura do Ecossistema

- **/app**: Aplicativo mobile desenvolvido em **React Native (Expo)** com arquitetura de rotas dinâmicas.
- **/components**: Biblioteca de UI reutilizável, incluindo o `BookingSummary` e o `PremiumButton`.
- **/server**: API robusta em **Node.js (Express)** com banco de dados **MySQL** otimizado para transações geográficas.

---

## 🚀 Tecnologias de Ponta

### Mobile (Frontend)
- **Expo Router SDK 54+**: Navegação moderna baseada em arquivos.
- **TypeScript**: Estabilidade e segurança em todo o fluxo de dados.
- **Lucide Icons**: Ícones minimalistas e intuitivos.
- **Linear Gradient**: Efeitos de profundidade e elegância visual.

### Backend & Database
- **Node.js**: Processamento assíncrono de alta performance.
- **MySQL 8.0**: Relacionamentos complexos entre usuários, veículos e reservas.
- **Geolocalização**: Preparado para integração com APIs de mapas para cálculo de distância real.

---

## 🛠️ Instalação Rápida

### 1. Servidor
```bash
cd server
npm install
# Configure seu .env e schema.sql
node server.js
```

### 2. Aplicativo
```bash
cd ..
npm install
npx expo start --web # Ou --android / --ios
```

---

## 📊 Regras de Negócio Implementadas
- **Aprovação de Motoristas**: Fluxo de segurança para validação de documentos pelo Admin.
- **Taxa de Plataforma**: Retenção automática de 10% para manutenção do ecossistema.
- **Validação de CPF**: Proteção contra cadastros falsos usando dígito verificador real.

---

## 📝 Compromisso Regional
Este projeto nasceu para transformar a BR-470 e as rodovias de Santa Catarina em caminhos mais leves, baratos e sustentáveis.

*Desenvolvido com ❤️ para a comunidade Catarinense.*
