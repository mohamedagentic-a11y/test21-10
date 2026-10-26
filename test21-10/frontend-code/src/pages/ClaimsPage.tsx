import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

const DICTIONARY = {
  en: {
    pageTitle: 'Baggage Claims',
    submitSection: 'Submit a New Claim',
    trackSection: 'Track Existing Claim',
    pnrLabel: 'Booking Reference (PNR)',
    bagTagLabel: 'Bag Tag Number',
    descLabel: 'Description of Issue',
    submitBtn: 'Submit Claim',
    submitting: 'Submitting...',
    claimIdLabel: 'Claim ID',
    trackBtn: 'Track Claim',
    tracking: 'Tracking...',
    statusLabel: 'Claim Status',
    successSubmit: 'Claim submitted successfully. Your Claim ID is: ',
    errorSubmit: 'Failed to submit claim. Please check your details and try again.',
    errorTrack: 'Failed to track claim. Please verify the Claim ID.',
    missingSubmitFields: 'Please fill all fields to submit.',
    missingTrackField: 'Please enter a Claim ID to track.',
    noData: 'No data available for this claim.'
  },
  ar: {
    pageTitle: 'مطالبات الأمتعة',
    submitSection: 'تقديم مطالبة جديدة',
    trackSection: 'تتبع مطالبة حالية',
    pnrLabel: 'رقم الحجز (PNR)',
    bagTagLabel: 'رقم بطاقة الأمتعة',
    descLabel: 'وصف المشكلة',
    submitBtn: 'تقديم المطالبة',
    submitting: 'جاري التقديم...',
    claimIdLabel: 'رقم المطالبة',
    trackBtn: 'تتبع المطالبة',
    tracking: 'جاري التتبع...',
    statusLabel: 'حالة المطالبة',
    successSubmit: 'تم تقديم المطالبة بنجاح. رقم المطالبة الخاص بك هو: ',
    errorSubmit: 'فشل تقديم المطالبة. يرجى التحقق من التفاصيل الخاصة بك والمحاولة مرة أخرى.',
    errorTrack: 'فشل تتبع المطالبة. يرجى التحقق من رقم المطالبة.',
    missingSubmitFields: 'يرجى تعبئة جميع الحقول للتقديم.',
    missingTrackField: 'يرجى إدخال رقم المطالبة للتتبع.',
    noData: 'لا توجد بيانات متاحة لهذه المطالبة.'
  }
};

export const ClaimsPage: React.FC = () => {
  const { language } = useLanguage();
  const t = DICTIONARY[language as keyof typeof DICTIONARY] || DICTIONARY.en;

  const [submitForm, setSubmitForm] = useState({ pnr: '', bagTagNumber: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedClaimId, setSubmittedClaimId] = useState<string | null>(null);

  const [trackClaimId, setTrackClaimId] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackedClaimData, setTrackedClaimData] = useState<any | null>(null);

  const canSubmit = submitForm.pnr.trim() !== '' && submitForm.bagTagNumber.trim() !== '' && submitForm.description.trim() !== '';
  const canTrack = trackClaimId.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmittedClaimId(null);

    try {
      const response = await apiClient.post('/api/claims', submitForm);
      if (response.data?.status === 'success' && response.data?.data?.claimId) {
        setSubmittedClaimId(response.data.data.claimId);
        setSubmitForm({ pnr: '', bagTagNumber: '', description: '' });
      } else {
        setSubmitError(t.errorSubmit);
      }
    } catch (err) {
      setSubmitError(t.errorSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canTrack) return;

    setIsTracking(true);
    setTrackError(null);
    setTrackedClaimData(null);

    try {
      const response = await apiClient.get(`/api/claims/${trackClaimId}`);
      if (response.data?.status === 'success' && response.data?.data) {
        setTrackedClaimData(response.data.data);
      } else {
        setTrackError(t.errorTrack);
      }
    } catch (err) {
      setTrackError(t.errorTrack);
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-start text-gray-900">{t.pageTitle}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Submit Claim Section */}
        <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-start text-gray-800">{t.submitSection}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-start mb-1">
                {t.pnrLabel}
              </label>
              <input
                type="text"
                value={submitForm.pnr}
                onChange={(e) => setSubmitForm({ ...submitForm, pnr: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 text-start focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 text-start mb-1">
                {t.bagTagLabel}
              </label>
              <input
                type="text"
                value={submitForm.bagTagNumber}
                onChange={(e) => setSubmitForm({ ...submitForm, bagTagNumber: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 text-start focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 text-start mb-1">
                {t.descLabel}
              </label>
              <textarea
                value={submitForm.description}
                onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 text-start focus:ring-blue-500 focus:border-blue-500 h-24"
                disabled={isSubmitting}
              />
            </div>

            {submitError && (
              <div className="text-red-600 text-sm text-start bg-red-50 p-2 rounded">
                {submitError}
              </div>
            )}

            {submittedClaimId && (
              <div className="text-green-700 text-sm text-start bg-green-50 p-3 rounded border border-green-200">
                {t.successSubmit} <span className="font-bold">{submittedClaimId}</span>
              </div>
            )}

            <div className="flex items-center justify-start space-x-4 space-x-reverse">
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                title={!canSubmit ? t.missingSubmitFields : ''}
              >
                {isSubmitting ? t.submitting : t.submitBtn}
              </button>
              {!canSubmit && <span className="text-sm text-gray-500 ms-3">{t.missingSubmitFields}</span>}
            </div>
          </form>
        </section>

        {/* Track Claim Section */}
        <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-start text-gray-800">{t.trackSection}</h2>
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-start mb-1">
                {t.claimIdLabel}
              </label>
              <input
                type="text"
                value={trackClaimId}
                onChange={(e) => setTrackClaimId(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-start focus:ring-blue-500 focus:border-blue-500"
                disabled={isTracking}
              />
            </div>

            {trackError && (
              <div className="text-red-600 text-sm text-start bg-red-50 p-2 rounded">
                {trackError}
              </div>
            )}

            <div className="flex items-center justify-start space-x-4 space-x-reverse">
              <button
                type="submit"
                disabled={!canTrack || isTracking}
                className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                title={!canTrack ? t.missingTrackField : ''}
              >
                {isTracking ? t.tracking : t.trackBtn}
              </button>
              {!canTrack && <span className="text-sm text-gray-500 ms-3">{t.missingTrackField}</span>}
            </div>
          </form>

          {trackedClaimData && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 text-start mb-2">{t.statusLabel}</h3>
              <div className="space-y-2 text-start">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{t.claimIdLabel}:</span> {trackedClaimData.id || trackClaimId}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{t.statusLabel}:</span> {trackedClaimData.status || t.noData}
                </p>
                {trackedClaimData.description && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{t.descLabel}:</span> {trackedClaimData.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};