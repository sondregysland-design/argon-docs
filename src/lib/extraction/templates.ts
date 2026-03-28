export interface TemplateField {
  name: string;
  description: string;
  type: "text" | "number" | "date" | "currency";
}

export interface BuiltInTemplate {
  id: string;
  name: string;
  description: string;
  fields: TemplateField[];
}

export const builtInTemplates: BuiltInTemplate[] = [
  {
    id: "faktura",
    name: "Faktura",
    description:
      "Ekstraher data fra fakturaer — leverandør, beløp, datoer og referanser.",
    fields: [
      {
        name: "fakturanummer",
        description: "Fakturanummer eller referanse",
        type: "text",
      },
      { name: "dato", description: "Fakturadato", type: "date" },
      { name: "forfallsdato", description: "Forfallsdato", type: "date" },
      {
        name: "leverandor",
        description: "Leverandørens navn",
        type: "text",
      },
      {
        name: "org_nummer",
        description: "Leverandørens organisasjonsnummer",
        type: "text",
      },
      { name: "belop", description: "Totalbeløp inkl. MVA", type: "currency" },
      { name: "mva", description: "MVA-beløp", type: "currency" },
      {
        name: "belop_eks_mva",
        description: "Beløp ekskl. MVA",
        type: "currency",
      },
      {
        name: "kontonummer",
        description: "Bankkontonummer for betaling",
        type: "text",
      },
      { name: "kid", description: "KID-nummer", type: "text" },
    ],
  },
  {
    id: "sja",
    name: "SJA-skjema",
    description:
      "Ekstraher data fra Sikker Jobb Analyse-skjemaer — risikoer, tiltak og ansvarlige.",
    fields: [
      {
        name: "prosjekt",
        description: "Prosjektnavn eller -nummer",
        type: "text",
      },
      {
        name: "lokasjon",
        description: "Arbeidslokasjon",
        type: "text",
      },
      { name: "dato", description: "Dato for SJA", type: "date" },
      {
        name: "arbeidsbeskrivelse",
        description: "Beskrivelse av arbeidet som skal utføres",
        type: "text",
      },
      {
        name: "deltakere",
        description: "Navn på deltakere i SJA-møtet",
        type: "text",
      },
      {
        name: "risikoer",
        description: "Identifiserte risikoer og farer",
        type: "text",
      },
      {
        name: "tiltak",
        description: "Risikoreduserende tiltak",
        type: "text",
      },
      {
        name: "ansvarlig",
        description: "Ansvarlig person for gjennomføring",
        type: "text",
      },
      {
        name: "godkjent_av",
        description: "Hvem som har godkjent SJA-en",
        type: "text",
      },
    ],
  },
  {
    id: "sertifikat",
    name: "Sertifikat",
    description:
      "Ekstraher data fra sertifikater — type, holder, utløpsdato og utsteder.",
    fields: [
      {
        name: "sertifikattype",
        description: "Type sertifikat (f.eks. kranfører, varmt arbeid)",
        type: "text",
      },
      {
        name: "sertifikatnummer",
        description: "Unikt sertifikatnummer",
        type: "text",
      },
      {
        name: "holder",
        description: "Navnet på sertifikatholderen",
        type: "text",
      },
      {
        name: "fodselsdato",
        description: "Fødselsdato til holder",
        type: "date",
      },
      {
        name: "utstedt_dato",
        description: "Dato sertifikatet ble utstedt",
        type: "date",
      },
      {
        name: "utlopsdato",
        description: "Utløpsdato for sertifikatet",
        type: "date",
      },
      {
        name: "utsteder",
        description: "Organisasjon som utstedte sertifikatet",
        type: "text",
      },
      {
        name: "begrensninger",
        description: "Eventuelle begrensninger eller vilkår",
        type: "text",
      },
    ],
  },
];
