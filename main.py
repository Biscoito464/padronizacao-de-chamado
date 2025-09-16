from datetime import datetime
 
def criar_relatorio():
    print("=== Sistema de Relatórios (Field Service) ===")
    print("Motivo do atendimento no Local: COLABORADOR(A) SE AGENDOU NO CONEXÃO LOCAL")
    
 
    respostas = {
        "falha_reportada": input("Falha Reportada: "),
        "causa_raiz": input("Causa Raiz: "),
        "solucao": input("Solução: "),
        "validado_por": input("Validado por: "),
        "modelo": input("Modelo do equipamento: "),
        "memoria": input("Memória (GB): "),
        "hostname": input("Hostname: "),
        "numero_serie": input("Nº de Série: "),
    }
 
    # Template
    template = f"""
[Field Service - Suporte Local]
 
    Passível de solução remota? Não
    Falha Reportada: {respostas['falha_reportada']}
    Causa Raiz: {respostas['causa_raiz']}
    Solução: {respostas['solucao']}
    Validado por: {respostas['validado_por']}
    Modelo: {respostas['modelo']}
    Memória: {respostas['memoria']}
    Hostname: {respostas['hostname']}
    Nº de Série: {respostas['numero_serie']}
 
    Ah, por gentileza, avalie o meu atendimento. 
    Isso ajudará a demonstrar a qualidade do meu trabalho. 
    Muito obrigado(a)!  
 
    Abertura
 
        Descrição do problema relatado pelo usuário: {respostas['falha_reportada']}
        Marca e modelo do equipamento: {respostas['modelo']}
        Nº de Série: {respostas['numero_serie']}
        Hostname: {respostas['hostname']}
"""
 
    # Salvar em arquivo
    nome_arquivo = f"relatorio_fieldservice_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(nome_arquivo, "w", encoding="utf-8") as f:
        f.write(template)
 
    print(f"\n✅ Relatório gerado e salvo como: {nome_arquivo}")
 
 
# Executar
criar_relatorio()
 