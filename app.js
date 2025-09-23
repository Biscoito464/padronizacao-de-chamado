// Função de abrir formulário (revisada)
async function abrirFormulario(tipo, container = document.getElementById("conteudo")) {
  try {
    const res = await fetch("templates.json", { cache: "no-store" });
    const data = await res.json();
    const template = data?.[tipo];

    if (!template) {
      container.innerHTML = `<p class="erro">Template "${tipo}" não encontrado.</p>`;
      return;
    }

    // Limpa só o container usado
    container.textContent = "";

    // Formulário e prefixo único para IDs (evita conflitos)
    const form = document.createElement("form");
    const uid = `${tipo}-${Date.now().toString(36)}`;

    // Título
    const titulo = document.createElement("h2");
    titulo.textContent = template.titulo || "Formulário";
    form.appendChild(titulo);

    // Campos do formulário
    (template.campos || []).forEach(campo => {
      const group = document.createElement("div");
      group.className = "campo";

      const fieldId = `${uid}-${campo.id}`;

      const label = document.createElement("label");
      label.textContent = campo.label || campo.id;
      label.setAttribute("for", fieldId);

      const isTextarea = (campo.tipo || "").toLowerCase() === "textarea";
      const input = document.createElement(isTextarea ? "textarea" : "input");
      if (!isTextarea) input.type = campo.tipo || "text";

      input.id = fieldId;
      input.name = fieldId;
      if (campo.placeholder) input.placeholder = campo.placeholder;
      if (campo.rows && isTextarea) input.rows = campo.rows;

      group.appendChild(label);
      group.appendChild(input);
      form.appendChild(group);
    });

    // Botão Gerar
    const botao = document.createElement("button");
    botao.type = "submit";
    botao.className = "gerarBtn";
    botao.textContent = "Gerar Relatório";
    form.appendChild(botao);

    // Adiciona formulário antes do resultado/botão copiar
    container.appendChild(form);

    // Área de resultado (usa <pre> para preservar quebras de linha)
    const resultado = document.createElement("pre");
    resultado.className = "resultado";
    container.appendChild(resultado);

    // Botão Copiar (inicialmente oculto) — sem id fixo
    const copiarBtn = document.createElement("button");
    copiarBtn.type = "button";
    copiarBtn.className = "copiarBtn";
    copiarBtn.style.display = "none";
    copiarBtn.textContent = "Copiar Relatório";
    container.appendChild(copiarBtn);

    // Evento submit -> gera relatório
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Coleta de valores dentro do próprio form
      const valores = {};
      (template.campos || []).forEach(campo => {
        const fieldId = `${uid}-${campo.id}`;
        const el = form.querySelector(`#${CSS.escape(fieldId)}`);
        valores[campo.id] = el && "value" in el ? (el.value || "") : "";
      });

      // Substitui TODOS os placeholders {{chave}} no template
      let texto = template.template || "";
      texto = texto.replace(/\{\{(\w+)\}\}/g, (_, chave) => valores[chave] ?? "");

      resultado.textContent = texto;
      copiarBtn.style.display = texto ? "inline-block" : "none";
    });

    // Copiar relatório (com fallback)
    copiarBtn.addEventListener("click", async () => {
      const texto = resultado.textContent || "";
      let copiou = false;

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(texto);
          copiou = true;
        }
      } catch {
        // ignora e tenta fallback
      }

      if (!copiou) {
        try {
          const ta = document.createElement("textarea");
          ta.value = texto;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          copiou = document.execCommand("copy");
          document.body.removeChild(ta);
        } catch {
          copiou = false;
        }
      }

      if (copiou) {
        const prev = copiarBtn.textContent;
        copiarBtn.textContent = "Copiado!";
        setTimeout(() => (copiarBtn.textContent = prev), 1200);
      } else {
        alert("Não foi possível copiar automaticamente. Selecione e copie manualmente.");
      }
    });

    // Se for incidente, adiciona botão de fechamento
    if (tipo === "incidente") {
      const botaoFechamento = document.createElement("button");
      botaoFechamento.textContent = "Fechar Incidente";
      botaoFechamento.type = "button";
      botaoFechamento.style.marginTop = "15px";

      botaoFechamento.addEventListener("click", () => {
        let divFechamento = document.getElementById("form-fechamento");
        if (!divFechamento) {
          divFechamento = document.createElement("div");
          divFechamento.id = "form-fechamento"; // id fixo para identificar
          container.appendChild(divFechamento);
        }
        abrirFormulario("incidente_fechamento", divFechamento);
      });

      form.appendChild(botaoFechamento);
    }
  } catch (err) {
    console.error("Erro ao carregar templates.json:", err);
    container.innerHTML = `<p class="erro">Erro ao carregar templates. Tente novamente.</p>`;
  }
}

// --- Controle do Menu Hambúrguer ---
(() => {
  const menuToggle = document.getElementById("menu-toggle");
  // Se o seu HTML usa <ul id="menu-list">, este fallback acha o elemento correto.
  const menu = document.getElementById("menu") || document.getElementById("menu-list");

  if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
      menu.classList.toggle("active");
    });

    // Fecha o menu ao clicar em uma opção
    menu.addEventListener("click", (e) => {
      if (e.target.closest("button")) {
        menu.classList.remove("active");
        if (menuToggle.type === "checkbox") menuToggle.checked = false;
      }
    });
  }
})();
