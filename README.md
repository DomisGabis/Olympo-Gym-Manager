# Olympo Gym Manager - Backend API

Kompleksowy system ERP/CRM do zarządzania klubem fitness, automatyzacji pracy recepcji, obsługi karnetów oraz prowadzenia cyfrowej współpracy na linii **Trener ↔ Klient**.

Projekt został zbudowany przy użyciu:

- **Node.js**
- **Express**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**

---

# Architektura Systemu i Moduły

Aplikacja została zaprojektowana w architekturze modułowej. Każdy moduł odpowiada za osobną domenę biznesową i posiada własne:

- serwisy (`*.service.ts`),
- kontrolery (`*.controller.ts`),
- routing (`*.routes.ts`),
- middleware autoryzacyjne,
- logikę biznesową.

---

# Globalna Mechanika Paginacji i Leniwego Ładowania

Aby zapewnić wysoką wydajność aplikacji, ograniczyć obciążenie bazy danych oraz zmniejszyć transfer danych na urządzeniach mobilnych, system wykorzystuje mechanizm:

- **Offset Pagination**
- **Lazy Loading**
- **Messenger-like Sync**

---

## Query Parameters

Wszystkie endpointy obsługujące paginację przyjmują opcjonalne parametry:

| Parametr | Domyślna wartość | Opis |
|---|---|---|
| `page` | `1` | Numer strony |
| `limit` | `10` lub `20` | Liczba rekordów |

### Przykład

```http
GET /api/exercises?page=2&limit=10
```

---

## Struktura Odpowiedzi

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

## Paginacja w Komunikatorze (Messenger-like Sync)

Moduł wiadomości działa inaczej niż standardowa paginacja katalogów danych.

### Mechanizm działania

1. Backend pobiera wiadomości malejąco (`desc`)
2. Zwracane są najnowsze wpisy
3. Tablica zostaje odwrócona przez `.reverse()`

Dzięki temu frontend otrzymuje:

- naturalny układ chronologiczny,
- możliwość dociągania starszych wiadomości,
- mechanikę identyczną jak Messenger / WhatsApp.

### Przykład

```http
GET /api/messages/15?page=2&limit=20
```

---

# Autoryzacja

Wszystkie chronione endpointy wymagają tokenu JWT:

```http
Authorization: Bearer <TWÓJ_TOKEN_JWT>
```

---

# Dostępne Role Systemowe

| Rola | Opis |
|---|---|
| `CLIENT` | Standardowy klient siłowni |
| `TRAINER` | Trener personalny |
| `RECEPTIONIST` | Obsługa recepcji |
| `ADMIN` | Administrator systemu |

---

# 1. Users & Auth (Użytkownicy i Autoryzacja)

## Za co odpowiada moduł

- rejestracja użytkowników,
- logowanie,
- JWT Authentication,
- Role Based Access Control (RBAC),
- zarządzanie użytkownikami,
- profile użytkowników.

---

## Wykorzystywane tabele

| Model Prisma | Tabela SQL |
|---|---|
| `User` | `users` |

---

## Endpointy

| Metoda | Endpoint | Dostęp | Opis |
|---|---|---|---|
| POST | `/api/auth/register` | Publiczny | Rejestracja użytkownika |
| POST | `/api/auth/login` | Publiczny | Logowanie i JWT |
| GET | `/api/auth/admin-dashboard` | ADMIN | Test autoryzacji |
| DELETE | `/api/auth/users/:id` | ADMIN | Kaskadowe usuwanie użytkownika |
| GET | `/api/users/profile` | Wszyscy zalogowani | Profil użytkownika |
| GET | `/api/users/trainers` | Wszyscy zalogowani | Lista trenerów |
| GET | `/api/users` | ADMIN, RECEPTIONIST | Lista użytkowników |

### Przykład

```http
GET /api/users?role=CLIENT&page=1&limit=10
```

---

# 2. Memberships (Obsługa Karnetów i Subskrypcji)

## Za co odpowiada moduł

Moduł odpowiada wyłącznie za:

- sprzedaż karnetów,
- zarządzanie subskrypcjami,
- aktywację członkostw,
- kolejkę oczekujących karnetów,
- status ważności członkostwa.

---

## Mechanizm Kolejkowania Karnetów

Jeżeli klient posiada aktywny karnet i zakupi kolejny:

1. nowy karnet otrzymuje status `PENDING`,
2. pozostaje w kolejce,
3. aktywuje się automatycznie po wygaśnięciu poprzedniego.

Dzięki temu system zapewnia ciągłość członkostwa bez ingerencji recepcji.

---

## Wykorzystywane tabele

| Model Prisma | Tabela SQL |
|---|---|
| `Membership` | `memberships` |
| `User` | `users` |

---

## Endpointy

| Metoda | Endpoint | Dostęp | Opis |
|---|---|---|---|
| GET | `/api/memberships/types` | Wszyscy zalogowani | Lista karnetów |
| POST | `/api/memberships/buy` | CLIENT | Zakup karnetu |
| GET | `/api/memberships/my` | CLIENT | Status aktywnego karnetu |

---

# 3. Check-In (Rejestracja Wizyt i Obecności)

## Za co odpowiada moduł

Moduł odpowiada za fizyczną kontrolę dostępu do klubu fitness.

System:

- weryfikuje aktywne członkostwo,
- obsługuje wejścia i wyjścia,
- blokuje podwójne wejścia,
- zapisuje historię obecności.

---

## Wykorzystywane tabele

| Model Prisma | Tabela SQL |
|---|---|
| `ClubEntry` | `club_entries` |
| `Membership` | `memberships` |
| `User` | `users` |

---

## Endpointy

| Metoda | Endpoint | Dostęp | Opis |
|---|---|---|---|
| POST | `/api/check-in/in` | RECEPTIONIST, ADMIN | Rejestracja wejścia |
| POST | `/api/check-in/out` | RECEPTIONIST, ADMIN | Rejestracja wyjścia |

---

# 4. Exercises (Baza Ćwiczeń)

## Za co odpowiada moduł

- katalog ćwiczeń,
- filtrowanie kategorii,
- poziomy trudności,
- CRUD ćwiczeń,
- zarządzanie biblioteką treningową.

---

## Zabezpieczenia Bazy

Zastosowano regułę:

```prisma
onDelete: Restrict
```

Ćwiczenie nie może zostać usunięte, jeśli jest wykorzystywane w planie treningowym.

---

## Wykorzystywane tabele

| Model Prisma | Tabela SQL |
|---|---|
| `Exercise` | `exercises` |

---

## Endpointy

| Metoda | Endpoint | Dostęp | Opis |
|---|---|---|---|
| GET | `/api/exercises` | Wszyscy zalogowani | Lista ćwiczeń |
| GET | `/api/exercises/:id` | Wszyscy zalogowani | Szczegóły ćwiczenia |
| POST | `/api/exercises` | TRAINER, ADMIN | Dodanie ćwiczenia |
| PUT | `/api/exercises/:id` | TRAINER, ADMIN | Edycja ćwiczenia |
| DELETE | `/api/exercises/:id` | ADMIN | Usunięcie ćwiczenia |

### Przykład

```http
GET /api/exercises?category=Nogi&level=INTERMEDIATE
```

---

# 5. Training Plans (Plany Treningowe i Progres)

## Za co odpowiada moduł

System umożliwia trenerom tworzenie kompleksowych planów treningowych dla klientów.

Klient otrzymuje:

- checklistę ćwiczeń,
- monitoring progresu,
- aktualny status realizacji planu.

---

## Auto-Progres

Po oznaczeniu ćwiczenia jako wykonane:

```ts
isCompleted: true
```

backend automatycznie:

- przelicza progres planu,
- aktualizuje procent ukończenia,
- zapisuje zmiany w bazie.

---

## Wykorzystywane tabele

| Model Prisma | Tabela SQL |
|---|---|
| `TrainingPlan` | `training_plans` |
| `PlanEntry` | `plan_entries` |
| `Exercise` | `exercises` |
| `TrainerUserRelation` | `trainer_user_relations` |

---

## Endpointy

| Metoda | Endpoint | Dostęp | Opis |
|---|---|---|---|
| POST | `/api/training-plans` | TRAINER, ADMIN | Utworzenie planu |
| GET | `/api/training-plans/my` | CLIENT | Pobranie planów |
| GET | `/api/training-plans/client/:id` | TRAINER, ADMIN | Podgląd klienta |
| PATCH | `/api/training-plans/entries/:id` | CLIENT | Aktualizacja progresu |

---

# 6. Calendar (Harmonogram i Rezerwacje)

## Za co odpowiada moduł

- treningi personalne,
- konsultacje,
- rezerwacje,
- harmonogram trenerów,
- grafik klientów.

---

## Inteligentny Endpoint `/my`

- trener widzi wszystkich podopiecznych,
- klient widzi tylko własne sesje.

---

## Wykorzystywane tabele

| Model Prisma | Tabela SQL |
|---|---|
| `CalendarEntry` | `calendar_entries` |
| `TrainerUserRelation` | `trainer_user_relations` |
| `User` | `users` |

---

## Endpointy

| Metoda | Endpoint | Dostęp | Opis |
|---|---|---|---|
| POST | `/api/calendar/book` | TRAINER, ADMIN | Rezerwacja spotkania |
| GET | `/api/calendar/my` | CLIENT, TRAINER | Harmonogram |
| DELETE | `/api/calendar/:id` | CLIENT, TRAINER, ADMIN | Anulowanie |

---

# 7. Messages (Wewnętrzny Komunikator)

## Za co odpowiada moduł

- czat trener ↔ klient,
- historia wiadomości,
- relacje partnerskie,
- komunikacja wewnętrzna.

---

## Automatyczne Tworzenie Relacji

Jeżeli trener i klient nie współpracowali wcześniej:

- system automatycznie utworzy `TrainerUserRelation`,
- relacja zostanie zapisana przy pierwszej wiadomości.

---

## Wykorzystywane tabele

| Model Prisma | Tabela SQL |
|---|---|
| `Message` | `messages` |
| `TrainerUserRelation` | `trainer_user_relations` |

---

## Endpointy

| Metoda | Endpoint | Dostęp | Opis |
|---|---|---|---|
| POST | `/api/messages` | CLIENT, TRAINER | Wysłanie wiadomości |
| GET | `/api/messages/:contactId` | CLIENT, TRAINER | Historia wiadomości |

### Body Example

```json
{
  "receiverId": 15,
  "content": "Cześć, pamiętaj o treningu nóg."
}
```

---

# Rola Tabeli Pośredniej (`TrainerUserRelation`)

Większość modułów współpracy korzysta z relacji pośredniej:

```prisma
TrainerUserRelation
```

Klucz złożony:

```prisma
@@unique([clientId, trainerId])
```

Gwarantuje:

- unikalność relacji trener ↔ klient,
- spójność danych,
- bezpieczeństwo relacji.

---

## Cascade Delete

Usunięcie użytkownika automatycznie usuwa:

- plany treningowe,
- wiadomości,
- wpisy kalendarza,
- relacje partnerskie.

```prisma
onDelete: Cascade
```

---

# Jak Uruchomić Projekt Lokalnie

## 1. Instalacja zależności

```bash
npm install
```

---

## 2. Konfiguracja `.env`

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/olympo_db?schema=public"
JWT_SECRET="TwojSuperTajnyKluczDoTokenowJWT123"
PORT=3000
```

---

## 3. Migracje Bazy Danych

```bash
npx prisma migrate dev --name init
```

---

## 4. Uruchomienie Serwera

```bash
npm run dev
```