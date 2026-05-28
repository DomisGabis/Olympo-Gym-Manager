# Olympo Gym Manager - Backend API

Kompleksowy system ERP/CRM do zarządzania klubem fitness, automatyzacji pracy recepcji, obsługi karnetów oraz prowadzenia cyfrowej współpracy na linii **Trener ↔ Klient**.

Projekt został zbudowany przy użyciu:

- **Node.js**
- **Express**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**

---

# Globalna Mechanika Paginacji i Leniwego Ładowania

Aby zapewnić maksymalną wydajność aplikacji, zminimalizować zużycie danych pakietowych na urządzeniach mobilnych oraz odciążyć bazę danych, w modułach generujących długie listy danych zastosowano mechanizm **Paginacji (Offset Pagination)**.

---

## Jak z tego korzystać (Query Parameters)

Wszystkie endpointy obsługujące paginację przyjmują dwa opcjonalne parametry w Query String:

| Parametr | Domyślna wartość | Opis |
|---|---|---|
| `page` | `1` | Numer strony do pobrania |
| `limit` | `10` lub `20` | Liczba rekordów zwracanych na jednej stronie |

### Przykład

```http
GET /api/exercises?page=2&limit=10
```

---

## Struktura Odpowiedzi (Response Schema)

Zamiast surowej tablicy, endpointy paginowane zwracają ustrukturyzowany obiekt zawierający dane biznesowe oraz metadane wspierające frontend (np. przyciski stron lub infinite scroll).

```json
{
  "success": true,
  "data": [],
  "meta": {
    "totalItems": 45,
    "totalPages": 5,
    "currentPage": 1,
    "limit": 10
  }
}
```

---

# Specyfika Paginacji w Komunikatorze (Messenger-like Sync)

W przypadku modułu wiadomości paginacja działa odwrotnie niż w standardowych katalogach danych.

## Mechanizm działania

1. Backend sortuje wiadomości malejąco (`desc`) według daty utworzenia.
2. Pobierana jest określona liczba najnowszych wiadomości.
3. Przed wysłaniem odpowiedzi tablica zostaje odwrócona metodą `.reverse()`.

Dzięki temu frontend otrzymuje wiadomości:

- chronologicznie (starsze → nowsze),
- z możliwością łatwego dociągania starszych wiadomości,
- kompatybilnie z mechaniką komunikatorów typu Messenger.

### Przykład

```http
GET /api/messages/15?page=2&limit=20
```

---

# Autoryzacja

Wszystkie chronione endpointy wymagają przesłania tokenu JWT w nagłówku:

```http
Authorization: Bearer <TWÓJ_TOKEN_JWT>
```

---

# Architektura Systemu i Dokumentacja Endpointów

---

# 1. Users & Auth (Użytkownicy i Autoryzacja)

Obsługa:

- rejestracji,
- logowania,
- JWT,
- RBAC,
- zarządzania użytkownikami,
- profilu użytkownika.

| Metoda | Endpoint | Dostęp | Opis |
|---|---|---|---|
| POST | `/api/auth/register` | Publiczny | Rejestracja nowego użytkownika |
| POST | `/api/auth/login` | Publiczny | Logowanie oraz zwrot JWT |
| GET | `/api/auth/admin-dashboard` | ADMIN | Test autoryzacji administratora |
| DELETE | `/api/auth/users/:id` | ADMIN | Kaskadowe usunięcie użytkownika |
| GET | `/api/users/profile` | Zalogowani użytkownicy | Profil aktualnego użytkownika |
| GET | `/api/users/trainers` | Zalogowani użytkownicy | Lista trenerów z paginacją |
| GET | `/api/users` | ADMIN, RECEPTIONIST | Lista użytkowników z opcjonalnym filtrem roli |

### Przykład filtrowania

```http
GET /api/users?role=CLIENT&page=1&limit=10
```

---

# 2. Memberships (Karnety i Recepcja)

Moduł odpowiedzialny za:

- zakup karnetów,
- zarządzanie subskrypcjami,
- system wejść/wyjść QR,
- obsługę recepcji.

| Metoda | Endpoint | Dostęp | Opis |
|---|---|---|---|
| GET | `/api/memberships/types` | Zalogowani użytkownicy | Lista dostępnych karnetów |
| POST | `/api/memberships/buy` | CLIENT | Zakup karnetu |
| GET | `/api/memberships/my-status` | CLIENT | Status aktualnego karnetu |
| POST | `/api/memberships/scan` | RECEPTIONIST, ADMIN | Skan kodu QR |

---

# 3. Exercises (Katalog Ćwiczeń)

Kompleksowa baza ćwiczeń wykorzystywana przy budowaniu planów treningowych.

| Metoda | Endpoint | Dostęp | Opis |
|---|---|---|---|
| GET | `/api/exercises` | Zalogowani użytkownicy | Lista ćwiczeń z paginacją |
| GET | `/api/exercises/:id` | Zalogowani użytkownicy | Szczegóły ćwiczenia |
| POST | `/api/exercises` | TRAINER, ADMIN | Dodanie ćwiczenia |
| PUT | `/api/exercises/:id` | TRAINER, ADMIN | Edycja ćwiczenia |
| DELETE | `/api/exercises/:id` | ADMIN | Usunięcie ćwiczenia |

### Przykład filtrowania

```http
GET /api/exercises?category=Nogi&level=INTERMEDIATE
```

---

# 4. Training Plans (Plany Treningowe)

System zarządzania planami treningowymi oraz śledzenia progresu klientów.

| Metoda | Endpoint | Dostęp | Opis |
|---|---|---|---|
| POST | `/api/training-plans` | TRAINER, ADMIN | Utworzenie planu treningowego |
| GET | `/api/training-plans/my` | CLIENT | Pobranie własnych planów |
| GET | `/api/training-plans/client/:id` | TRAINER, ADMIN | Pobranie planów klienta |
| PATCH | `/api/training-plans/entries/:id` | CLIENT | Oznaczenie ćwiczenia jako wykonane |

---

# 5. Calendar (Harmonogram i Rezerwacje)

Moduł odpowiedzialny za:

- grafik trenerów,
- konsultacje,
- rezerwacje treningów personalnych.

| Metoda | Endpoint | Dostęp | Opis |
|---|---|---|---|
| POST | `/api/calendar/book` | TRAINER, ADMIN | Rezerwacja spotkania |
| GET | `/api/calendar/my` | CLIENT, TRAINER | Harmonogram użytkownika |
| DELETE | `/api/calendar/:id` | CLIENT, TRAINER, ADMIN | Anulowanie rezerwacji |

---

# 6. Messages (Wewnętrzny Komunikator)

Moduł czatu tekstowego między trenerem a klientem.

| Metoda | Endpoint | Dostęp | Opis |
|---|---|---|---|
| POST | `/api/messages` | CLIENT, TRAINER | Wysłanie wiadomości |
| GET | `/api/messages/:contactId` | CLIENT, TRAINER | Historia wiadomości z paginacją |

### Body Example

```json
{
  "receiverId": 15,
  "content": "Cześć, pamiętaj o treningu nóg."
}
```

---

# Relacja Trainer ↔ Client (TrainerUserRelation)

Większość modułów współpracy opiera się na tabeli pośredniej:

```prisma
TrainerUserRelation
```

Tabela wykorzystuje unikalny klucz złożony:

```prisma
@@unique([clientId, trainerId])
```

Dzięki temu:

- jedna para trener–klient istnieje tylko raz,
- dane pozostają spójne,
- usunięcie użytkownika automatycznie czyści:
  - plany treningowe,
  - wiadomości,
  - wydarzenia kalendarza.

Mechanizm wykorzystuje:

```prisma
onDelete: Cascade
```

---

# Uruchomienie Projektu Lokalnie

---

## 1. Instalacja zależności

```bash
npm install
```

---

## 2. Konfiguracja zmiennych środowiskowych

Utwórz plik `.env` w katalogu głównym projektu:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/olympo_db?schema=public"
JWT_SECRET="TwojSuperTajnyKluczDoTokenowJWT123"
PORT=3000
```

---

## 3. Migracje bazy danych

```bash
npx prisma migrate dev --name init
```

---

## 4. Uruchomienie aplikacji

```bash
npm run dev
```

---

# Stack Technologiczny

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

## Bezpieczeństwo

- JWT Authentication
- Role Based Access Control (RBAC)
- Hashowanie haseł
- Middleware autoryzacyjne

## Architektura

- REST API
- Modular Architecture
- Service Layer Pattern
- Prisma Relations
- Offset Pagination
- Lazy Loading Strategy

---

# Status Projektu

Projekt rozwijany jako kompleksowy backend ERP/CRM dla branży fitness z naciskiem na:

- automatyzację pracy recepcji,
- komunikację trener ↔ klient,
- skalowalność,
- wydajność,
- architekturę produkcyjną.
