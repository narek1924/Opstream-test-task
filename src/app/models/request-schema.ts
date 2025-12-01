export type FieldType = 'text' | 'number' | 'radio' | 'toggle' | 'textarea' | 'dropdown';

export interface SchemaField {
  id: number;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  default?: string | number | boolean;
}

export interface SchemaSection {
  id: string;
  title: string;
  fields: SchemaField[];
}

export interface RequestSchema {
  id: string;
  title: string;
  icon: string;
  sections: SchemaSection[];
}

export const REQUEST_SCHEMAS: RequestSchema[] = [
  {
    id: 'software-request',
    title: 'Software',
    icon: 'apps',
    sections: [
      {
        id: 'request-details',
        title: 'Request Details',
        fields: [
          { id: 1758177604, label: 'Title', type: 'text', required: true },
          { id: 75484637462, label: 'Description', type: 'textarea', required: false },
          {
            id: 137913791379,
            label: 'Requires Approval',
            type: 'toggle',
            required: false,
            default: false,
          },
          {
            id: 8462736152,
            label: 'Priority',
            type: 'radio',
            required: true,
            options: ['High', 'Medium', 'Low'],
          },
        ],
      },
      {
        id: 'additional-info',
        title: 'Additional Info',
        fields: [
          { id: 4957463729, label: 'Quantity', type: 'number', required: true },
          {
            id: 6482937561,
            label: 'Category',
            type: 'dropdown',
            required: true,
            options: ['Hardware', 'Software', 'Services'],
          },
        ],
      },
    ],
  },
  {
    id: 'hardware-request',
    title: 'Hardware',
    icon: 'servers',
    sections: [
      {
        id: 'request-details',
        title: 'Request Details',
        fields: [
          { id: 75329829348985, label: 'Title', type: 'text', required: true },
          { id: 85781623672346, label: 'Description', type: 'textarea', required: false },
          {
            id: 246824682468,
            label: 'Requires Approval',
            type: 'toggle',
            required: false,
            default: false,
          },
          {
            id: 2389182391823812,
            label: 'Priority',
            type: 'radio',
            required: true,
            options: ['High', 'Medium', 'Low'],
          },
        ],
      },
      {
        id: 'additional-info',
        title: 'Additional Info',
        fields: [
          { id: 9542834823423, label: 'Quantity', type: 'number', required: true },
          {
            id: 5587934758234,
            label: 'Category',
            type: 'dropdown',
            required: true,
            options: ['Laptop', 'Desktop', 'Accessory'],
          },
        ],
      },
    ],
  },
];

export function getSchemaById(schemaId: string): RequestSchema | undefined {
  return REQUEST_SCHEMAS.find((schema) => schema.id === schemaId);
}
