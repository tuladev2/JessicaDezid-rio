# ✅ CHECKLIST DE DEPLOY - Clínica de Estética

**Antes de fazer deploy para produção, execute este checklist completo.**

---

## 🔒 SEGURANÇA

- [ ] **CPF Validado** - Testar com CPF inválido (deve rejeitar)
- [ ] **localStorage Limpo** - Verificar que CPF não é armazenado
- [ ] **sessionStorage Preenchido** - Verificar que dados do cliente estão lá
- [ ] **Credenciais Supabase** - Verificar que .env.local está configurado
- [ ] **Queries com Erro** - Desligar internet e testar (deve mostrar erro)
- [ ] **Validação de Entrada** - Testar com dados inválidos (deve rejeitar)

---

## 📱 RESPONSIVIDADE

- [ ] **iPhone 12 (390x844)** - Testar em DevTools
- [ ] **Calendário Mobile** - Verificar scroll horizontal
- [ ] **Inputs Mobile** - Verificar tamanho (h-12)
- [ ] **Botões Mobile** - Verificar tamanho (44x44px mínimo)
- [ ] **Modais Mobile** - Verificar max-h-[90vh]
- [ ] **Texto Truncado** - Verificar que nomes longos truncam
- [ ] **Landscape** - Rotacionar e testar

---

## ✅ FUNCIONALIDADE

- [ ] **Agendamento Completo** - Criar agendamento do início ao fim
- [ ] **Cliente Existente** - Inserir CPF de cliente existente
- [ ] **Conflito de Horário** - Tentar agendar horário ocupado
- [ ] **Horário Passado** - Verificar que horários passados estão desabilitados
- [ ] **Criar Pacote** - Criar novo pacote com validação
- [ ] **Excluir Pacote** - Excluir pacote sem agendamentos
- [ ] **Dashboard** - Verificar que carrega sem erros
- [ ] **Métricas** - Verificar que aparecem valores corretos

---

## ⚡ PERFORMANCE

- [ ] **Console Limpo** - Abrir DevTools > Console (sem logs)
- [ ] **Queries Rápidas** - Dashboard carrega em < 3 segundos
- [ ] **Imagens Carregam** - Verificar que imagens aparecem ou placeholder
- [ ] **Sem Overflow** - Verificar que não há scroll horizontal em desktop

---

## 🧪 TESTES ESPECÍFICOS

### Teste 1: Agendamento com Conflito
```
1. Criar agendamento às 14:00 em 15/04/2026
2. Tentar criar outro às 14:00 em 15/04/2026
3. Resultado esperado: ❌ Erro "Este horário foi ocupado"
```

### Teste 2: CPF Inválido
```
1. Inserir CPF: 111.111.111-11
2. Resultado esperado: ❌ Rejeita com "CPF inválido"
```

### Teste 3: Dados Sensíveis
```
1. Abrir DevTools > Application > Local Storage
2. Procurar por 'cpf'
3. Resultado esperado: ❌ Nenhuma chave 'cpf'
```

### Teste 4: Responsividade
```
1. Abrir DevTools > Device Toolbar
2. Selecionar iPhone 12
3. Navegar para agendamento
4. Resultado esperado: ✅ Calendário com scroll horizontal
```

### Teste 5: Erro de Rede
```
1. Desligar internet
2. Tentar criar agendamento
3. Resultado esperado: ✅ Mensagem de erro clara
```

---

## 📋 PRÉ-DEPLOY

- [ ] **Backup do Banco** - Fazer backup do Supabase
- [ ] **Variáveis de Ambiente** - Verificar .env.local
- [ ] **Build** - Executar `npm run build` (sem erros)
- [ ] **Testes** - Executar todos os testes acima
- [ ] **Documentação** - Revisar `CODE_REVIEW_FINAL.md`
- [ ] **Rollback Plan** - Ter plano de rollback pronto

---

## 🚀 DEPLOY

- [ ] **Fazer Deploy** - Executar comando de deploy
- [ ] **Verificar Produção** - Testar em produção
- [ ] **Monitorar** - Verificar console de erros
- [ ] **Comunicar** - Informar cliente que está pronto

---

## 📊 PÓS-DEPLOY

- [ ] **Monitorar Erros** - Verificar se há erros em produção
- [ ] **Testar Fluxos** - Testar agendamento em produção
- [ ] **Performance** - Verificar que carrega rápido
- [ ] **Usuários** - Informar usuários que está pronto

---

## ⚠️ PROBLEMAS COMUNS

### Problema: "Credenciais não configuradas"
**Solução:** Verificar que .env.local tem VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

### Problema: "CPF inválido" mesmo com CPF válido
**Solução:** Verificar que CPF tem 11 dígitos e dígito verificador correto

### Problema: Calendário com scroll horizontal em desktop
**Solução:** Verificar que está em mobile (DevTools > Device Toolbar)

### Problema: Agendamento não é criado
**Solução:** Verificar console (F12) para mensagem de erro

### Problema: Imagens não carregam
**Solução:** Verificar que URL da imagem é válida

---

## 📞 SUPORTE

### Erro ao fazer deploy?
1. Verificar que npm install foi executado
2. Verificar que npm run build não tem erros
3. Verificar que .env.local está configurado
4. Verificar que Supabase está acessível

### Erro em produção?
1. Verificar console (F12)
2. Verificar que .env.local está correto
3. Verificar que Supabase está acessível
4. Fazer rollback se necessário

---

## ✅ FINAL

Se todos os itens acima estão marcados ✅, o projeto está pronto para produção!

**Classificação:** 🟢 VERDE - PRONTO PARA DEPLOY

---

**Desenvolvido com ❤️ para Jessica Dezidério - Estética Premium**

Data: Abril 2026  
Versão: 1.0  
Status: ✅ Pronto para Deploy
