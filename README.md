# 🏥 Monitor de Senhas Feegow

![Version](https://img.shields.io/badge/version-15.0-red?style=for-the-badge)
![Platform](https://img.shields.io/badge/Tampermonkey-Userscript-green?style=for-the-badge&logo=tampermonkey)
![Language](https://img.shields.io/badge/JavaScript-ES6-yellow?style=for-the-badge&logo=javascript)

O **Monitor de Senhas Feegow** é um userscript avançado desenvolvido para otimizar o fluxo de trabalho em recepções hospitalares e clínicas. Ele automatiza a verificação de chamadas no painel do sistema Feegow, garantindo que senhas prioritárias não passem despercebidas, eliminando a necessidade de verificação manual constante.

---

## 🚀 Funcionalidades Principais

### 🕵️ Verificação Silenciosa (Stealth Mode)
O script realiza a checagem das senhas sem interromper o uso do computador.
- **Invisibilidade:** Os modais do sistema tornam-se transparentes durante a leitura.
- **Não-intrusivo:** A tela não pisca e o foco não é roubado durante a verificação automática.

### 🚨 Alerta Visual de Alta Prioridade
Ao detectar uma senha de interesse, o sistema exibe um alerta **Vermelho Neon** fixo no topo da tela.
- Design agressivo para garantir a visualização imediata.
- Animação de pulso para chamar atenção periférica.

### 🔊 Alerta Sonoro
Emite um aviso sonoro sincronizado com o alerta visual, garantindo que o recepcionista perceba a chamada mesmo se não estiver olhando diretamente para o monitor.

### 🧠 Filtro Inteligente de Repetições
Evita alertas duplicados para o mesmo paciente.
- O sistema gera uma **assinatura única** para cada chamado.
- Ao clicar em "OK, CIENTE", o script memoriza aquele atendimento e não alerta novamente até que a página seja recarregada.

---

## ⚙️ Como Funciona (Lógica Técnica)

O script opera em um ciclo contínuo de automação (RPA local). Abaixo está o detalhamento do fluxo de execução:

1.  **Injeção de CSS Dinâmico**
    * Antes de interagir com a interface, o script injeta regras CSS que definem `opacity: 0` para os modais, mantendo `visibility: visible`. Isso permite que o script leia o DOM sem que o usuário veja janelas abrindo e fechando.

2.  **Ciclo de Verificação (Trigger)**
    * A cada **10 segundos** (configurável), o script localiza o botão de "Chamar Senha" (`callTicketBtn`) e dispara um evento de clique simulado.

3.  **Leitura e Processamento**
    * O script aguarda o carregamento do conteúdo HTML do modal.
    * Ele varre o texto em busca de **Termos Alvo** (ex: "MC", "RETORNO").
    * O texto é normalizado (Upper Case) para comparação exata.

4.  **Tomada de Decisão**
    * **Nenhum termo encontrado ou Já Visto:** O modal é fechado silenciosamente e o CSS de invisibilidade é removido.
    * **Termo Encontrado (Novo):** O modal do sistema é fechado e o **Alerta Personalizado** é disparado na tela.

---

## 🛠️ Configuração

Você pode personalizar quais senhas disparam o alerta editando a constante `TERMOS_ALVO` no início do código.

```javascript
// Adicione ou remova termos conforme a necessidade da recepção
const TERMOS_ALVO = [
    "MC",
    "RETORNO",
    "R2",
    "CONSULTA",
    "OUTRAS ESPECIALIDADES",
    "TRIAGEM" // Exemplo: Adicionando novo termo
];
```javascript

## 📦 Instalação

1.  Instale a extensão **Tampermonkey** no seu navegador (Chrome, Edge, Firefox).
2.  Clique no ícone da extensão e selecione **"Criar um novo script"**.
3.  Apague o conteúdo padrão e cole o código completo do **Monitor de Senhas Feegow**.
4.  Salve o script (File > Save ou Ctrl+S).
5.  Acesse o painel do Feegow e recarregue a página.
    * *Um pequeno ponto vermelho no canto inferior direito da tela indicará que o monitor está ativo.*

---

## ⚠️ Aviso Legal

> Este script é uma ferramenta de auxílio visual e automação de interface que roda estritamente no navegador do usuário (Client-side). Ele não modifica banco de dados, não intercepta requisições de rede de forma maliciosa e não substitui as funções nativas do sistema Feegow. Use com responsabilidade e conforme as políticas da sua instituição.
