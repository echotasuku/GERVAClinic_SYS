# Gerenciamento de Vacinas

Este projeto é dividido em duas partes: **Frontend** e **Backend**. 
Siga os passos abaixo para instalar e executar cada uma delas.

---

## Requisitos

- **React**: Versão mínima `19.x.x`
- **PHP**: Versão mínima `8.2`
- Ambos são a versão que estou utilizando

---

## Instalação do Backend

1. Navegue até a pasta do backend:
    
    cd backend

2. Instale as dependências do PHP utilizando o Composer:

    composer install

3. Configure o arquivo `.env` com as informações do banco de dados.

4. Execute as migrações para criar as tabelas no banco de dados:
    
    php artisan migrate

5. Inicie o servidor:

    php artisan serve --port=8080

6. Crie o link simbólico para o diretório de armazenamento:

    php artisan storage:link

---

## Instalação do Frontend

1. Navegue até a pasta do frontend:
    cd frontend

2. Instale as dependências:
    npm install

3. Execute o projeto:
    npm start

---

## Observações

- Certifique-se de que você possui as versões mínimas do **React** (`19.x.x`) e do **PHP** (`8.2`) instaladas no seu sistema.
- O frontend estará disponível em `http://localhost:3000` e o backend em `http://localhost:8080`.
