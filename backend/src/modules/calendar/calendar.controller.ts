import { Request, Response } from 'express';
import { CalendarService } from './calendar.service';

const calendarService = new CalendarService();

export class CalendarController {
  
  // Rezerwacja terminu (Elastyczna: Trener dla klienta lub Klient dla trenera)
  async create(req: Request, res: Response) {
    try {
      const userPayload = req.user as any;
      const { targetId, title, startAt, endAt } = req.body; // targetId to odpowiednio clientId lub trainerId

      if (!targetId || !title || !startAt || !endAt) {
        return res.status(400).json({ success: false, message: 'Wszystkie pola (targetId, title, startAt, endAt) są wymagane.' });
      }

      const entry = await calendarService.createEntry(
        userPayload.id,
        targetId,
        userPayload.role,
        title,
        startAt,
        endAt
      );

      const message = userPayload.role === 'TRAINER' 
        ? 'Trening został pomyślnie wpisany w kalendarz.' 
        : 'Prośba o rezerwację terminu została wysłana do trenera.';

      return res.status(201).json({ success: true, message, data: entry });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Pobranie grafiku konkretnego trenera przez klienta (widok "Booksy" przed rezerwacją)
  async getTrainerScheduleForClient(req: Request, res: Response) {
  try {
    // Rozwiązanie: Dodajemy "as string"
    const trainerId = req.params.trainerId as string;
    const schedule = await calendarService.getTrainerScheduleForClient(trainerId);
    return res.status(200).json({ success: true, data: schedule });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async handleApproval(req: Request, res: Response) {
  try {
    const trainerPayload = req.user as any;
    // Rozwiązanie: Dodajemy "as string"
    const id = req.params.id as string;
    const { status } = req.body; 

    if (!['CONFIRMED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy status. Dozwolone: CONFIRMED, REJECTED.' });
    }

    const updatedEntry = await calendarService.updateStatus(id, trainerPayload.id, status);
    return res.status(200).json({ success: true, message: `Status rezerwacji zmieniony na: ${status}`, data: updatedEntry });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

  // Pobranie swojego spersonalizowanego grafiku
  async getMySchedule(req: Request, res: Response) {
    try {
      const userPayload = req.user as any;
      let schedule;

      if (userPayload.role === 'TRAINER') {
        schedule = await calendarService.getTrainerSchedule(userPayload.id);
      } else if (userPayload.role === 'CLIENT') {
        schedule = await calendarService.getClientSchedule(userPayload.id);
      } else {
        return res.status(403).json({ success: false, message: 'Brak uprawnień do przeglądania tego harmonogramu.' });
      }

      return res.status(200).json({ success: true, data: schedule });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Odwołanie rezerwacji (Bezpieczne: Klient, Trener lub Admin)
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userPayload = req.user as any;

      await calendarService.deleteEntry(id, userPayload.id, userPayload.role);
      return res.status(200).json({ success: true, message: 'Wydarzenie z kalendarza zostało usunięte (odwołane).' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}