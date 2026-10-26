import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

const DICTIONARY = {
  en: {
    title: 'Booking Details',
    pnrLabel: 'PNR:',
    flightLabel: 'Flight:',
    dateLabel: 'Date:',
    statusLabel: 'Status:',
    rebookTitle: 'Rebook Flight',
    newDateLabel: 'New Date',
    confirmRebook: 'Confirm Rebooking',
    loading: 'Loading booking details...',
    errorFetch: 'Error fetching booking details.',
    notFound: 'Booking not found.',
    rebookSuccess: 'Flight rebooked successfully.',
    rebookError: 'Failed to rebook flight.',
    back: 'Back to Home'
  },
  ar: {
    title: 'تفاصيل الحجز',
    pnrLabel: 'رقم الحجز:',
    flightLabel: 'الرحلة:',
    dateLabel: 'التاريخ:',
    statusLabel: 'الحالة:',
    rebookTitle: 'إعادة حجز الرحلة',
    newDateLabel: 'تاريخ جديد',
    confirmRebook: 'تأكيد إعادة الحجز',
    loading: 'جاري تحميل تفاصيل الحجز...',
    errorFetch: 'خطأ في جلب تفاصيل الحجز.',
    notFound: 'لم يتم العثور على الحجز.',
    rebookSuccess: 'تمت إعادة حجز الرحلة بنجاح.',
    rebookError: 'فشلت إعادة حجز الرحلة.',
    back: 'العودة للرئيسية'
  }
};

interface BookingData {
  pnr: string;
  flightNumber: string;
  departureDate: string;
  status: string;
}

export const BookingPage: React.FC = () => {
  const { pnr } = useParams<{ pnr: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const t = DICTIONARY[language as keyof typeof DICTIONARY] || DICTIONARY.en;

  const [newDate, setNewDate] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking', pnr],
    queryFn: async () => {
      if (!pnr) throw new Error('PNR is required');
      const response = await apiClient.get<{ status: string; data: BookingData }>(`/api/bookings/${pnr}`);
      return response.data.data;
    },
    enabled: !!pnr
  });

  const rebookMutation = useMutation({
    mutationFn: async (date: string) => {
      const response = await apiClient.put(`/api/bookings/${pnr}/rebook`, { newDate: date });
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage(t.rebookSuccess);
      queryClient.invalidateQueries({ queryKey: ['booking', pnr] });
      setNewDate('');
    }
  });

  const handleRebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDate) {
      setSuccessMessage('');
      rebookMutation.mutate(newDate);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <p className="text-lg text-gray-600">{t.loading}</p>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <p className="text-lg text-red-600 mb-4">{t.errorFetch}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {t.back}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 text-start">{t.title}</h1>
      
      <div className="space-y-4 mb-8 text-start">
        <div className="flex flex-col sm:flex-row sm:items-center border-b pb-2">
          <span className="font-semibold w-32 text-gray-600">{t.pnrLabel}</span>
          <span className="text-gray-900">{booking.pnr}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center border-b pb-2">
          <span className="font-semibold w-32 text-gray-600">{t.flightLabel}</span>
          <span className="text-gray-900">{booking.flightNumber}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center border-b pb-2">
          <span className="font-semibold w-32 text-gray-600">{t.dateLabel}</span>
          <span className="text-gray-900">{new Date(booking.departureDate).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center border-b pb-2">
          <span className="font-semibold w-32 text-gray-600">{t.statusLabel}</span>
          <span className="text-gray-900 capitalize">{booking.status}</span>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-md border border-gray-200 text-start">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{t.rebookTitle}</h2>
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
            {successMessage}
          </div>
        )}
        
        {rebookMutation.isError && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
            {t.rebookError}
          </div>
        )}

        <form onSubmit={handleRebook} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="newDate" className="mb-2 font-medium text-gray-700">
              {t.newDateLabel}
            </label>
            <input
              type="date"
              id="newDate"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!newDate || rebookMutation.isPending}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {rebookMutation.isPending ? '...' : t.confirmRebook}
          </button>
        </form>
      </div>
    </div>
  );
};