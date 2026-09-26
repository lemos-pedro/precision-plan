# Terminar o redesign TowerCore (consola NOC)

O projeto atual está vazio. O código enviado no ficheiro comprimido já tem grande parte do redesign feito (tipografia Archivo Black/Hind, cores de estado, painéis compactos, barra lateral, barra superior, barra inferior, dashboard, Sites, detalhe de site, Equipamentos, Alarmes, Mapa, Relatórios, Utilizadores). Falta trazer esse código para aqui e fechar os pontos em falta do plano.

## 1. Trazer a aplicação para o projeto
- Copiar todo o código enviado (páginas, componentes, estilos, ligação ao servidor de dados), sem qualquer metadado de controlo de versões.
- Instalar as bibliotecas que a aplicação usa (gráficos, mapa, vista 3D, exportação para Excel).
- Confirmar que a aplicação arranca e que a página inicial passa a ser a Visão Global NOC.

## 2. Servidor de dados
- Atualizar o endereço do servidor para `172.21.1.133`, mantendo a possibilidade de ser alterado por configuração.
- Como esse endereço é interno, na pré-visualização as páginas mostram estados vazios/erro honestos, sem dados inventados.

## 3. Pontos do plano ainda por fechar
- **Página de Configurações:** o menu lateral já aponta para ela mas a página não existe — criar a página com o mesmo cabeçalho e estilo das restantes (preferências de visualização, endereço do servidor, informação de versão).
- **Sites:** o clique numa linha passa a abrir a página completa do site (Site Command Center) em vez da janela pequena; a janela pequena é removida.
- **Barra lateral:** tornar os grupos recolhíveis e a própria barra encolhível para modo compacto (só ícones), com o estado guardado entre visitas.
- **Consistência final:** rever cabeçalhos, filtros, tabelas, estados vazios e de carregamento para que todas as páginas partilhem a mesma densidade e comportamento.

## 4. Validação
- Metadados próprios (título, descrição, partilha social) confirmados em todas as páginas, incluindo a nova de Configurações.
- Teste em ecrã grande e telemóvel: menus, tabelas, janelas e Site Command Center.
- Contraste, navegação por teclado e ausência de erros de compilação.

## Notas técnicas
- Stack mantida: TanStack Start + React 19 + Tailwind v4, tokens em `src/styles.css`.
- Nova rota `src/routes/configuracoes.tsx`; `torres.tsx` deixa de usar `TorreDetailModal` e navega para `/torres/$torreId`.
- Barra lateral recolhível implementada em `src/components/layout/Sidebar.tsx` com persistência em `localStorage` lida após hidratação.
- `API_BASE_URL` continua a respeitar `VITE_API_BASE_URL`, com omissão a apontar para `http://172.21.1.133:8000`.
- Sem backend novo: nenhuma base de dados, nenhuma alteração à API.
