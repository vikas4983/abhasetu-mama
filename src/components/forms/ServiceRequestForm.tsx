import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

const serviceRequestSchema = z.object({
  patientName: z.string().min(2, 'validation.name'),
  mobileNumber: z.string().min(10, 'validation.mobile'),
  preferredDate: z.string().min(4, 'validation.date'),
  location: z.string().min(2, 'validation.location'),
});

type ServiceRequestFormValues = z.infer<typeof serviceRequestSchema>;

interface ServiceRequestFormProps {
  title: string;
}

export function ServiceRequestForm({ title }: ServiceRequestFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceRequestFormValues>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      patientName: 'Ananya Verma',
      mobileNumber: '+91 98765 42070',
      preferredDate: 'May 20, 2026',
      location: 'Sector 21, New Delhi',
    },
  });

  const onSubmit = (values: ServiceRequestFormValues) => {
    console.info('Demo service request', values);
  };

  return (
    <form className="form-panel" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h3>{title} Request</h3>
      <div className="form-grid">
        <label>
          Patient Name
          <input {...register('patientName')} aria-invalid={Boolean(errors.patientName)} />
          {errors.patientName ? <span className="field-error">{errors.patientName.message}</span> : null}
        </label>
        <label>
          Mobile Number
          <input {...register('mobileNumber')} aria-invalid={Boolean(errors.mobileNumber)} />
          {errors.mobileNumber ? <span className="field-error">{errors.mobileNumber.message}</span> : null}
        </label>
        <label>
          Preferred Date
          <input {...register('preferredDate')} aria-invalid={Boolean(errors.preferredDate)} />
          {errors.preferredDate ? <span className="field-error">{errors.preferredDate.message}</span> : null}
        </label>
        <label>
          Location
          <input {...register('location')} aria-invalid={Boolean(errors.location)} />
          {errors.location ? <span className="field-error">{errors.location.message}</span> : null}
        </label>
      </div>
      <button className="primary-action" type="submit" disabled={isSubmitting}>
        {t('actions.submit')}
      </button>
    </form>
  );
}
