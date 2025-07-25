const recipieData = [
  {
    id: 1,
    name: 'Foxglove Tea',
    ingredients: [
      { key: 'foxglovePlant', amount: 2 },
      { key: 'teabag', amount: 1 },
    ],
    result: { key: 'foxgloveTea', amount: 1 },
  },
  {
    id: 2,
    name: 'Aloe Vera After-Sun Cream',
    ingredients: [
      { key: 'aloeVeraPlant', amount: 2 },
      { key: 'baseCream', amount: 1 },
    ],
    result: { key: 'aloeVeraAfterSunCream', amount: 1 },
  },
  {
    id: 3,
    name: 'Jasmine Tea',
    ingredients: [
      { key: 'jasminePlant', amount: 2 },
      { key: 'teabag', amount: 1 },
    ],
    result: { key: 'jasmineTea', amount: 1 },
  },
    {
        id: 4,
        name: 'Lavender Oil',
        ingredients: [
        { key: 'lavenderPlant', amount: 3 },
        { key: 'oilBase', amount: 1 },
        ],
        result: { key: 'lavenderOil', amount: 1 },
    },
    {
        id: 5,
        name: 'Marigold Salve',
        ingredients: [
        { key: 'marigoldPlant', amount: 2 },
        { key: 'baseCream', amount: 1 },
        ],
        result: { key: 'marigoldSalve', amount: 1 },
    },
    {
        id: 6,
        name: 'Garlic Paste',
        ingredients: [
        { key: 'garlicPlant', amount: 3 },
        { key: 'oilBase', amount: 1 },
        ],
        result: { key: 'garlicPaste', amount: 1 },
    },
    {
        id: 7,
        name: 'Periwinkle Extract',
        ingredients: [
        { key: 'periwinklePlant', amount: 2 },
        { key: 'alcoholBase', amount: 1 },
        ],
        result: { key: 'periwinkleExtract', amount: 1 },
    },
    {
        id: 8,
        name: 'Thyme Infused Oil',
        ingredients: [
        { key: 'thymePlant', amount: 2 },
        { key: 'oilBase', amount: 1 },
        ],
        result: { key: 'thymeInfusedOil', amount: 1 },
    },
    {
        id: 9,
        name: 'Willow Bark Tea',
        ingredients: [
        { key: 'willowPlant', amount: 2 },
        { key: 'teabag', amount: 1 },
        ],
        result: { key: 'willowBarkTea', amount: 1 },
    },
  {
    id: 10,
    name: 'Herbal Tincture',
    ingredients: [
      { key: 'foxglovePlant', amount: 1 },
      { key: 'aloeVeraPlant', amount: 1 },
      { key: 'jasminePlant', amount: 1 },
      { key: 'lavenderPlant', amount: 1 },
      { key: 'marigoldPlant', amount: 1 },
      { key: 'garlicPlant', amount: 1 },
      { key: 'periwinklePlant', amount: 1 },
      { key: 'thymePlant', amount: 1 },
      { key: 'willowPlant', amount: 1 },
    ],
    result: { key: 'herbalTincture', amount: 1 },
  },
  {
    id: 11,
    name: 'Healing Balm',
    ingredients: [
      { key: 'marigoldPlant', amount: 2 },
      { key: 'lavenderPlant', amount: 1 },
      { key: 'aloeVeraPlant', amount: 1 },
      { key: 'baseCream', amount: 1 },
    ],
    result: { key: 'healingBalm', amount: 1 },
  },
  {
    id: 12,
    name: 'Calming Tea',
    ingredients: [
      { key: 'lavenderPlant', amount: 2 },
      { key: 'jasminePlant', amount: 1 },
      { key: 'teabag', amount: 1 },
    ],
    result: { key: 'calmingTea', amount: 1 },
  },
  {
    id: 13,
    name: 'Pain Relief Ointment',
    ingredients: [
      { key: 'willowPlant', amount: 2 },
      { key: 'garlicPlant', amount: 1 },
      { key: 'baseCream', amount: 1 },
    ],
    result: { key: 'painReliefOintment', amount: 1 },
  },
  {
    id: 14,
    name: 'Digestive Aid',
    ingredients: [
      { key: 'thymePlant', amount: 2 },
      { key: 'periwinklePlant', amount: 1 },
      { key: 'teabag', amount: 1 },
    ],
    result: { key: 'digestiveAid', amount: 1 },     
    }
];

export default recipieData