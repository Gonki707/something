export interface LookupRow { id: number; title: string }

export interface ObjavaRow {
  id: number;
  typeId: number | null;
  title: string;
  picture: string | null;
  description: string | null;
  documents: string[] | null;
  dateValidTo: string | null;
  madeBy: string | null;
  createdAt: string;
}

export interface GlasnikRow {
  id: number;
  broj: string;
  date: string | null;
  document: string | null;
}

export interface VrabotenRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  oddel: string | null;
  function: string | null;
}

export interface BudzetRow {
  id: number;
  forYear: number;
  date: string | null;
  documents: string[] | null;
}

export interface LegislativaRow {
  id: number;
  typeId: number | null;
  title: string | null;
  document: string | null;
}

export interface ProektRow {
  id: number;
  title: string;
  description: string | null;
  picture: string | null;
  documents: string[] | null;
}

export interface InstitucijaRow {
  id: number;
  nameOfInstitution: string;
  mestoNaseleno: string | null;
  directorFullName: string | null;
  directorPicture: string | null;
  directorBiography: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
}

export interface AgendaRow {
  id: number;
  dateTime: string;
  title: string;
  description: string | null;
}
