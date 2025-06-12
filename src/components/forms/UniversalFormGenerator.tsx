import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

// Base field types
export enum FieldType {
  Text = 'text',
  Email = 'email',
  Phone = 'phone',
  Number = 'number',
  Password = 'password',
  Textarea = 'textarea',
  Select = 'select',
  MultiSelect = 'multiselect',
  Checkbox = 'checkbox',
  Radio = 'radio',
  Date = 'date',
  DateTime = 'datetime',
  File = 'file',
  Hidden = 'hidden',
  Currency = 'currency',
  Percentage = 'percentage',
}

// Field configuration interface
export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  validation?: z.ZodSchema;
  options?: Array<{ value: string | number; label: string }> | string[];
  defaultValue?: any;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  accept?: string; // For file inputs
  multiple?: boolean;
  rows?: number; // For textarea
  dependencies?: {
    field: string;
    value: any;
    action: 'show' | 'hide' | 'enable' | 'disable';
  }[];
}

// Form configuration interface
export interface FormConfig {
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  submitLabel?: string;
  cancelLabel?: string;
  layout?: 'single' | 'two-column' | 'three-column';
  onSubmit?: (data: any) => void | Promise<void>;
  onCancel?: () => void;
  defaultValues?: Record<string, any>;
  loading?: boolean;
}

// Utility functions for preprocessing
export const emptyToUndefined = (value: any) => {
  if (value === '' || value === null) return undefined;
  return value;
};

export const emptyToNull = (value: any) => {
  if (value === '' || value === undefined) return null;
  return value;
};

export const stringToNumber = (value: any) => {
  if (typeof value === 'string' && value.trim() !== '') {
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  }
  return value;
};

// Form field component
const FormField: React.FC<{
  field: FormFieldConfig;
  form: UseFormReturn<any>;
  watchedValues: Record<string, any>;
}> = ({ field, form, watchedValues }) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;

  // Check field dependencies
  const shouldShow =
    field.dependencies?.every(dep => {
      const depValue = watchedValues[dep.field];
      return dep.action === 'show' ? depValue === dep.value : depValue !== dep.value;
    }) ?? true;

  const shouldEnable =
    field.dependencies?.every(dep => {
      const depValue = watchedValues[dep.field];
      return dep.action === 'enable' ? depValue === dep.value : depValue !== dep.value;
    }) ?? true;

  const isDisabled = field.disabled || !shouldEnable;
  const error = errors[field.name];

  if (!shouldShow || field.hidden) {
    return null;
  }

  const baseClasses = `
    w-full px-3 py-2 border rounded-md transition-colors duration-200
    ${
      error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }
    ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    focus:outline-none focus:ring-2 focus:ring-opacity-50
  `;

  const renderField = () => {
    switch (field.type) {
      case FieldType.Textarea:
        return (
          <textarea
            {...register(field.name)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            rows={field.rows || 3}
            className={baseClasses}
          />
        );

      case FieldType.Select:
        return (
          <select {...register(field.name)} disabled={isDisabled} className={baseClasses}>
            <option value="">Select {field.label.toLowerCase()}...</option>
            {field.options?.map((option, index) => {
              const value = typeof option === 'string' ? option : option.value;
              const label = typeof option === 'string' ? option : option.label;
              return (
                <option key={index} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        );

      case FieldType.MultiSelect:
        return (
          <select
            {...register(field.name)}
            multiple
            disabled={isDisabled}
            className={`${baseClasses} min-h-[100px]`}
          >
            {field.options?.map((option, index) => {
              const value = typeof option === 'string' ? option : option.value;
              const label = typeof option === 'string' ? option : option.label;
              return (
                <option key={index} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        );

      case FieldType.Checkbox:
        return (
          <div className="flex items-center">
            <input
              {...register(field.name)}
              type="checkbox"
              disabled={isDisabled}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">{field.label}</label>
          </div>
        );

      case FieldType.Radio:
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => {
              const value = typeof option === 'string' ? option : option.value;
              const label = typeof option === 'string' ? option : option.label;
              return (
                <div key={index} className="flex items-center">
                  <input
                    {...register(field.name)}
                    type="radio"
                    value={value}
                    disabled={isDisabled}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">{label}</label>
                </div>
              );
            })}
          </div>
        );

      case FieldType.File:
        return (
          <input
            {...register(field.name)}
            type="file"
            accept={field.accept}
            multiple={field.multiple}
            disabled={isDisabled}
            className={baseClasses}
          />
        );

      case FieldType.Date:
        return (
          <input
            {...register(field.name)}
            type="date"
            disabled={isDisabled}
            className={baseClasses}
          />
        );

      case FieldType.DateTime:
        return (
          <input
            {...register(field.name)}
            type="datetime-local"
            disabled={isDisabled}
            className={baseClasses}
          />
        );

      case FieldType.Currency:
        return (
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              {...register(field.name)}
              type="number"
              placeholder={field.placeholder || '0.00'}
              step="0.01"
              min={field.min || 0}
              max={field.max}
              disabled={isDisabled}
              className={`${baseClasses} pl-7`}
            />
          </div>
        );

      case FieldType.Percentage:
        return (
          <div className="relative">
            <input
              {...register(field.name)}
              type="number"
              placeholder={field.placeholder || '0'}
              step={field.step || 0.1}
              min={field.min || 0}
              max={field.max || 100}
              disabled={isDisabled}
              className={`${baseClasses} pr-8`}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm">%</span>
            </div>
          </div>
        );

      case FieldType.Hidden:
        return <input {...register(field.name)} type="hidden" />;

      default:
        return (
          <input
            {...register(field.name)}
            type={field.type}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            disabled={isDisabled}
            className={baseClasses}
          />
        );
    }
  };

  if (field.type === FieldType.Checkbox) {
    return (
      <div className={`space-y-1 ${field.className || ''}`}>
        {renderField()}
        {field.description && <p className="text-sm text-gray-600">{field.description}</p>}
        {error && <p className="text-sm text-red-600">{error.message as string}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${field.className || ''}`}>
      {field.type !== FieldType.Hidden && (
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      {renderField()}
      {field.description && <p className="text-sm text-gray-600">{field.description}</p>}
      {error && <p className="text-sm text-red-600">{error.message as string}</p>}
    </div>
  );
};

// Main form generator component
export const UniversalFormGenerator: React.FC<FormConfig> = ({
  title,
  description,
  fields,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  layout = 'single',
  onSubmit,
  onCancel,
  defaultValues = {},
  loading = false,
}) => {
  // Create schema from field configurations
  const createSchema = () => {
    const schemaObject: Record<string, z.ZodSchema> = {};

    fields.forEach(field => {
      let fieldSchema = field.validation || z.string();

      // Apply built-in validations based on field type
      if (field.type === FieldType.Email) {
        fieldSchema = z.string().email('Please enter a valid email address');
      } else if (field.type === FieldType.Phone) {
        fieldSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number');
      } else if (
        field.type === FieldType.Number ||
        field.type === FieldType.Currency ||
        field.type === FieldType.Percentage
      ) {
        fieldSchema = z.preprocess(stringToNumber, z.number());
      }

      // Apply required validation
      if (!field.required) {
        fieldSchema = fieldSchema.optional();
      }

      schemaObject[field.name] = fieldSchema;
    });

    return z.object(schemaObject);
  };

  const schema = createSchema();
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: field.defaultValue || '',
        }),
        {},
      ),
      ...defaultValues,
    },
  });

  const { handleSubmit, watch, reset } = form;
  const watchedValues = watch();

  const handleFormSubmit = async (data: FormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
        toast.success('Form submitted successfully!');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form. Please try again.');
    }
  };

  const handleReset = () => {
    reset();
    onCancel?.();
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'two-column':
        return 'grid grid-cols-1 md:grid-cols-2 gap-6';
      case 'three-column':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      default:
        return 'space-y-6';
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="rounded-t-lg bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p className="mt-2 text-blue-100">{description}</p>}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className={getLayoutClasses()}>
            {fields
              .filter(field => !field.hidden)
              .map(field => (
                <FormField
                  key={field.name}
                  field={field}
                  form={form}
                  watchedValues={watchedValues}
                />
              ))}
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end space-x-4 border-t border-gray-200 pt-6">
            {onCancel && (
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="rounded-md border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              )}
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Pre-configured form generators for common use cases
export const CustomerFormGenerator = (props: Partial<FormConfig>) => {
  const defaultFields: FormFieldConfig[] = [
    {
      name: 'name',
      label: 'Business Name',
      type: FieldType.Text,
      required: true,
      placeholder: 'Enter business name...',
      validation: z.string().min(2, 'Business name must be at least 2 characters'),
    },
    {
      name: 'type',
      label: 'Business Type',
      type: FieldType.Select,
      required: true,
      options: ['individual', 'business', 'partnership', 'corporation', 'llc'],
    },
    {
      name: 'industry',
      label: 'Industry',
      type: FieldType.Text,
      placeholder: 'e.g., Manufacturing, Technology...',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: FieldType.Email,
      required: true,
      placeholder: 'business@example.com',
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: FieldType.Phone,
      placeholder: '+1 (555) 123-4567',
    },
    {
      name: 'annualRevenue',
      label: 'Annual Revenue',
      type: FieldType.Currency,
      placeholder: '0.00',
      validation: z.preprocess(stringToNumber, z.number().min(0)),
    },
    {
      name: 'employeeCount',
      label: 'Employee Count',
      type: FieldType.Number,
      min: 1,
      validation: z.preprocess(stringToNumber, z.number().min(1)),
    },
    {
      name: 'website',
      label: 'Website',
      type: FieldType.Text,
      placeholder: 'https://example.com',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: FieldType.Textarea,
      placeholder: 'Additional information...',
      rows: 3,
    },
  ];

  return (
    <UniversalFormGenerator
      title="Customer Information"
      description="Enter business customer details and financial information"
      fields={defaultFields}
      layout="two-column"
      {...props}
    />
  );
};

export const ContactFormGenerator = (props: Partial<FormConfig>) => {
  const defaultFields: FormFieldConfig[] = [
    {
      name: 'firstName',
      label: 'First Name',
      type: FieldType.Text,
      required: true,
      validation: z.string().min(1, 'First name is required'),
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: FieldType.Text,
      required: true,
      validation: z.string().min(1, 'Last name is required'),
    },
    {
      name: 'email',
      label: 'Email Address',
      type: FieldType.Email,
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: FieldType.Phone,
    },
    {
      name: 'title',
      label: 'Job Title',
      type: FieldType.Text,
      placeholder: 'e.g., CFO, Operations Manager...',
    },
    {
      name: 'department',
      label: 'Department',
      type: FieldType.Text,
      placeholder: 'e.g., Finance, Operations...',
    },
    {
      name: 'relationship',
      label: 'Relationship Type',
      type: FieldType.Select,
      required: true,
      options: ['primary', 'secondary', 'guarantor', 'reference', 'partner'],
    },
    {
      name: 'role',
      label: 'Role',
      type: FieldType.Select,
      required: true,
      options: ['decision_maker', 'influencer', 'user', 'technical', 'financial'],
    },
    {
      name: 'isDecisionMaker',
      label: 'Is Decision Maker',
      type: FieldType.Checkbox,
    },
    {
      name: 'preferredContactMethod',
      label: 'Preferred Contact Method',
      type: FieldType.Select,
      options: ['email', 'phone', 'mobile', 'text'],
    },
  ];

  return (
    <UniversalFormGenerator
      title="Contact Information"
      description="Enter contact details and relationship information"
      fields={defaultFields}
      layout="two-column"
      {...props}
    />
  );
};

export default UniversalFormGenerator;
