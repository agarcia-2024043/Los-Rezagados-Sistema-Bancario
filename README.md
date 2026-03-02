# Sistema Bancario - Los Rezagados

> **Nota del Proyecto**
> Este sistema fue desarrollado con fines didácticos para el curso de **Taller de IN6AM**. Implementa una arquitectura moderna de microservicios, priorizando la seguridad financiera, la escalabilidad y las mejores prácticas en el manejo de datos bancarios.

---

## Descripción General

El **Sistema Bancario** es una solución integral para la gestión de operaciones financieras. Combina un potente servicio de autenticación desarrollado en **.NET 8** con servicios de negocio en **Node.js**, permitiendo una gestión segura de usuarios, cuentas, transacciones y conversión de divisas.

---

## Arquitectura del Sistema

El sistema utiliza una arquitectura de **microservicios independientes**:

### Authentication Service (.NET 8)
Es el núcleo de seguridad del sistema.

| Característica | Detalle |
|---|---|
| **Registro e Inicio de Sesión** | Manejo de credenciales con BCrypt |
| **Seguridad** | Control de acceso basado en roles (RBAC) |
| **Tokens** | Generación y validación de JWT para proteger rutas |
| **Persistencia** | Conexión robusta a PostgreSQL mediante Entity Framework Core |

### Banking & Core Services (Node.js)

- **Gestión de Cuentas:** Creación y administración de cuentas de ahorro y corrientes.
- **Transacciones:** Depósitos, retiros y transferencias seguras.
- **Divisas:** Módulo de conversión de moneda con tasas en tiempo real.

---

## Tecnologías Utilizadas

### Backend & Base de Datos

| Tecnología | Uso |
|---|---|
| **ASP.NET Core 8** | Microservicio de identidad |
| **Node.js & Express** | Servicios de negocio |
| **PostgreSQL** | Base de datos relacional para usuarios y roles |
| **MongoDB** | Almacenamiento para transacciones y reportes |
| **EF Core** | ORM para el mapeo de datos en .NET |

### Herramientas

| Herramienta | Uso |
|---|---|
| **Docker** | Contenerización de servicios y base de datos |
| **Git / GitHub** | Control de versiones |
| **Postman** | Pruebas de endpoints |

---

## Configuración con Docker (Base de Datos)

Para facilitar la revisión y el despliegue, el proyecto incluye un archivo `docker-compose.yml` para levantar la base de datos PostgreSQL de forma automática.

### Pasos para levantar la DB

1. Ubicarse en la raíz del proyecto.
2. Ejecutar el siguiente comando:

```bash
docker-compose up -d
```

### Configuración del contenedor

```yaml
version: '3.8'

services:
  db:
    image: postgres:latest
    container_name: bancario-auth-db
    environment:
      POSTGRES_PASSWORD: SystemBank0101@reza
      POSTGRES_DB: BankAuthDb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Rutas Principales

### Autenticación (Públicas)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Registro de nuevos clientes/empleados |
| `POST` | `/api/v1/auth/login` | Login y obtención de Token JWT |

### Operaciones Bancarias (Protegidas)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/accounts` | Ver estado de cuentas propias |
| `POST` | `/api/v1/transactions/deposit` | Realizar un depósito |
| `POST` | `/api/v1/transactions/transfer` | Transferencia entre cuentas |
| `GET` | `/api/v1/currency/convert` | Consultar conversión de divisas |

---

## Estructura del Repositorio

```plaintext
Los-Rezagados-Sistema-Bancario
│
├── authentication-service/   # Microservicio en .NET 8 (Auth & Users)
│   ├── src/
│   │   ├── AuthService.Api/
│   │   ├── AuthService.Persistence/ # Mapeo de DB (PostgreSQL)
│   │   └── AuthService.Domain/
│   └── docker-compose.yml
│
├── banking-services/         # Microservicios en Node.js
│   ├── account-service/
│   └── transaction-service/
│
└── .gitignore                # Configuración para omitir binarios (bin/obj)
```

---

## Estado del Proyecto

| Módulo | Estado |
|---|---|
| Arquitectura | 100% Implementada |
| Seguridad (JWT & RBAC) | Funcional |
| Base de Datos (Docker) |  Migraciones ejecutadas y contenedor listo |
| Limpieza de Código | 100% libre de archivos temporales y binarios |

---

##  Autores

**Equipo:** Los Rezagados
**Curso:** Taller de IN6AM — Jornada Matutina
