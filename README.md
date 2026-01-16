# 🎓 Sistema Universitario - API REST

API REST desarrollada con **NestJS 11** y **Prisma 7** para la gestión integral de un sistema universitario. Implementa arquitectura multi-base de datos, autenticación JWT, transacciones ACID, y consultas avanzadas con ORM.

## 📋 Tabla de Contenidos

- [Características Principales](#características-principales)
- [Tecnologías](#tecnologías)
- [Arquitectura Multi-Base de Datos](#arquitectura-multi-base-de-datos)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Modelo de Datos](#modelo-de-datos)
- [Autenticación JWT](#autenticación-jwt)
- [Endpoints API](#endpoints-api)
- [Consultas Avanzadas](#consultas-avanzadas)
- [Scripts Disponibles](#scripts-disponibles)
- [Pruebas con Postman](#pruebas-con-postman)

## ⭐ Características Principales

- ✅ **Arquitectura Multi-Base de Datos** con Prisma 7 (Auth, Academic, Support)
- ✅ **Autenticación JWT** con roles y permisos
- ✅ **Transacciones ACID** para operaciones de matrícula
- ✅ **Consultas Derivadas** con relaciones complejas
- ✅ **Consultas SQL Nativas** con `$queryRaw`
- ✅ **Operadores Lógicos** (AND, OR, NOT) en filtros
- ✅ **Paginación** en todos los endpoints de listado
- ✅ **Validación de DTOs** con class-validator
- ✅ **Seeds Idempotentes** para datos de prueba
- ✅ **Driver Adapters** de Prisma 7 habilitados

## 🚀 Tecnologías

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **NestJS** | 11.x | Framework backend |
| **Prisma** | 5.22.0 | ORM con Driver Adapters |
| **PostgreSQL** | 15+ | Base de datos (Neon) |
| **TypeScript** | 5.7.x | Lenguaje de programación |
| **JWT** | 11.x | Autenticación |
| **Passport** | 0.7.x | Middleware de auth |
| **bcrypt** | 6.x | Hash de contraseñas |
| **class-validator** | 0.14.x | Validación de DTOs |

## 🏗️ Arquitectura Multi-Base de Datos

El sistema implementa **separación de responsabilidades** mediante tres bases de datos independientes:

```
┌─────────────────────────────────────────────────────────────────┐
│                        SISTEMA UNIVERSITARIO                     │
├─────────────────┬─────────────────────┬─────────────────────────┤
│   AUTH DB       │   ACADEMIC DB       │   SUPPORT DB            │
│   (Seguridad)   │   (Académico)       │   (Auditoría)           │
├─────────────────┼─────────────────────┼─────────────────────────┤
│ • User          │ • Specialty         │ • AuditLog              │
│ • Role          │ • Career            │ • SystemLog             │
│ • Permission    │ • Cycle             │                         │
│ • UserRole      │ • Subject           │                         │
│ • RolePermission│ • Teacher           │                         │
│                 │ • Student           │                         │
│                 │ • TeacherSubject    │                         │
│                 │ • StudentSubject    │                         │
│                 │ • AcademicPeriod    │                         │
│                 │ • Enrollment        │                         │
└─────────────────┴─────────────────────┴─────────────────────────┘
```

### Schemas de Prisma

```
prisma/
├── schema-auth.prisma      → cliente en ./generated/client-auth
├── schema-academic.prisma  → cliente en ./generated/client-academic
├── schema-support.prisma   → cliente en ./generated/client-support
└── generated/
    ├── client-auth/
    ├── client-academic/
    └── client-support/
```

## 📦 Requisitos Previos

- Node.js 18+ y npm
- PostgreSQL 15+ (local o Neon)
- Git

## ⚙️ Instalación

```bash
# 1. Clonar el repositorio
git clone <url-repositorio>
cd sistemaUniversitario

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Generar clientes Prisma y migrar
npm run db:generate:all
npm run migrate:dev:all

# 5. Cargar datos de prueba
npm run db:seed:all

# 6. Iniciar el servidor
npm run start:dev
```

La API estará disponible en: `http://localhost:3000`

## 🔧 Configuración

### Archivo `.env`

```properties
# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Auth - PostgreSQL
DATABASE_AUTH_URL=postgresql://usuario:password@host:5432/universidad_auth?schema=public

# Database Academic - PostgreSQL
DATABASE_ACADEMIC_URL=postgresql://usuario:password@host:5432/universidad_academic?schema=public

# Database Support - PostgreSQL
DATABASE_SUPPORT_URL=postgresql://usuario:password@host:5432/universidad_support?schema=public
```

### Prisma Studio

```bash
# Visualizar base de datos Auth
npx prisma studio --schema=prisma/schema-auth.prisma

# Visualizar base de datos Academic
npx prisma studio --schema=prisma/schema-academic.prisma

# Visualizar base de datos Support
npx prisma studio --schema=prisma/schema-support.prisma
```

## 📁 Estructura del Proyecto

```
src/
├── auth/                   # 🔐 Módulo de autenticación
│   ├── dto/               # RegisterDto, LoginDto
│   ├── guards/            # JwtAuthGuard
│   ├── decorators/        # Decoradores personalizados
│   ├── jwt.strategy.ts    # Estrategia JWT
│   ├── auth.service.ts    # Lógica de auth
│   ├── auth.controller.ts # Endpoints auth
│   └── auth.module.ts
├── prisma/                 # 🗄️ Servicios Prisma
│   ├── prisma-auth.service.ts
│   ├── prisma-academic.service.ts
│   └── prisma-support.service.ts
├── specialty/              # 🎯 Especialidades
├── career/                 # 🎓 Carreras
├── cycle/                  # 🔄 Ciclos académicos
├── subject/                # 📚 Materias
├── teacher/                # 👨‍🏫 Profesores
├── teacher-subject/        # 📖 Asignación docente-materia
├── student/                # 🎒 Estudiantes
├── student-subject/        # 📝 Calificaciones
├── academic-period/        # 📅 Periodos académicos
├── enrollment/             # ✅ Matrículas (Transacciones ACID)
├── user/                   # 👤 Usuarios
├── generated/              # 🔧 Clientes Prisma generados
├── app.module.ts
└── main.ts
```

## 🗄️ Modelo de Datos

### Base de Datos Auth

```
User ─────────────> UserRole <─────────── Role
                                            │
                                            ▼
                                     RolePermission
                                            │
                                            ▼
                                       Permission
```

### Base de Datos Academic

```
Specialty (1) ──────────────→ (N) Career
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              Subject (N)      Student (N)     [relations]
                    │               │
           ┌───────┴───────┐       │
           ▼               ▼       │
    TeacherSubject    StudentSubject
           ▲                       │
           │                       │
       Teacher                     │
                                   ▼
                            Enrollment ← AcademicPeriod
```

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `User` | Usuarios del sistema con autenticación |
| `Role` | Roles (admin, teacher, student) |
| `Permission` | Permisos granulares |
| `Specialty` | Especialidades (Ingeniería, Medicina) |
| `Career` | Carreras universitarias |
| `Cycle` | Ciclos académicos (1er, 2do ciclo) |
| `Subject` | Materias con créditos y cupos |
| `Teacher` | Profesores con tipo de empleo |
| `Student` | Estudiantes vinculados a carreras |
| `TeacherSubject` | Asignación docente-materia |
| `StudentSubject` | Inscripciones con calificaciones |
| `AcademicPeriod` | Periodos (2026-1, 2026-2) |
| `Enrollment` | Matrículas con transacciones ACID |
| `AuditLog` | Registro de auditoría |
| `SystemLog` | Logs del sistema |

## 🔐 Autenticación JWT

### Endpoints de Auth

```http
POST /auth/register    # Registrar nuevo usuario
POST /auth/login       # Iniciar sesión (retorna JWT)
GET  /auth/me          # Obtener usuario actual (protegido)
```

### Registro de Usuario

```bash
POST /auth/register
Content-Type: application/json

{
  "name": "Christian Rojas",
  "email": "christian@university.com",
  "username": "christian.rojas",
  "password": "SecurePass123"
}
```

### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "username": "christian.rojas",
  "password": "SecurePass123"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Usar Token en Peticiones Protegidas

```bash
GET /auth/me
Authorization: Bearer <access_token>
```

## 🌐 Endpoints API

### 🔐 Autenticación (`/auth`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/auth/me` | Usuario actual (🔒) |

### 🎯 Especialidades (`/specialties`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/specialties` | Crear especialidad |
| GET | `/specialties` | Listar (paginado) |
| GET | `/specialties/:id` | Obtener por ID |
| PATCH | `/specialties/:id` | Actualizar |
| DELETE | `/specialties/:id` | Eliminar |

### 🎓 Carreras (`/careers`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/careers` | Crear carrera |
| GET | `/careers` | Listar (paginado) |
| GET | `/careers/:id` | Obtener por ID |
| PATCH | `/careers/:id` | Actualizar |
| DELETE | `/careers/:id` | Eliminar |

### 🔄 Ciclos (`/cycles`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/cycles` | Crear ciclo |
| GET | `/cycles` | Listar (paginado) |
| GET | `/cycles/:id` | Obtener por ID |
| PATCH | `/cycles/:id` | Actualizar |
| DELETE | `/cycles/:id` | Eliminar |

### 📚 Materias (`/subjects`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/subjects` | Crear materia |
| GET | `/subjects` | Listar (paginado) |
| GET | `/subjects/:id` | Obtener por ID |
| **GET** | `/subjects/by-career/:careerId` | **📊 Materias por carrera (consulta derivada)** |
| PATCH | `/subjects/:id` | Actualizar |
| DELETE | `/subjects/:id` | Eliminar |

### 👨‍🏫 Profesores (`/teachers`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/teachers` | Crear profesor |
| GET | `/teachers` | Listar (paginado) |
| GET | `/teachers/:id` | Obtener por ID |
| **GET** | `/teachers/multiple-subjects` | **📊 Docentes con 2+ materias** |
| **GET** | `/teachers/filter-complex` | **📊 Filtro AND/OR/NOT** |
| PATCH | `/teachers/:id` | Actualizar |
| DELETE | `/teachers/:id` | Eliminar |

### 🎒 Estudiantes (`/students`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/students` | Crear estudiante |
| GET | `/students` | Listar (paginado) |
| GET | `/students/:id` | Obtener por ID |
| **GET** | `/students/active-with-career` | **📊 Activos con carrera (consulta derivada)** |
| **GET** | `/students/filter?careerId=X&periodId=Y` | **📊 Filtro AND compuesto** |
| PATCH | `/students/:id` | Actualizar |
| DELETE | `/students/:id` | Eliminar |

### 📅 Periodos Académicos (`/academic-periods`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/academic-periods` | Crear periodo |
| GET | `/academic-periods` | Listar todos |
| GET | `/academic-periods/:id` | Obtener por ID |
| **GET** | `/academic-periods/active` | **📊 Periodos activos** |
| PATCH | `/academic-periods/:id` | Actualizar |
| DELETE | `/academic-periods/:id` | Eliminar |

### ✅ Matrículas (`/enrollments`) - Transacciones ACID

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| **POST** | `/enrollments` | **🔄 Matricular (Transacción ACID)** |
| GET | `/enrollments` | Listar todas |
| GET | `/enrollments/:id` | Obtener por ID |
| **GET** | `/enrollments/report` | **📊 Reporte SQL nativo ($queryRaw)** |
| **GET** | `/enrollments/student/:studentId/period/:periodId` | **📊 Matrículas por estudiante/periodo** |
| DELETE | `/enrollments/:id` | Eliminar |

## 🔍 Consultas Avanzadas

### 1. Consultas Derivadas con ORM

#### Estudiantes activos con carrera
```http
GET /students/active-with-career
```
Retorna estudiantes activos con información completa de carrera y especialidad.

#### Materias por carrera ordenadas
```http
GET /subjects/by-career/1
```
Materias ordenadas por ciclo y nombre, con relaciones completas.

### 2. Operadores Lógicos (AND, OR, NOT)

#### Filtro AND compuesto
```http
GET /students/filter?careerId=1&periodId=2
```
Estudiantes que cumplen: activos AND carrera específica AND periodo específico.

#### Filtro complejo AND/OR/NOT
```http
GET /teachers/filter-complex
```
Docentes de tiempo completo que (dictan materias OR están activos).

### 3. Consulta SQL Nativa

#### Reporte de matrículas
```http
GET /enrollments/report
```
Consulta con `$queryRaw` que retorna nombre completo, carrera y total de materias matriculadas.

### 4. Transacciones ACID

#### Matrícula transaccional
```http
POST /enrollments
{
  "studentId": 1,
  "subjectId": 1,
  "academicPeriodId": 1
}
```

La transacción garantiza:
- ✅ **Atomicidad**: Todo o nada
- ✅ **Consistencia**: Validaciones de negocio
- ✅ **Aislamiento**: Sin conflictos concurrentes
- ✅ **Durabilidad**: Persistencia confirmada

Validaciones:
- Estudiante existe y está activo
- Materia existe y tiene cupo disponible
- Periodo académico está activo
- No existe matrícula duplicada

## 🛠️ Scripts Disponibles

### Desarrollo

```bash
npm run start:dev      # Servidor en modo desarrollo (watch)
npm run start:debug    # Modo debug
npm run build          # Compilar proyecto
npm run start:prod     # Servidor en producción
```

### Prisma - Generación de Clientes

```bash
npm run db:generate:auth       # Cliente Auth
npm run db:generate:academic   # Cliente Academic
npm run db:generate:support    # Cliente Support
npm run db:generate:all        # Todos los clientes
```

### Prisma - Migraciones

```bash
npm run migrate:dev:auth       # Migrar Auth (desarrollo)
npm run migrate:dev:academic   # Migrar Academic
npm run migrate:dev:support    # Migrar Support
npm run migrate:dev:all        # Migrar todas

npm run migrate:deploy:all     # Migrar todas (producción)
```

### Prisma - Reset

```bash
npm run migrate:reset:auth     # Reset Auth
npm run migrate:reset:academic # Reset Academic
npm run migrate:reset:support  # Reset Support
npm run migrate:reset:all      # Reset todas
```

### Seeds

```bash
npm run db:seed:auth           # Seed Auth (usuarios, roles)
npm run db:seed:academic       # Seed Academic (datos completos)
npm run db:seed:support        # Seed Support (logs)
npm run db:seed:all            # Seed todas
```

### Setup Completo

```bash
npm run db:setup               # Generate + Migrate + Seed (todo)
```

### Testing

```bash
npm run test           # Tests unitarios
npm run test:watch     # Tests en modo watch
npm run test:cov       # Cobertura de tests
npm run test:e2e       # Tests end-to-end
```

## 🧪 Pruebas con Postman

### Colección incluida: `postman_CLASE3_COMPLETO.json`

Importar la colección para probar todos los endpoints.

### Flujo de Pruebas Recomendado

1. **Auth**: Registrar y hacer login
2. **Specialties**: Crear especialidades
3. **Cycles**: Crear ciclos
4. **Careers**: Crear carreras (requiere specialty)
5. **Subjects**: Crear materias (requiere career, cycle)
6. **Teachers**: Crear profesores
7. **Students**: Crear estudiantes (requiere career)
8. **Academic Periods**: Crear periodos activos
9. **Enrollments**: Matricular estudiantes

### Ejemplos de Peticiones

#### Crear Especialidad
```json
POST /specialties
{ "name": "Ingeniería", "description": "Facultad de Ingeniería" }
```

#### Crear Carrera
```json
POST /careers
{
  "name": "Ingeniería de Sistemas",
  "totalCycles": 10,
  "durationYears": 5,
  "specialtyId": 1
}
```

#### Crear Materia
```json
POST /subjects
{
  "name": "Programación I",
  "credits": 4,
  "maxQuota": 30,
  "careerId": 1,
  "cycleId": 1
}
```

#### Crear Profesor
```json
POST /teachers
{
  "userId": 1,
  "firstName": "Carlos",
  "lastName": "Rodríguez",
  "email": "carlos@university.com",
  "phone": "+593987654321",
  "employmentType": "FULL_TIME"
}
```

#### Crear Estudiante
```json
POST /students
{
  "userId": 2,
  "firstName": "Ana",
  "lastName": "Martínez",
  "email": "ana@university.com",
  "phone": "+593912345678",
  "careerId": 1
}
```

#### Crear Periodo Académico
```json
POST /academic-periods
{
  "name": "2026-1",
  "startDate": "2026-01-15T00:00:00Z",
  "endDate": "2026-06-30T23:59:59Z",
  "isActive": true
}
```

#### Matricular Estudiante (Transacción ACID)
```json
POST /enrollments
{
  "studentId": 1,
  "subjectId": 1,
  "academicPeriodId": 1
}
```

## ✅ Validaciones

Todas las peticiones son validadas automáticamente con `class-validator`:

- **Email**: Formato válido
- **Strings**: No vacíos, longitud mínima/máxima
- **IDs**: Números enteros positivos
- **Enums**: Valores permitidos (FULL_TIME, PART_TIME, HOURLY)
- **Fechas**: Formato ISO válido
- **Relaciones**: Existencia verificada

### Ejemplo de Error de Validación

```json
{
  "message": [
    "name should not be empty",
    "email must be an email",
    "careerId must be a positive number"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

## 🔒 Manejo de Errores

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Validación fallida |
| 401 | Unauthorized - Token inválido/ausente |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Duplicado (ej: email ya existe) |
| 500 | Internal Server Error |

## 📊 Orden de Creación de Datos

Para evitar errores de relaciones, crear en este orden:

1. ✅ **Auth**: Usuarios (para obtener userIds)
2. ✅ **Specialties** (sin dependencias)
3. ✅ **Cycles** (sin dependencias)
4. ✅ **Careers** (requiere Specialty)
5. ✅ **Subjects** (requiere Career y Cycle)
6. ✅ **Teachers** (requiere User)
7. ✅ **Students** (requiere User y Career)
8. ✅ **Academic Periods** (sin dependencias)
9. ✅ **Enrollments** (requiere Student, Subject, Period)

## 📄 Documentación Adicional

- `docs/Principio_de_acid.pdf` - Explicación de transacciones ACID

---

**Desarrollado por:** Christian Rojas  
**Institución:** Instituto Sudamericano  
**Tecnología:** NestJS 11 + Prisma 7 + PostgreSQL  
**Fecha:** Enero 2026
