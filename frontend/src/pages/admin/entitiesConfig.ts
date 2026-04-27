export type FieldType =
  | 'text' | 'textarea' | 'email' | 'number' | 'date' | 'datetime' | 'password'
  | 'select' | 'image' | 'document' | 'documents' | 'url';

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  lookup?: string; // entity key for select
  showInList?: boolean;
}

export interface EntityCfg {
  label: string;
  description?: string;
  fields: Field[];
  // Whether create is allowed in admin (e.g. PrijaveniProblemi only deletable)
  canCreate?: boolean;
}

export const ADMIN_ENTITIES: Record<string, EntityCfg> = {
  'odnosi-so-javnost': {
    label: 'Односи со јавност',
    description: 'Новости, соопштенија, огласи, конкурси',
    canCreate: true,
    fields: [
      { key: 'typeId', label: 'Тип објава', type: 'select', lookup: 'type-objava', required: true, showInList: true },
      { key: 'title', label: 'Наслов', type: 'text', required: true, showInList: true },
      { key: 'picture', label: 'Слика', type: 'image' },
      { key: 'description', label: 'Опис', type: 'textarea' },
      { key: 'documents', label: 'Документи', type: 'documents' },
      { key: 'dateValidTo', label: 'Важи до', type: 'date', showInList: true },
      { key: 'madeBy', label: 'Изготвил', type: 'text' },
    ],
  },
  'sluzben-glasnik': {
    label: 'Службен гласник',
    canCreate: true,
    fields: [
      { key: 'broj', label: 'Број', type: 'text', required: true, showInList: true },
      { key: 'date', label: 'Датум', type: 'date', showInList: true },
      { key: 'document', label: 'Документ', type: 'document' },
    ],
  },
  'vraboteni': {
    label: 'Вработени',
    canCreate: true,
    fields: [
      { key: 'firstName', label: 'Име', type: 'text', required: true, showInList: true },
      { key: 'lastName', label: 'Презиме', type: 'text', required: true, showInList: true },
      { key: 'email', label: 'Е-маил', type: 'email' },
      { key: 'oddel', label: 'Оддел', type: 'text', showInList: true },
      { key: 'function', label: 'Функција', type: 'text', showInList: true },
    ],
  },
  'prijaveni-problemi': {
    label: 'Пријавени проблеми',
    description: 'Само преглед и бришење',
    canCreate: false,
    fields: [
      { key: 'fullName', label: 'Име', type: 'text', showInList: true },
      { key: 'typeOfProblemId', label: 'Тип', type: 'select', lookup: 'type-of-problems', showInList: true },
      { key: 'naselenoMestoId', label: 'Место', type: 'select', lookup: 'naseleni-mesta', showInList: true },
      { key: 'description', label: 'Опис', type: 'textarea' },
      { key: 'picture', label: 'Слика', type: 'image' },
      { key: 'phoneNumber', label: 'Телефон', type: 'text' },
      { key: 'email', label: 'Е-маил', type: 'email' },
      { key: 'date', label: 'Датум', type: 'datetime', showInList: true },
    ],
  },
  'budzet': {
    label: 'Буџет',
    canCreate: true,
    fields: [
      { key: 'forYear', label: 'Година', type: 'number', required: true, showInList: true },
      { key: 'date', label: 'Датум на објава', type: 'date', showInList: true },
      { key: 'documents', label: 'Документи', type: 'documents' },
    ],
  },
  'legislativa': {
    label: 'Легислатива',
    canCreate: true,
    fields: [
      { key: 'typeId', label: 'Тип', type: 'select', lookup: 'type-legislativa', required: true, showInList: true },
      { key: 'title', label: 'Наслов', type: 'text', showInList: true },
      { key: 'document', label: 'Документ', type: 'document' },
    ],
  },
  'proekti': {
    label: 'Проекти',
    canCreate: true,
    fields: [
      { key: 'title', label: 'Наслов', type: 'text', required: true, showInList: true },
      { key: 'description', label: 'Опис', type: 'textarea' },
      { key: 'picture', label: 'Слика', type: 'image' },
      { key: 'documents', label: 'Документи', type: 'documents' },
    ],
  },
  'agenda': {
    label: 'Агенда',
    canCreate: true,
    fields: [
      { key: 'dateTime', label: 'Датум и час', type: 'datetime', required: true, showInList: true },
      { key: 'title', label: 'Наслов', type: 'text', required: true, showInList: true },
      { key: 'description', label: 'Опис', type: 'textarea' },
    ],
  },
  'institucii': {
    label: 'Институции',
    canCreate: true,
    fields: [
      { key: 'nameOfInstitution', label: 'Назив', type: 'text', required: true, showInList: true },
      { key: 'mestoNaseleno', label: 'Место', type: 'text', showInList: true },
      { key: 'directorFullName', label: 'Директор', type: 'text', showInList: true },
      { key: 'directorPicture', label: 'Слика на директор', type: 'image' },
      { key: 'directorBiography', label: 'Биографија', type: 'textarea' },
      { key: 'email', label: 'Е-маил', type: 'email' },
      { key: 'website', label: 'Веб', type: 'url' },
      { key: 'facebook', label: 'Facebook', type: 'url' },
      { key: 'instagram', label: 'Instagram', type: 'url' },
    ],
  },
  'type-objava': {
    label: 'Типови објави',
    canCreate: true,
    fields: [{ key: 'title', label: 'Назив', type: 'text', required: true, showInList: true }],
  },
  'type-legislativa': {
    label: 'Типови легислатива',
    canCreate: true,
    fields: [{ key: 'title', label: 'Назив', type: 'text', required: true, showInList: true }],
  },
  'type-of-problems': {
    label: 'Типови проблеми',
    canCreate: true,
    fields: [{ key: 'title', label: 'Назив', type: 'text', required: true, showInList: true }],
  },
  'naseleni-mesta': {
    label: 'Населени места',
    canCreate: true,
    fields: [{ key: 'title', label: 'Назив', type: 'text', required: true, showInList: true }],
  },
  'kultura': {
    label: 'Култура',
    canCreate: true,
    fields: [
      { key: 'title', label: 'Наслов', type: 'text', required: true, showInList: true },
      { key: 'picture', label: 'Слика', type: 'image' },
      { key: 'description', label: 'Опис', type: 'textarea' },
      { key: 'date', label: 'Датум', type: 'date', showInList: true },
      { key: 'images', label: 'Галерија слики', type: 'documents' },
    ],
  },
  'sport': {
    label: 'Спорт',
    canCreate: true,
    fields: [
      { key: 'title', label: 'Наслов', type: 'text', required: true, showInList: true },
      { key: 'picture', label: 'Слика', type: 'image' },
      { key: 'description', label: 'Опис', type: 'textarea' },
      { key: 'date', label: 'Датум', type: 'date', showInList: true },
      { key: 'images', label: 'Галерија слики', type: 'documents' },
    ],
  },
  'admin-users': {
    label: 'Админ корисници',
    canCreate: true,
    fields: [
      { key: 'email', label: 'Е-маил', type: 'email', required: true, showInList: true },
      { key: 'name', label: 'Име', type: 'text', required: true, showInList: true },
      { key: 'role', label: 'Улога', type: 'text', showInList: true },
      { key: 'password', label: 'Лозинка (за нов/смена)', type: 'password' },
    ],
  },
};
