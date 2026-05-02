# FalaCidade 🏙️

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-5C2D91?style=for-the-badge&logo=.net&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white)

O **FalaCidade** é uma plataforma focada na **Transformação Digital** da gestão pública. O sistema conecta cidadãos à prefeitura, permitindo o registro, acompanhamento e a resolução de problemas urbanos.

## ✨ Funcionalidades

### Para o Cidadão (Citizen)
* **Feed de Ocorrências:** Visualização pública de problemas relatados na cidade, com status em tempo real.
* **Registro de Problemas:** Criação de novas ocorrências com captura de coordenadas geográficas via mapa interativo (OpenStreetMap/Leaflet) e conversão automática para endereço (Reverse Geocoding via Nominatim).
* **Minhas Ocorrências:** Lista para acompanhar o andamento dos seus próprios relatos.

### Para a Prefeitura (Reviewer / Admin)
* **Gestão de Ocorrências:** Painel otimizado para analistas revisarem (aprovar ou reprovar) as ocorrências feitas pelos usuários.
* **Gestão de Usuários (Apenas Admin):** Controle de acesso e alteração de privilégios (Papéis de usuário) dentro da plataforma.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
* **React + Vite:** 
* **TypeScript:**
* **Tailwind CSS:** 

### Backend
* **C# / .NET:** 
* **Entity Framework Core:**
* **SQL Server**

---

## 📂 Estrutura do Projeto

O repositório está organizado separando as responsabilidades do frontend e do backend:

```text
📦 FalaCidade
 ┣ 📂 frontend               # REACT
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 assets
 ┃ ┃ ┣ 📂 components         
 ┃ ┃ ┣ 📂 contexts           
 ┃ ┃ ┣ 📂 pages                       
 ┃ ┃ ┃ ┣ 📂 Login            
 ┃ ┃ ┃ ┣ 📂 Occurrence      
 ┃ ┃ ┃ ┗ 📂 Register
 ┃ ┃ ┃ ┗ 📂 UserManager           
 ┃ ┃ ┣ 📂 services           
 ┃ ┃ ┣ 📜 App.tsx            
 ┃ ┃ ┗ 📜 main.tsx           
 ┃
 ┗ 📂 API                # API .NET
   ┣ 📂 FalaCidade.API
   ┃ ┣ 📂 Controllers       
   ┃ ┣ 📂 Data  
   ┃ ┣ 📂 DTO
   ┃ ┣ 📂 Entities
   ┃ ┣ 📂 Enums              
   ┃ ┣ 📂 Migrations            
   ┃ ┣ 📂 Services           
   ┃ ┗ 📜 Program.cs        
