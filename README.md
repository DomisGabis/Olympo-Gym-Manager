# Olympo Gym Manager - Backend API

Kompleksowy system ERP/CRM do zarządzania klubem fitness, automatyzacji pracy recepcji, obsługi karnetów oraz prowadzenia cyfrowej współpracy na linii **Trener ↔ Klient**. 

Projekt został zbudowany przy użyciu **Node.js**, **Express**, **TypeScript** oraz **Prisma ORM** z bazą danych **PostgreSQL**.

---

## Architektura Systemu i Moduły

Aplikacja została zaprojektowana w architekturze modułowej. Każdy moduł odpowiada za osobną domenę biznesową, posiada własne serwisy (`.service.ts`), kontrolery (`.controller.ts`) oraz ścieżki routingu (`.routes.ts`).

### 1. Moduł: Users & Auth (Użytkownicy i Autoryzacja)
* **Za co odpowiada:** Rejestracja użytkowników, bezpieczne haszowanie haseł (bcrypt), logowanie oraz generowanie tokenów **JWT (Passport.js)**. Moduł ten odpowiada również za kontrolę dostępu na poziomie ról (RBAC) przy użyciu middleware `authorizeRoles`.
* **Dostępne role w systemie:** `CLIENT`, `TRAINER`, `RECEPTIONIST`, `ADMIN`.
* **Wykorzystywane tabele (Prisma):** `User` (mapowana na `users`).

### 2. Moduł: Memberships (Obsługa Karnetów i Recepcji)
* **Za co odpowiada:** * **Dla Klienta:** Przeglądanie oferty, zakup karnetów oraz pobieranie informacji o swoim aktualnym statusie członkowskim. Zawiera zaawansowaną logikę **kolejkowania karnetów** (jeśli klient ma aktywny karnet, kolejny zakupi jako "oczekujący w kolejce" i aktywuje się on automatycznie).
    * **Dla Recepcji / Admina:** Skanowanie cyfrowych kodów QR (`qrCode`) klientów przy wejściu do klubu. System waliduje ważność karnetu i rejestruje dokładny czas wejścia oraz wyjścia z obiektu.
* **Wykorzystywane tabele (Prisma):** `Membership` (`memberships`), `ClubEntry` (`club_entries`), `User`.

### 3.  Moduł: Exercises (Baza Ćwiczeń)
* **Za co odpowiada:** Pełny system zarządzania (CRUD) katalogiem ćwiczeń dostępnych na siłowni. Umożliwia filtrowanie ćwiczeń po kategoriach i poziomach trudności. Modyfikacja bazy jest zastrzeżona dla Trenerów i Administratorów, a usuwanie — ze względów bezpieczeństwa — wyłącznie dla Admina.
* **Zabezpieczenia bazy:** Zastosowano regułę `Restrict` – nie można usunąć ćwiczenia z bazy, jeśli jakikolwiek klient ma je aktualnie przypisane w swoim planie treningowym.
* **Wykorzystywane tabele (Prisma):** `Exercise` (`exercises`).

### 4. Moduł: Training Plans (Plany Treningowe i Progres)
* **Za co odpowiada:** Serce interakcji trenerskiej. Trener może rozpisać dla klienta kompletny, strukturyzowany plan treningowy na dany okres. Klient widzi go w swojej aplikacji jako interaktywną checklistę.
* **Logika Premium (Auto-Progres):** Za każdym razem, gdy klient oznaczy pojedyncze ćwiczenie jako wykonane (`isCompleted: true`), backend automatycznie przelicza procentowy postęp całego planu i zapisuje go w bazie.
* **Wykorzystywane tabele (Prisma):** `TrainingPlan` (`training_plans`), `PlanEntry` (`plan_entries`), `TrainerUserRelation`, `Exercise`.

### 5. Moduł: Calendar (Harmonogram i Rezerwacje)
* **Za co odpowiada:** Umawianie spotkań, konsultacji oraz treningów personalnych na żywo. Trener rezerwuje termin dla klienta, a system pilnuje poprawności dat (data zakończenia nie może być wcześniejsza niż rozpoczęcia). Punkt końcowy `/my` zachowuje się inteligentnie: trener widzi spotkania ze wszystkimi podopiecznymi, a klient widzi terminy swoich treningów z przypisanymi trenerami.
* **Wykorzystywane tabele (Prisma):** `CalendarEntry` (`calendar_entries`), `TrainerUserRelation`, `User`.

### 6. Moduł: Messages (Wewnętrzny Komunikator)
* **Za co odpowiada:** Pozwala na bezpośredni czat tekstowy między trenerem a klientem wewnątrz aplikacji. Wiadomości są zapisywane chronologicznie. Moduł automatycznie tworzy relację partnerską (`TrainerUserRelation`) w bazie danych, jeśli do tej pory trener i klient nie współpracowali ze sobą, a jedna ze stron wyśle pierwszą wiadomość.
* **Wykorzystywane tabele (Prisma):** `Message` (`messages`), `TrainerUserRelation`.

---

## Rola Tabeli Pośredniej (`TrainerUserRelation`)

Większość modułów dedykowanych współpracy (`Training Plans`, `Calendar`, `Messages`) nie łączy użytkowników bezpośrednio. Wszelkie interakcje opierają się na relacji zdefiniowanej w tabeli `TrainerUserRelation`. Posiada ona unikalny klucz złożony `@@unique([clientId, trainerId])`, co gwarantuje, że para Trener-Klient istnieje w systemie tylko raz, a usunięcie konta użytkownika (dzięki `onDelete: Cascade`) automatycznie czyści powiązane z nim plany, czaty i kalendarze.

---

## Jak uruchomić projekt lokalnie

1.  **Zainstaluj zależności:**
    ```bash
    npm install
    ```
2.  **Skonfiguruj zmienne środowiskowe:** Create `.env` file i uzupełnij dane:
    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/olympo_db?schema=public"
    JWT_SECRET="TwojSuperTajnyKluczDoTokenowJWT123"
    PORT=3000
    ```
3.  **Uruchom migracje bazy danych i Seeder (automatyczne dane testowe):**
    ```bash
    npx prisma migrate dev --name init
    ```
4.  **Uruchom serwer w trybie deweloperskim:**
    ```bash
    npm run dev
    ```