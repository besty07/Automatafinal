// full schema for a row extracted from the NCDX bhav copy CSVs
export interface HistoricalRecord {
  instrumentType: string;
  symbol: string;
  expiryDate: string; // M/D/YYYY
  underlyingCommodity: string;
  strikePrice: number;
  optionType: string;
  exBasisDeliveryCentre: string;
  priceUnit: string;
  openingPrice: number;
  highPrice: number;
  lowPrice: number;
  closingPrice: number;
  quantityTradedToday: number;
  measure: string;
  noOfTrades: number;
  tradedValueInLacs: number;
  openInterest: number;
  lastTradedDate: string; // M/D/YYYY
  // convenience field derived from lastTradedDate for sorting/lookup
  date: string; // YYYY-MM-DD
}

export const OILSEED_CROPS = [
  { key: 'soybeans', label: 'Soybeans' },
  { key: 'sunflower', label: 'Sunflower' },
  { key: 'castor', label: 'Castor' },
  { key: 'sesame', label: 'Sesame' },
];

// mock data pulled from the CSV rows shown earlier – in practice you would
// write a script to convert every CSV into this structure.  We include a
// handful of rows per crop to demonstrate the full object shape.
export const HISTORICAL_DATA: Record<string, HistoricalRecord[]> = {
  soybeans: [
    {
      instrumentType: 'FUTCOM',
      symbol: 'SOYBEAN',
      expiryDate: '2/20/2026',
      underlyingCommodity: 'SOYBEAN',
      strikePrice: 0,
      optionType: 'XX',
      exBasisDeliveryCentre: 'MUMBAI',
      priceUnit: 'RS/QUINTAL',
      openingPrice: 4250,
      highPrice: 4300,
      lowPrice: 4200,
      closingPrice: 4250,
      quantityTradedToday: 2000,
      measure: 'MT',
      noOfTrades: 150,
      tradedValueInLacs: 850,
      openInterest: 5000,
      lastTradedDate: '2/10/2026',
      date: '2026-02-10',
    },
    {
      instrumentType: 'FUTCOM',
      symbol: 'SOYBEAN',
      expiryDate: '2/20/2026',
      underlyingCommodity: 'SOYBEAN',
      strikePrice: 0,
      optionType: 'XX',
      exBasisDeliveryCentre: 'MUMBAI',
      priceUnit: 'RS/QUINTAL',
      openingPrice: 4300,
      highPrice: 4350,
      lowPrice: 4250,
      closingPrice: 4300,
      quantityTradedToday: 1800,
      measure: 'MT',
      noOfTrades: 140,
      tradedValueInLacs: 870,
      openInterest: 5100,
      lastTradedDate: '2/11/2026',
      date: '2026-02-11',
    },
  ],

  sunflower: [
    {
      instrumentType: 'FUTCOM',
      symbol: 'SUNFLOWER',
      expiryDate: '2/20/2026',
      underlyingCommodity: 'SUNFLOWER',
      strikePrice: 0,
      optionType: 'XX',
      exBasisDeliveryCentre: 'KOLKATA',
      priceUnit: 'RS/QUINTAL',
      openingPrice: 6800,
      highPrice: 6900,
      lowPrice: 6750,
      closingPrice: 6800,
      quantityTradedToday: 1200,
      measure: 'MT',
      noOfTrades: 90,
      tradedValueInLacs: 800,
      openInterest: 3000,
      lastTradedDate: '2/10/2026',
      date: '2026-02-10',
    },
  ],

  castor: [
    {
      instrumentType: 'FUTCOM',
      symbol: 'CASTOR',
      expiryDate: '2/20/2026',
      underlyingCommodity: 'CASTORSEEDNEW',
      strikePrice: 0,
      optionType: 'XX',
      exBasisDeliveryCentre: 'DEESA',
      priceUnit: 'RS/QUINTAL',
      openingPrice: 6439,
      highPrice: 6500,
      lowPrice: 6439,
      closingPrice: 6450,
      quantityTradedToday: 4790,
      measure: 'MT',
      noOfTrades: 350,
      tradedValueInLacs: 3095.62,
      openInterest: 14365,
      lastTradedDate: '2/10/2026',
      date: '2026-02-10',
    },
    {
      instrumentType: 'FUTCOM',
      symbol: 'CASTOR',
      expiryDate: '3/20/2026',
      underlyingCommodity: 'CASTORSEEDNEW',
      strikePrice: 0,
      optionType: 'XX',
      exBasisDeliveryCentre: 'DEESA',
      priceUnit: 'RS/QUINTAL',
      openingPrice: 6508,
      highPrice: 6554,
      lowPrice: 6500,
      closingPrice: 6509,
      quantityTradedToday: 5395,
      measure: 'MT',
      noOfTrades: 470,
      tradedValueInLacs: 3519.12,
      openInterest: 15970,
      lastTradedDate: '2/10/2026',
      date: '2026-02-10',
    },
  ],

  sesame: [
    {
      instrumentType: 'FUTCOM',
      symbol: 'SESAME',
      expiryDate: '2/20/2026',
      underlyingCommodity: 'SESAMENUM',
      strikePrice: 0,
      optionType: 'XX',
      exBasisDeliveryCentre: 'JAIPUR',
      priceUnit: 'RS/QUINTAL',
      openingPrice: 0,
      highPrice: 0,
      lowPrice: 0,
      closingPrice: 0,
      quantityTradedToday: 0,
      measure: 'MT',
      noOfTrades: 0,
      tradedValueInLacs: 0,
      openInterest: 0,
      lastTradedDate: '2/10/2026',
      date: '2026-02-10',
    },
  ],
};
