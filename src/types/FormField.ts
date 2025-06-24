
export type FieldType = 'text' | 'textarea' | 'number' | 'toggle' | 'select' | 'file';

export interface FormFieldConfig {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[]; // pour les select
  defaultValue?: any;
  order: number;
}

export interface FormConfig {
  id: string;
  name: string;
  fields: FormFieldConfig[];
}
