import type { ImageMetadata } from 'astro';

import laboratoriya from '../assets/catalog/viprobuvannya-kabelnoyi-liniyi.jpg';

const BASE = 'https://ser.od.ua/ua';

export type ServiceItem = {
  title: string;
  href: string;
};

export type Service = {
  id: string;
  title: string;
  /** Що це дає замовнику — одним реченням, без маркетингу. */
  summary: string;
  categoryHref: string;
  items: ServiceItem[];
};

export const services: Service[] = [
  {
    id: 'installation',
    title: 'Монтаж і налагодження',
    summary: 'Ставимо обладнання на об’єкті та доводимо його до робочого стану — від трансформатора до кабельної траси.',
    categoryHref: `${BASE}/g20164581-montazh-naladka-ekspluatatsiya`,
    items: [
      { title: 'Монтаж силових трансформаторів усіх типів', href: `${BASE}/p515436434-montazh-silovyh-transformatorov.html` },
      { title: 'Монтаж електрообладнання', href: `${BASE}/p515455011-montazh-elektrooborudovaniya.html` },
      { title: 'Монтаж кабельних ліній 0,4 — 35 кВ', href: `${BASE}/p515675478-montazh-kabelnyh-linij.html` },
      { title: 'Монтаж повітряних ліній 0,22 — 330 кВ', href: `${BASE}/p524222357-montazh-vozdushnyh-kabelnyh.html` },
      { title: 'Профілактичні випробування електрообладнання', href: `${BASE}/p515633515-profilakticheskie-ispytaniya-elektrooborudovaniya.html` },
    ],
  },
  {
    id: 'repair',
    title: 'Ремонт і обслуговування',
    summary: 'Повертаємо в роботу те, що вже стоїть: трансформатори, вимикачі, кабельні лінії, розподільні пристрої.',
    categoryHref: `${BASE}/g20166671-remont-elektrooborudovaniya-ego`,
    items: [
      { title: 'Ремонт силових трансформаторів', href: `${BASE}/p515489657-remont-silovyh-transformatorov.html` },
      { title: 'Ремонт обмоток силового трансформатора', href: `${BASE}/p745549753-remont-obmotok-silovogo.html` },
      { title: 'Ревізія і ремонт вимикачів 0,4 — 35 кВ', href: `${BASE}/p523987681-reviziya-remont-vyklyuchatelej.html` },
      { title: 'Ремонт кабельних ліній', href: `${BASE}/p524600836-remont-kabelnyh-linij.html` },
      { title: 'Ремонт і модернізація розподільних пристроїв 0,4 — 330 кВ', href: `${BASE}/p515515501-remont-modernizatsiya-raspredelitelnyh.html` },
    ],
  },
  {
    id: 'laboratory-service',
    title: 'Електротехнічна лабораторія',
    summary: 'Вимірюємо й випробовуємо обладнання та захисні засоби, видаємо протоколи для енергонагляду.',
    categoryHref: `${BASE}/g25454440-elektrotehnicheskaya-laboratoriya`,
    items: [
      { title: 'Послуги електротехнічної лабораторії', href: `${BASE}/p614516500-uslugi-elektrotehnicheskoj-laboratorii.html` },
      { title: 'Випробування кабельної лінії підвищеною напругою', href: `${BASE}/p2333486525-ispytanie-kabelnoj-linii.html` },
      { title: 'Випробування засобів індивідуального захисту', href: `${BASE}/p2336747882-ispytaniya-siz.html` },
    ],
  },
  {
    id: 'design',
    title: 'Проєктування і кошториси',
    summary: 'Готуємо проєктну документацію та кошториси в АВК-5 — до початку робіт на об’єкті.',
    categoryHref: `${BASE}/g20175502-proektno-izyskatelnye-raboty`,
    items: [
      { title: 'Проєктно-вишукувальні роботи', href: `${BASE}/p515584101-proektno-izyskatelnye-raboty.html` },
      { title: 'Складання проєктно-кошторисної документації', href: `${BASE}/p515607440-sostavlenie-proektno-smetnoj.html` },
    ],
  },
  {
    id: 'machinery-service',
    title: 'Машини і механізми',
    summary: 'Даємо техніку з оператором, коли для робіт потрібен підйом на висоту або земляні роботи.',
    categoryHref: `${BASE}/g30216255-uslugi-mashin-mehanizmov`,
    items: [
      { title: 'Автовишка, висота підйому 65 м', href: `${BASE}/p1904404532-uslugi-avtovyshki-vysota.html` },
      { title: 'Міні-екскаватор Hanix SB20', href: `${BASE}/p679845582-uslugi-mini-ekskavator.html` },
      { title: 'Кран-маніпулятор Hiab 100 AW', href: `${BASE}/product_list` },
    ],
  },
  {
    id: 'welding',
    title: 'Зварювальні роботи',
    summary: 'Зварюємо металоконструкції та закладні деталі під електромонтаж на вашому об’єкті.',
    categoryHref: `${BASE}/g52763052-svarochnye-raboty`,
    items: [{ title: 'Зварювальні роботи', href: `${BASE}/p900599924-svarochnye-raboty.html` }],
  },
];

/** Фото для блоку лабораторії. */
export const photos = { laboratoriya } as const;
