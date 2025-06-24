
import React, { useState } from 'react';
import { FormFieldConfig, FieldType } from '@/types/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, MoveUp, MoveDown } from 'lucide-react';

interface FormFieldEditorProps {
  fields: FormFieldConfig[];
  onFieldsChange: (fields: FormFieldConfig[]) => void;
}

export const FormFieldEditor: React.FC<FormFieldEditorProps> = ({ fields, onFieldsChange }) => {
  const [editingField, setEditingField] = useState<FormFieldConfig | null>(null);

  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: 'text', label: 'Texte' },
    { value: 'textarea', label: 'Zone de texte' },
    { value: 'number', label: 'Nombre' },
    { value: 'toggle', label: 'Interrupteur' },
    { value: 'select', label: 'Liste déroulante' },
    { value: 'file', label: 'Fichier' }
  ];

  const addField = () => {
    const newField: FormFieldConfig = {
      id: `field_${Date.now()}`,
      name: 'nouveau_champ',
      label: 'Nouveau champ',
      type: 'text',
      required: false,
      order: fields.length
    };
    setEditingField(newField);
  };

  const saveField = (field: FormFieldConfig) => {
    const existingIndex = fields.findIndex(f => f.id === field.id);
    if (existingIndex >= 0) {
      const updatedFields = [...fields];
      updatedFields[existingIndex] = field;
      onFieldsChange(updatedFields);
    } else {
      onFieldsChange([...fields, field]);
    }
    setEditingField(null);
  };

  const deleteField = (fieldId: string) => {
    onFieldsChange(fields.filter(f => f.id !== fieldId));
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const updatedFields = [...fields];
    [updatedFields[currentIndex], updatedFields[newIndex]] = [updatedFields[newIndex], updatedFields[currentIndex]];
    
    // Mettre à jour les ordres
    updatedFields.forEach((field, index) => {
      field.order = index;
    });

    onFieldsChange(updatedFields);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Configuration des champs</h3>
        <Button onClick={addField} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un champ
        </Button>
      </div>

      <div className="space-y-2">
        {fields.map((field) => (
          <Card key={field.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className="font-medium">{field.label}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  ({fieldTypes.find(t => t.value === field.type)?.label})
                </span>
                {field.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveField(field.id, 'up')}
                  disabled={field.order === 0}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveField(field.id, 'down')}
                  disabled={field.order === fields.length - 1}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingField(field)}
                >
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteField(field.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editingField && (
        <FieldEditor
          field={editingField}
          onSave={saveField}
          onCancel={() => setEditingField(null)}
        />
      )}
    </div>
  );
};

interface FieldEditorProps {
  field: FormFieldConfig;
  onSave: (field: FormFieldConfig) => void;
  onCancel: () => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onSave, onCancel }) => {
  const [editedField, setEditedField] = useState<FormFieldConfig>({ ...field });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedField);
  };

  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: 'text', label: 'Texte' },
    { value: 'textarea', label: 'Zone de texte' },
    { value: 'number', label: 'Nombre' },
    { value: 'toggle', label: 'Interrupteur' },
    { value: 'select', label: 'Liste déroulante' },
    { value: 'file', label: 'Fichier' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {field.id.startsWith('field_') ? 'Nouveau champ' : 'Modifier le champ'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="label">Intitulé du champ</Label>
            <Input
              id="label"
              value={editedField.label}
              onChange={(e) => setEditedField(prev => ({ ...prev, label: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="name">Nom technique (pour les données)</Label>
            <Input
              id="name"
              value={editedField.name}
              onChange={(e) => setEditedField(prev => ({ ...prev, name: e.target.value }))}
              pattern="[a-zA-Z_][a-zA-Z0-9_]*"
              title="Seuls les lettres, chiffres et underscores sont autorisés"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Type de champ</Label>
            <Select
              value={editedField.type}
              onValueChange={(value: FieldType) => setEditedField(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={editedField.required}
              onCheckedChange={(checked) => setEditedField(prev => ({ ...prev, required: checked }))}
            />
            <Label htmlFor="required">Champ obligatoire</Label>
          </div>

          <div>
            <Label htmlFor="placeholder">Placeholder (optionnel)</Label>
            <Input
              id="placeholder"
              value={editedField.placeholder || ''}
              onChange={(e) => setEditedField(prev => ({ ...prev, placeholder: e.target.value }))}
            />
          </div>

          {editedField.type === 'select' && (
            <div>
              <Label htmlFor="options">Options (une par ligne)</Label>
              <Textarea
                id="options"
                value={editedField.options?.join('\n') || ''}
                onChange={(e) => setEditedField(prev => ({ 
                  ...prev, 
                  options: e.target.value.split('\n').filter(option => option.trim())
                }))}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                rows={4}
              />
            </div>
          )}

          {editedField.type === 'text' && (
            <div>
              <Label htmlFor="maxLength">Longueur maximale</Label>
              <Input
                id="maxLength"
                type="number"
                value={editedField.maxLength || ''}
                onChange={(e) => setEditedField(prev => ({ 
                  ...prev, 
                  maxLength: e.target.value ? parseInt(e.target.value) : undefined
                }))}
              />
            </div>
          )}

          {editedField.type === 'number' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min">Valeur minimale</Label>
                <Input
                  id="min"
                  type="number"
                  value={editedField.min || ''}
                  onChange={(e) => setEditedField(prev => ({ 
                    ...prev, 
                    min: e.target.value ? parseFloat(e.target.value) : undefined
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="max">Valeur maximale</Label>
                <Input
                  id="max"
                  type="number"
                  value={editedField.max || ''}
                  onChange={(e) => setEditedField(prev => ({ 
                    ...prev, 
                    max: e.target.value ? parseFloat(e.target.value) : undefined
                  }))}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
