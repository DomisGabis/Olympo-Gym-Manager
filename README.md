# Olympo Gym Manager - Backend API

Kompleksowy system ERP/CRM do zarządzania klubem fitness, automatyzacji pracy recepcji, obsługi karnetów oraz prowadzenia cyfrowej współpracy na linii **Trener - Klient**.

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
- edycję,
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
| DELETE | `/api/users/:id` | ADMIN | Kaskadowe usuwanie użytkownika |
| GET | `/api/users/profile` | Wszyscy zalogowani | Profil użytkownika |
| PATCH | `/api/users/profile` | Wszyscy zalogowani | Aktualizacja własnego profilu użytkownika |
| PATCH | `/api/users/:id` | ADMIN | Edycja profilu dowolnego użytkownika przez administratora |
| GET | `/api/users/trainers` | ADMIN, RECEPTIONIST | Lista trenerów |
| GET | `/api/users/clients` | ADMIN, RECEPTIONIST | Lista klientów |
| GET | `/api/users/receptionists` | ADMIN, RECEPTIONIST | Lista recepcjonistów |
| GET | `/api/users/admins` | ADMIN, RECEPTIONIST | Lista administratorów |
| GET | `/api/users/role/:role` | ADMIN, RECEPTIONIST | Lista użytkowników według roli |
| GET | `/api/users/counts` | ADMIN, RECEPTIONIST | Statystyki: ogólna liczba użytkowników i liczba w każdej roli |
| GET | `/api/users` | ADMIN, RECEPTIONIST | Lista użytkowników z opcjonalnym filtrem roli i wyszukiwaniem `search` |

| GET | `/api/relationships` | Wszyscy zalogowani | Zwraca trenerów dla klienta lub klientów dla trenera (dla aktualnie zalogowanego użytkownika) |
| GET | `/api/relationships/trainer/:id` | ADMIN, RECEPTIONIST | Zwraca listę klientów przypisanych do trenera o podanym id |

### Przykład search

```http
GET /api/users?role=CLIENT&search=an&page=1&limit=10
```

### Przykład roli

```http
GET /api/users/role/TRAINER?page=1&limit=10
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
| GET | `/api/memberships` | Wszyscy zalogowani | Lista karnetów |
| POST | `/api/memberships` | RECEPTIONIST | Dodanie karnetu |
| GET | `/api/memberships/my` | CLIENT | Status aktywnego karnetu |
| GET | `/api/memberships/user/:id` | ADMIN, RECEPTIONIST | Pobiera aktualny (aktywny) karnet wskazanego użytkownika |

---

# 3. Club Entries (Rejestracja Wizyt i Obecności)

## Za co odpowiada moduł

Moduł odpowiada za fizyczną kontrolę dostępu do klubu fitness oraz zarządzanie historią pobytów użytkowników.

System:
- weryfikuje posiadanie i ważność aktywnego członkostwa (karnetu),
- obsługuje rejestrację wejść oraz wyjść z klubu w architekturze REST,
- blokuje podwójne wejścia (brak możliwości rejestracji wejścia, jeśli klient nie zamknął poprzedniej wizyty),
- zapisuje precyzyjną historię obecności (czas zameldowania i wymeldowania),
- umożliwia zalogowanym użytkownikom wgląd we własną historię aktywności z opcją filtrowania po miesiącach.

---

## Wykorzystywane tabele

| Model Prisma | Tabela SQL |
|---|---|
| `ClubEntry` | `club_entries` |
| `Membership` | `memberships` |
| `User` | `users` |

---

## Endpointy

| Metoda | Endpoint | Dostęp | Opis / Parametry |
|---|---|---|---|
| POST | `/api/club-entries` | RECEPTIONIST, ADMIN | Rejestracja wejścia (Check-in) na podstawie kodu QR przekazanego w Body (`qrCode`). |
| PATCH | `/api/club-entries` | RECEPTIONIST, ADMIN | Rejestracja wyjścia (Check-out) na podstawie identyfikatora przekazanego w Body (`userId`). |
| GET | `/api/club-entries/my` | CLIENT, TRAINER, RECEPTIONIST, ADMIN | Pobranie własnej historii wizyt. Opcjonalny parametr w Query Stringu `?month=X` (np. `?month=5` lub `?month=2026-05`). |

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
| GET | `/api/exercises` | Wszyscy zalogowani | Lista ćwiczeń z paginacją, filtrem po kategorii i wyszukiwaniem `search` |
| GET | `/api/exercises/:id` | Wszyscy zalogowani | Szczegóły ćwiczenia |
| POST | `/api/exercises` | TRAINER, ADMIN | Dodanie ćwiczenia |
| PUT | `/api/exercises/:id` | TRAINER, ADMIN | Edycja ćwiczenia |
| DELETE | `/api/exercises/:id` | ADMIN | Usunięcie ćwiczenia |

### Przykład

```http
GET /api/exercises?category=Nogi&search=an&page=1&limit=10
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
| POST | `/api/training-plans` | TRAINER | Utworzenie planu dla klienta |
| GET | `/api/training-plans/my` | CLIENT | Pobranie własnych planów treningowych |
| GET | `/api/clients/:id/training-plans` | TRAINER, ADMIN | Podgląd planów treningowych klienta |
| PATCH | `/api/training-plans/:id` | CLIENT, TRAINER | Edycja planu treningowego (klient swój plan, trener plan klienta) |
| DELETE | `/api/training-plans/:id` | CLIENT, TRAINER | Usunięcie planu treningowego (klient lub trener) |
| POST | `/api/training-plans/:id/reset` | CLIENT, TRAINER | Resetuje postęp planu treningowego, aby można było wykonać go ponownie |
| PATCH | `/api/training-plans/entry/:entryId/toggle` | CLIENT | Aktualizacja progresu ćwiczenia w planie |

---

# 6. Calendar (Harmonogram i Rezerwacje)

## Za co odpowiada moduł

Moduł odpowiada za:

* zarządzanie harmonogramem trenerów personalnych,
* rezerwacje treningów 1-na-1,
* obsługę konsultacji,
* system akceptacji terminów,
* kontrolę dostępności trenerów,
* bezpieczne anulowanie spotkań.

---

## Inteligentny Endpoint `/my`

Zwraca spersonalizowany grafik w zależności od roli zalogowanego użytkownika:
* **Trener:** Widzi pełny harmonogram wszystkich swoich podopiecznych wraz z ich imionami i nazwiskami.
* **Klient:** Widzi wyłącznie swoje własne zaplanowane sesje oraz przypisanych do nich trenerów.

---


## Wykorzystywane tabele

| Model Prisma          | Tabela SQL               | Kluczowe pola                |
| --------------------- | ------------------------ | ---------------------------- |
| `CalendarEntry`       | `calendar_entries`       | `startAt`, `endAt`, `status` |
| `TrainerUserRelation` | `trainer_user_relations` | Relacja trener ↔ klient      |
| `User`                | `users`                  | Dane uczestników             |

---

## Statusy Rezerwacji

| Status      | Opis                        |
| ----------- | --------------------------- |
| `PENDING`   | Oczekuje na decyzję trenera |
| `CONFIRMED` | Rezerwacja zaakceptowana    |
| `REJECTED`  | Rezerwacja odrzucona        |

---

## Endpointy

| Metoda | Endpoint                           | Dostęp                 | Opis                                               |
| ------ | ---------------------------------- | ---------------------- | -------------------------------------------------- |
| POST   | `/api/calendar`                    | CLIENT, TRAINER        | Utworzenie rezerwacji lub wysłanie prośby o termin |
| GET    | `/api/calendar/my`                 | CLIENT, TRAINER        | Pobranie własnego harmonogramu                     |
| GET    | `/api/calendar/trainer/:trainerId` | CLIENT                 | Publiczny widok zajętości trenera                  |
| PATCH  | `/api/calendar/:id/status`         | TRAINER                | Akceptacja lub odrzucenie rezerwacji               |
| DELETE | `/api/calendar/:id`                | CLIENT, TRAINER, ADMIN | Anulowanie rezerwacji                              |

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
| GET | `/api/messages/:user-id` | CLIENT, TRAINER | Historia wiadomości |

### Body Example

```json
{
  "receiverId": 15,
  "content": "Cześć, pamiętaj o treningu nóg."
}
```
---

# 8. QR Codes (Kody QR i Bezpieczeństwo Wejść)

## Za co odpowiada moduł

Moduł odpowiada za generowanie bezpiecznych, tymczasowych kodów wejściowych dla klubowiczów.

Klient otrzymuje:

- dynamiczny kod QR do wejścia na siłownię,
- zabezpieczenie przed kradzieżą karnetu (np. poprzez wykonanie zrzutu ekranu),
- szybką i bezpieczną metodę autoryzacji podczas wejścia do klubu.

---

## Dynamiczne Kody (Bezpieczeństwo)

Zamiast przekazywać statyczny identyfikator użytkownika, system generuje tymczasowy token JWT:

```ts
jwt.sign(
  { staticQr, userId },
  secret,
  { expiresIn: "1m" }
);
````

Backend automatycznie:

* ukrywa oryginalny kod użytkownika wewnątrz tokenu JWT,
* ustawia czas ważności kodu na 60 sekund,
* odrzuca wygasłe tokeny podczas skanowania,
* zabezpiecza system przed ponownym wykorzystaniem starego kodu QR.

Dzięki temu nawet przechwycony lub zapisany obraz kodu QR staje się bezużyteczny po upływie jednej minuty.

---

## Wykorzystywane tabele

| Model Prisma | Tabela SQL |
| ------------ | ---------- |
| `User`       | `users`    |

---

## Endpointy

| Metoda | Endpoint                 | Dostęp | Opis                                                     |
| ------ | ------------------------ | ------ | -------------------------------------------------------- |
| GET    | `/api/qr-codes` | CLIENT | Generowanie dynamicznego kodu QR ważnego przez 60 sekund |

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