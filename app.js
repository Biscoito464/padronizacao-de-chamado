// Função de abrir formulário com wrapper e classe para estilização
async function abrirFormulario(
  tipo,
  container = document.getElementById("conteudo")
) {
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

    // Wrapper (card)
    const wrapper = document.createElement("section");
    wrapper.className = "form-wrapper";

    // Form + uid único
    const form = document.createElement("form");
    form.classList.add("relatorio-form"); // <-- necessário para CSS
    const uid = `${tipo}-${Date.now().toString(36)}`;

    // Título
    const titulo = document.createElement("h2");
    titulo.textContent = template.titulo || "Formulário";
    form.appendChild(titulo);

    // Campos
    (template.campos || []).forEach((campo) => {
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

    // Ações
    const acoes = document.createElement("div");
    acoes.className = "acoes";

    const botao = document.createElement("button");
    botao.type = "submit";
    botao.textContent = "Gerar Relatório";
    acoes.appendChild(botao);

    if (tipo === "incidente") {
      const botaoFechamento = document.createElement("button");
      botaoFechamento.type = "button";
      botaoFechamento.textContent = "Fechar Incidente";
      botaoFechamento.addEventListener("click", () => {
        let divFechamento = document.getElementById("form-fechamento");
        if (!divFechamento) {
          divFechamento = document.createElement("div");
          divFechamento.id = "form-fechamento";
          container.appendChild(divFechamento);
        }
        abrirFormulario("incidente_fechamento", divFechamento);
      });
      acoes.appendChild(botaoFechamento);
    }

    form.appendChild(acoes);

    // Resultado e copiar
    const resultado = document.createElement("pre");
    resultado.className = "resultado";
    resultado.setAttribute("aria-live", "polite");

    const copiarBtn = document.createElement("button");
    copiarBtn.type = "button";
    copiarBtn.className = "copiarBtn";
    copiarBtn.style.display = "none";
    copiarBtn.textContent = "Copiar Relatório";

    // Submit -> gerar texto
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const valores = {};
      (template.campos || []).forEach((campo) => {
        const fieldId = `${uid}-${campo.id}`;
        const el = form.querySelector(`#${CSS.escape(fieldId)}`);
        valores[campo.id] = el && "value" in el ? el.value || "" : "";
      });

      let texto = template.template || "";
      texto = texto.replace(
        /\{\{(\w+)\}\}/g,
        (_, chave) => valores[chave] ?? ""
      );

      resultado.textContent = texto;
      copiarBtn.style.display = texto ? "inline-block" : "none";
      if (texto)
        resultado.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    // Copiar (Clipboard API + fallback)
    copiarBtn.addEventListener("click", async () => {
      const texto = resultado.textContent || "";
      let copiou = false;

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(texto);
          copiou = true;
        }
      } catch {
        /* tenta fallback */
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
        alert(
          "Não foi possível copiar automaticamente. Selecione e copie manualmente."
        );
      }
    });

    // Montagem em tela
    wrapper.appendChild(form);
    wrapper.appendChild(resultado);
    wrapper.appendChild(copiarBtn);
    container.appendChild(wrapper);
  } catch (err) {
    console.error("Erro ao carregar templates.json:", err);
    container.innerHTML = `<p class="erro">Erro ao carregar templates. Tente novamente.</p>`;
  }
}

// --- Controle do Menu Hambúrguer ---
(() => {
  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu-list");

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
