/** Єдине джерело правди про компанію. Використовується і в розмітці, і в JSON-LD. */
export const company = {
  legalName: 'ТОВ «ОТАЛ»',
  shortName: 'ОТАЛ',
  tagline: 'Монтаж, випробування і ремонт електрообладнання до 330 кВ',
  catalog: 'https://ser.od.ua/ua/',
  phones: [
    { label: '+380 68 714-05-82', href: 'tel:+380687140582' },
    { label: '+380 95 128-20-59', href: 'tel:+380951282059' },
  ],
  email: 'ser_energo@ukr.net',
  contactPerson: 'Ірина',
  address: {
    street: 'вул. Польова, 1',
    city: 'Теплодар',
    region: 'Одеська область',
    country: 'Україна',
    postalCode: '67669',
  },
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=%D0%A2%D0%B5%D0%BF%D0%BB%D0%BE%D0%B4%D0%B0%D1%80+%D0%9F%D0%BE%D0%BB%D1%8C%D0%BE%D0%B2%D0%B0+1',
  hours: { days: 'Понеділок — п’ятниця', time: '08:00 — 17:00', weekend: 'Субота, неділя — вихідні' },
  areaServed: 'Україна',
  maxVoltage: '330 кВ',
} as const;

export const nav = [
  { href: '#about', label: 'Про компанію' },
  { href: '#services', label: 'Послуги' },
  { href: '#laboratory', label: 'Лабораторія' },
  { href: '#contacts', label: 'Контакти' },
] as const;
