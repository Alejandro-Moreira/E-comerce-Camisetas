# Instrucciones del Proyecto: E-Commerce Camisetas (Full-Stack)

## 1. ¿Qué hace este proyecto?
Este proyecto es una plataforma completa de comercio electrónico (E-commerce) especializada en venta de camisetas. Su arquitectura está dividida en dos segmentos (Frontend y Backend) implementando un modelo monolítico modular por capas. 
Cuenta con funciones avanzadas como: Autenticación por correo electrónico con JWT, carrito dinámico, panel de control administrativo (KPIs y Gráficos), gestión de inventario, tracking de clics de los usuarios (Heatmap) y motor de recomendaciones algorítmico predictivo basado en historiales de compras.

## 2. Archivos Críticos del Sistema
### Capa de Backend (Node.js/Express)
- `backend/src/app.js`: Configura el servidor web, inyecta Middlewares de seguridad (Helmet, Rate Limiter, CORS) globalmente.
- `backend/database/schema.sql`: Única fuente de la verdad para la estructura de la base de datos MySQL. 
- `backend/src/controllers/authController.js`: Lógica crítica de ciberseguridad, hashing de contraseñas (Bcrypt) y autenticación (JWT).
- `backend/src/controllers/*`: Poseen la lógica de negocios aislada para evitar el código espagueti.

### Capa de Frontend (React/Vite)
- `frontend/src/App.jsx`: Concentrador de rutas (SPA) globales y recolector pasivo de telemetría (Heatmap) mediante listeners.
- `frontend/src/pages/Home.jsx`: Pantalla core del escaparate con el motor de búsqueda, wishlist y filtros.
- `frontend/src/pages/admin/Dashboard.jsx`: Renderización de gráficas usando `recharts` que dependen del endpoint del backend `/api/dashboard/stats`.
- `frontend/src/context/*`: Gestores de estado (Session, Carrito y Favoritos) que sincronizan información mediante `LocalStorage`.

## 3. Reglas que debe seguir el Agente
- **Conformidad Estructural:** Toda ruta nueva en React debe tener una sección coincidente en el API de Node, y viceversa.
- **Diseño Resiliente:** Si el backend o la DB fallan, el frontend no debe crashear; debe mostrar una alerta moderada de "Fallo en la red".
- **Limpieza y Rendimiento:** Se debe evitar añadir dependencias pesadas si existe una API Nativa del navegador o de Node (Ej. se usa `Crypto module` nativo para tokens en vez de añadir otra librería UUID pesada).
- **Herramientas Necesarias:** El agente debe usar predominantemente `view_file`, `replace_file_content` o `write_to_file`. Para iniciar o detener la SPA, utilizar la terminal de comandos. 

---

## 4. ⛔ Lo que este agente NO debe hacer (Restricciones de Scope)

*   **Restricciones de Frontend:** Un agente enfocado en modificar interfaces visuales (CSS/Tailwind/Componentes) **JAMÁS** debe tocar la base de datos (`schema.sql`), y nunca debe alterar los Queries o Controladores de backend a riesgo de vulnerar la seguridad del negocio. Todo cambio es estrictamente en `/frontend`.
*   **Restricciones de Backend/Data:** Un agente designado a reestructurar base de datos o lógica de rutas no debe realizar modificaciones funcionales y/o estéticas en la UI en `/frontend` de manera colateral. Su trabajo terminará publicando un JSON válido para que un agente de frontend lo consuma luego.
*   **Restricciones Arquitectónicas Generales:** Se **PROHÍBE** migrar o instalar Mega-Frameworks (como Next.js para sustituir Vite, o cambiar MySQL por MongoDB) en esta instancia, salvo una instrucción humana hiper-específica advirtiendo la refactorización profunda. Se debe respetar el stack actual.
*   **Agente de Contenido/Copywriting:** Nunca debe tocar línea de código .js, .jsx o queries SQL alguna. Se restringe exclusivamente al llenado de datos base de mockups de productos, cambiar textos hardcodeados o traducciones en las vistas.

## 5. Protocolo de Transmisión entre Agentes
Si un Agente (Ej. Backend) determina que se necesita la creación de una pantalla en React tras diseñar un endpoint, redactará un reporte corto resumiendo la URL generada, los parámetros que recibe y el JSON que devuelve. Ese reporte se deja en el flujo para que el "Agente de Frontend" prosiga la labor sin solapamiento destructivo de archivos.
