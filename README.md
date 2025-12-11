# movie-app

**Iniciar o projeto (rápido)**

- Abra um PowerShell na raiz do repositório (onde está o `package.json`) e execute:

	```powershell
	# instalar dependências
	npx -y pnpm@10.15.1 install
	```

- Inicie o backend (em uma aba/terminal):

	```powershell
	# estando na raiz do projeto
	$env:PORT=3002; $env:NODE_ENV="development"; npx -y tsx watch server/_core/index.ts
	```

- Inicie o frontend (outra aba/terminal):

	```powershell
	# estando na raiz do projeto
	$env:DEV_BACKEND_PORT=3002; npx -y vite
	```

- Fazer login de desenvolvimento (sem OAuth):

	- Abra no navegador: `http://127.0.0.1:3002/dev-login` ou use o botão "Dev Login" no header da UI (visível em modo de desenvolvimento).

Observações rápidas:
- O projeto usa um fallback de banco simples baseado em arquivo quando `DATABASE_URL` não estiver definido — dados de usuários e favoritos são gravados em `server_data.json` no diretório do projeto.
- Se preferir usar um banco real, defina `DATABASE_URL` em `.env` e rode as migrations (ex.: `npx -y pnpm@10.15.1 run db:push`).

Dica: se preferir mudar de diretório manualmente, use `Set-Location -Path '<caminho/para/o/projeto>'` antes dos comandos acima.

Pronto — com isso o backend e o Vite devem estar funcionando localmente e você pode testar favoritar e o login de desenvolvimento.
# movie-app