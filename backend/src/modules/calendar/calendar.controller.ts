import { Request, Response } from 'express';
import { CalendarService } from './calendar.service';

const calendarService = new CalendarService();

export class CalendarController {
  
  // Trener rezerwuje termin dla klienta
  async create(req: Request, res: Response) {
    try {
      const trainerPayload = req.user as any;
      const { clientId, title, startAt, endAt } = req.body;

      if (!clientId || !title || !startAt || !endAt) {
        return res.status(400).json({ success: false, message: 'Wszystkie pola (clientId, title, startAt, endAt) są wymagane.' });
      }

      const entry = await calendarService.createEntry(
        trainerPayload.id,
        clientId,
        title,
        startAt,
        endAt
      );

      return res.status(201).json({ success: true, message: 'Trening został pomyślnie wpisany w kalendarz.', data: entry });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Sprytny endpoint: zwraca grafik w zależności od tego, kto pyta
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

  // Odwołanie rezerwacji
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await calendarService.deleteEntry(id);
      return res.status(200).json({ success: true, message: 'Wydarzenie z kalendarza zostało usunięte (odwołane).' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}