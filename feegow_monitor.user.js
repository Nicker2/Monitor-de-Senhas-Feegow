// ==UserScript==
// @name         Feegow Monitor - V16.0 (Smart Ghost Mode)
// @namespace    http://tampermonkey.net/
// @version      16.0
// @description  Verifica senhas invisivelmente, mas PERMITE que o usuário abra o modal manualmente sem bugar a tela.
// @match        https://app.feegow.com/*
// @match        https://app.feegow.com/*/*
// @grant        none
// @allFrames    true
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURAÇÕES ---
    const TERMOS_ALVO = ["MC", "RETORNO", "R2", "CONSULTA", "OUTRAS ESPECIALIDADES"];
    const INTERVALO_LOOP = 10000; // 10 segundos
    const TEMPO_ESPERA_MODAL = 2500; // Tempo para o modal carregar (invisível)

    // Lista para guardar IDs já vistos
    let listaIgnorados = new Set();
    
    // Nome da classe que indica que o ROBÔ está mexendo (não você)
    const CLASSE_ROBO = 'feegow-robot-active';

    // --- ESTILOS DO MODO FANTASMA (Só ativam com a classe específica) ---
    const styleSilent = document.createElement('style');
    styleSilent.innerHTML = `
        /* Só esconde o fundo se for o robô mexendo */
        body.${CLASSE_ROBO} .modal-backdrop,
        body.${CLASSE_ROBO} .modal-backdrop.in,
        body.${CLASSE_ROBO} .modal-backdrop.show {
            opacity: 0 !important;
            visibility: hidden !important;
            display: none !important;
        }

        /* Só joga o modal para o limbo se for o robô mexendo */
        body.${CLASSE_ROBO} .modal {
            opacity: 0 !important;
            display: block !important;
            position: fixed !important;
            top: -10000px !important;  /* Joga pra longe */
            left: -10000px !important;
            pointer-events: none !important;
            z-index: -9999 !important;
        }

        /* Mantém scroll funcionando */
        body.${CLASSE_ROBO} {
            overflow: auto !important;
            padding-right: 0 !important;
        }
    `;
    document.head.appendChild(styleSilent);


    // --- ALERTA NEON VERMELHO (RED ALERT) ---
    function mostrarAlertaNeon(termo, assinaturaUnica) {
        if (document.getElementById('neon-alert-top')) return;

        tocarSomAlerta();

        const div = document.createElement('div');
        div.id = 'neon-alert-top';
        div.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            width: 400px; padding: 15px; background: rgba(0,0,0,0.95);
            border: 3px solid #ff0000; box-shadow: 0 0 20px #ff0000;
            color: #ff0000; text-align: center; z-index: 2147483647;
            font-family: Arial, sans-serif; border-radius: 10px;
            animation: piscarVermelho 0.8s infinite alternate;
        `;

        div.innerHTML = `
            <style>@keyframes piscarVermelho {from{border-color:#ff0000; box-shadow: 0 0 20px #ff0000;} to{border-color:#500000; box-shadow: 0 0 5px #ff0000;}}</style>
            <div style="font-size: 16px; font-weight: bold; color: #fff; margin-bottom: 5px;">⚠️ SENHA ENCONTRADA ⚠️</div>
            <div style="font-size: 30px; font-weight: 900; color: #ff0000; text-shadow: 0 0 5px #ff0000; margin-bottom: 15px;">${termo}</div>
            <button id="btn-ok-ciente" style="padding: 10px 30px; background: #ff0000; color: #fff; border: none; cursor: pointer; font-weight: bold; border-radius: 5px; box-shadow: 0 0 10px #ff0000;">OK, CIENTE</button>
        `;
        document.body.appendChild(div);

        document.getElementById('btn-ok-ciente').onclick = function() {
            if (assinaturaUnica) {
                listaIgnorados.add(assinaturaUnica);
                console.log(`[FeegowBot] Ignorando futuramente: ${assinaturaUnica}`);
            }
            div.remove();
        };
    }

    function tocarSomAlerta() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 600;
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
            setTimeout(() => osc.stop(), 300);
        } catch(e) {}
    }

    // --- FUNCIONALIDADES ---
    function getElementByXPath(xpath) {
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    function fecharModal() {
        // SEGURANÇA: Remove a classe do robô para devolver o controle ao usuário
        document.body.classList.remove(CLASSE_ROBO);

        // Tenta clicar no X ou no botão fechar
        const btnClose = document.querySelector('.modal .close') || document.querySelector('button[data-dismiss="modal"]');
        if (btnClose) btnClose.click();
        
        // Garante fechamento forçado via ESC
        document.body.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape', 'keyCode': 27, 'bubbles': true}));
        
        // Limpeza de lixo do Bootstrap
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(el => el.remove());
        document.body.classList.remove('modal-open');
    }

    function verificarConteudoModal() {
        // Tenta pegar o corpo do modal
        const modalBody = document.querySelector('.modal-body') || document.querySelector('.modal-content');

        // Se não achou modal, garante que a classe do robô sai e aborta
        if (!modalBody) {
            document.body.classList.remove(CLASSE_ROBO);
            return;
        }

        const titulo = document.querySelector('.modal-title')?.innerText || "";
        const assinaturaUnica = titulo + "|" + modalBody.innerText.substring(0, 50);

        if (listaIgnorados.has(assinaturaUnica)) {
            fecharModal();
            return;
        }

        const botoes = Array.from(document.querySelectorAll('button'));
        let termoAchado = "";
        let encontrou = false;

        for (let btn of botoes) {
            let texto = btn.innerText.toUpperCase().trim();
            if (TERMOS_ALVO.some(t => texto.includes(t))) {
                if (texto === "CMC") continue;
                encontrou = true;
                termoAchado = texto;
                break;
            }
        }

        fecharModal(); // Fecha e remove a classe do robô

        if (encontrou) {
            mostrarAlertaNeon(termoAchado, assinaturaUnica);
        }
    }

    function ciclo() {
        // Se já tem alerta na tela, não faz nada
        if (document.getElementById('neon-alert-top')) return;

        const btn = getElementByXPath("//button[contains(@class, 'callTicketBtn')]");

        if (btn) {
            // 1. ATIVA O MODO ROBÔ (Esconde tudo)
            document.body.classList.add(CLASSE_ROBO);
            
            // 2. Clica
            btn.click();
            
            // 3. Espera carregar, verifica e LIMPA a classe
            setTimeout(verificarConteudoModal, TEMPO_ESPERA_MODAL);
        } else {
            // Se não achou botão, garante que a classe não esteja travando a tela
            document.body.classList.remove(CLASSE_ROBO);
        }
    }

    // --- INICIALIZAÇÃO ---
    setTimeout(() => {
        console.log("Feegow Monitor V16.0 (Smart Ghost Mode) Ativo.");
        
        // Indicador visual discreto (ponto vermelho no canto)
        const dot = document.createElement('div');
        dot.style.cssText = "position:fixed; bottom:2px; right:2px; width:4px; height:4px; background:#ff0000; z-index:999999; border-radius:50%; box-shadow: 0 0 5px #ff0000;";
        document.body.appendChild(dot);

        setInterval(ciclo, INTERVALO_LOOP);
    }, 3000);

})();
