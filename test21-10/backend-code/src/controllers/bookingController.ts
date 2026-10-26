import { Request, Response } from 'express';
import { query } from '../db/index';

export const getBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pnr } = req.params;
    
    if (!pnr) {
      res.status(400).json({
        status: 'error',
        code: 'VALIDATION_FAILED',
        message: 'PNR is required.'
      });
      return;
    }

    const result = await query('SELECT * FROM bookings WHERE pnr = $1', [pnr]);

    if (result.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'Booking not found.'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: 'An error occurred while retrieving the booking.'
    });
  }
};

export const rebookFlight = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pnr } = req.params;
    const { newFlightDate, newFlightNumber } = req.body;

    if (!pnr || !newFlightDate || !newFlightNumber) {
      res.status(400).json({
        status: 'error',
        code: 'VALIDATION_FAILED',
        message: 'PNR, newFlightDate, and newFlightNumber are required.'
      });
      return;
    }

    // Check if booking exists
    const bookingResult = await query('SELECT * FROM bookings WHERE pnr = $1', [pnr]);
    if (bookingResult.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'Booking not found.'
      });
      return;
    }

    const currentBooking = bookingResult.rows[0];
    
    // Mock fare difference calculation
    const fareDifference = 150.00; 

    // Update booking
    const updateResult = await query(
      'UPDATE bookings SET flight_date = $1, flight_number = $2, updated_at = NOW() WHERE pnr = $3 RETURNING *',
      [newFlightDate, newFlightNumber, pnr]
    );

    res.status(200).json({
      status: 'success',
      data: {
        booking: updateResult.rows[0],
        fareDifference
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: 'An error occurred while rebooking the flight.'
    });
  }
};