
import React from 'react';
import { FormFieldConfig } from '@/types/FormField';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileImport } from '@/components/FileImport';

interface DynamicFormFieldProps {
  field: FormFieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  onChange,
  error
}) => {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            required={field.required}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            required={field.required}
            className={error ? 'border-red-500' : ''}
            rows={4}
          />
        );

      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            required={field.required}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'toggle':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.id}
              checked={Boolean(value)}
              onCheckedChange={onChange}
            />
            <Label htmlFor={field.id} className="cursor-pointer">
              {field.label}
            </Label>
          </div>
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <Input
              id={field.id}
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder || "URL du fichier ou importer"}
              required={field.required}
              className={error ? 'border-red-500' : ''}
            />
            <FileImport 
              type="image" 
              onFileImport={(dataUrl) => onChange(dataUrl)} 
            />
            {value && field.name.includes('cover') && (
              <img src={value} alt="Aperçu" className="mt-2 h-20 w-20 object-cover rounded-md" />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {field.type !== 'toggle' && (
        <Label htmlFor={field.id}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {renderField()}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
