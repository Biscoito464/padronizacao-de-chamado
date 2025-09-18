function abrirFormulario(tipo, container = document.getElementById("conteudo")) {
  fetch("templates.json")
    .then(res => res.json())
    .then(data => {
      const template = data[tipo];
      container.innerHTML = ""; // limpa só o container usado

      const form = document.createElement("form");

      // Título
      const titulo = document.createElement("h2");
      titulo.textContent = template.titulo;
      form.appendChild(titulo);

      // Campos do formulário
      template.campos.forEach(campo => {
        const label = document.createElement("label");
        label.textContent = campo.label;
        const input = document.createElement("input");
        input.id = campo.id;
        form.appendChild(label);
        form.appendChild(input);
      });

      // Botão Gerar
      const botao = document.createElement("button");
      botao.type = "submit";
      botao.textContent = "Gerar Relatório";
      form.appendChild(botao);

      // Área de resultado
      const resultado = document.createElement("div");
      resultado.className = "resultado";
      container.appendChild(resultado);

      // Botão Baixar (inicialmente oculto)
      const baixarBtn = document.createElement("button");
      baixarBtn.id = "baixarBtn";
      baixarBtn.style.display = "none";
      baixarBtn.textContent = "Baixar Relatório";
      container.appendChild(baixarBtn);

      // Evento submit -> gera relatório
      form.onsubmit = (e) => {
        e.preventDefault();

        let texto = template.template;

        template.campos.forEach(campo => {
          const valor = document.getElementById(campo.id).value || "";
          texto = texto.replace(`{{${campo.id}}}`, valor);
        });

        resultado.textContent = texto;
        baixarBtn.style.display = "block";

        // baixar relatório
        baixarBtn.onclick = () => {
          const blob = new Blob([texto], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${tipo}_relatorio.txt`;
          a.click();
          URL.revokeObjectURL(url);
        };
      };

      // adiciona formulário e botões
      container.appendChild(form);

      if (tipo === "incidente") {
        const botaoFechamento = document.createElement("button");
        botaoFechamento.textContent = "Fechar Incidente";
        botaoFechamento.type = "button";
        botaoFechamento.style.marginTop = "15px";

        botaoFechamento.onclick = () => {
          // verifica se já existe um formulário de fechamento
          let divFechamento = document.getElementById("form-fechamento");
          if (!divFechamento) {
            divFechamento = document.createElement("div");
            divFechamento.id = "form-fechamento"; // id fixo para identificar
            container.appendChild(divFechamento);
            abrirFormulario("incidente_fechamento", divFechamento);
          }
        };

        form.appendChild(botaoFechamento);
      }

    })
    .catch(err => {
      console.error("Erro ao carregar templates.json:", err);
    });
}