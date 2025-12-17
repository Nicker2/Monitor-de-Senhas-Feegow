// ==UserScript==
// @name         Feegow Monitor - V15 (Red Alert & Silent)
// @namespace    http://tampermonkey.net/
// @version      15.0
// @description  Verifica senhas de forma invisível, alerta em VERMELHO e ignora repetidos.
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

    // --- ESTILOS DO MODO SILENCIOSO ---
    const styleSilent = document.createElement('style');
    styleSilent.innerHTML = `
        /* Modal invisível mas clicável pelo script */
        body.feegow-silent-check .modal,
        body.feegow-silent-check .modal-backdrop {
            opacity: 0 !important;
            visibility: visible !important;
            pointer-events: none !important;
            transition: none !important;
        }
        body.feegow-silent-check {
            overflow: auto !important;
        }
    `;
    document.head.appendChild(styleSilent);


    // --- ALERTA NEON VERMELHO (RED ALERT) ---
    function mostrarAlertaNeon(termo, assinaturaUnica) {
        if (document.getElementById('neon-alert-top')) return;

        tocarSomAlerta();

        const div = document.createElement('div');
        div.id = 'neon-alert-top';
        // MUDANÇA: Cores alteradas para #ff0000 (Vermelho)
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
            osc.frequency.value = 600; // Tom mais grave/alerta
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
        document.body.classList.remove('feegow-silent-check');
        const btnClose = document.querySelector('.modal .close') || document.querySelector('button[data-dismiss="modal"]');
        if (btnClose) btnClose.click();
        document.body.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape', 'keyCode': 27, 'bubbles': true}));
    }

    function verificarConteudoModal() {
        const modalBody = document.querySelector('.modal-body') || document.querySelector('.modal-content');

        if (!modalBody) {
            document.body.classList.remove('feegow-silent-check');
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

        fecharModal();

        if (encontrou) {
            mostrarAlertaNeon(termoAchado, assinaturaUnica);
        }
    }

    function ciclo() {
        if (document.getElementById('neon-alert-top')) return;

        const btn = getElementByXPath("//button[contains(@class, 'callTicketBtn')]");

        if (btn) {
            document.body.classList.add('feegow-silent-check');
            btn.click();
            setTimeout(verificarConteudoModal, TEMPO_ESPERA_MODAL);
        } else {
            document.body.classList.remove('feegow-silent-check');
        }
    }

    // --- INICIALIZAÇÃO ---
    setTimeout(() => {
        console.log("Feegow Monitor V15 (Red Alert) Ativo.");
        // Indicador Vermelho no rodapé
        const dot = document.createElement('div');
        dot.style.cssText = "position:fixed; bottom:2px; right:2px; width:4px; height:4px; background:#ff0000; z-index:999999; border-radius:50%; box-shadow: 0 0 5px #ff0000;";
        document.body.appendChild(dot);

        setInterval(ciclo, INTERVALO_LOOP);
    }, 3000);

})();
