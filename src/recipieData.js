const recipieData = [
  {
    id: 1,
    name: 'Foxglove Tea',
    ingredients: [
      { key: 'foxglovePlant', amount: 2 },
      { key: 'teabag', amount: 1 },
    ],
    order: ['foxglovePlant', 'teabag', 'foxglovePlant'],
    description: 'A soothing herbal tea made from foxglove leaves, known to aid irregular heart rhythms.',
    result: { key: 'foxgloveTea', name: 'Foxglove Tea', imageKey: 'foxgloveTea', amount: 1 },
  },
  {
    id: 2,
    name: 'After-Sun Cream',
    ingredients: [
      { key: 'aloePlant', amount: 2 },
      { key: 'baseCream', amount: 1 },
    ],
    order: ['aloePlant', 'baseCream', 'aloePlant'],
    description: 'A soothing cream made from aloe vera, perfect for after sun exposure.',
    result: { key: 'aloeAfterSunCream', name: 'After-Sun Cream', imageKey: 'aloeAfterSunCream', amount: 1 },
  },
  {
    id: 3,
    name: 'Jasmine Tea',
    ingredients: [
      { key: 'jasminePlant', amount: 2 },
      { key: 'teabag', amount: 1 },
    ],
    order: ['jasminePlant', 'teabag', 'jasminePlant'],
    description: 'A fragrant tea made from jasmine flowers, known for its calming properties.',
    result: { key: 'jasmineTea', name: 'Jasmine Tea', imageKey: 'jasmineTea', amount: 1 },
  },
    {
        id: 4,
        name: 'Lavender Oil',
        ingredients: [
        { key: 'lavenderPlant', amount: 3 },
        { key: 'oilBase', amount: 1 },
        ],
        order: ['lavenderPlant', 'lavenderPlant', 'oilBase', 'lavenderPlant'],
        description: 'A calming oil made from lavender flowers, perfect for relaxation and aromatherapy.',
        result: { key: 'lavenderOil', name: 'Lavender Oil', imageKey: 'lavenderOil', amount: 1 },
    },
    {
        id: 5,
        name: 'Marigold Salve',
        ingredients: [
        { key: 'marigoldPlant', amount: 2 },
        { key: 'baseCream', amount: 1 },
        ],
        order: ['marigoldPlant', 'baseCream', 'marigoldPlant'],
        description: 'A healing salve made from marigold flowers, known for its skin-soothing properties.',
        result: { key: 'marigoldSalve', name: 'Marigold Salve', imageKey: 'marigoldSalve', amount: 1 },
    },
    {
        id: 6,
        name: 'Garlic Paste',
        ingredients: [
        { key: 'garlicPlant', amount: 3 },
        { key: 'oilBase', amount: 1 },
        ],
        order: ['garlicPlant', 'oilBase', 'garlicPlant', 'garlicPlant'],
        description: 'A potent paste made from garlic, known for its antibacterial and antifungal properties.',
        result: { key: 'garlicPaste', name: 'Garlic Paste', imageKey: 'garlicPaste', amount: 1 },
    },
    {
        id: 7,
        name: 'Periwinkle Extract',
        ingredients: [
        { key: 'periwinklePlant', amount: 2 },
        { key: 'alcoholBase', amount: 1 },
        ],
        order: ['periwinklePlant', 'alcoholBase', 'periwinklePlant'],
        description: 'An extract made from periwinkle leaves, known for its medicinal properties for issues such as toothaches.',
        result: { key: 'periwinkleExtract', name: 'Periwinkle Extract', imageKey: 'periwinkleExtract', amount: 1 },
    },
    {
        id: 8,
        name: 'Thyme Infused Oil',
        ingredients: [
        { key: 'thymePlant', amount: 2 },
        { key: 'oilBase', amount: 1 },
        ],
        order: ['thymePlant', 'oilBase', 'thymePlant'],
        description: 'An infused oil made from thyme, known for its culinary and medicinal properties.',
        result: { key: 'thymeInfusedOil', name: 'Thyme Infused Oil', imageKey: 'thymeInfusedOil', amount: 1 },
    },
    {
        id: 9,
        name: 'Willow Bark Tea',
        ingredients: [
        { key: 'willowPlant', amount: 2 },
        { key: 'teabag', amount: 1 },
        ],
        order: ['willowPlant', 'teabag', 'willowPlant'],
    description: 'A herbal tea made from willow bark, known for its pain-relieving properties.',
        result: { key: 'willowBarkTea', name: 'Willow Bark Tea', imageKey: 'willowBarkTea', amount: 1 },
    },
  {
    id: 12,
    name: 'Calming Tea',
    ingredients: [
      { key: 'lavenderPlant', amount: 2 },
      { key: 'jasminePlant', amount: 1 },
      { key: 'teabag', amount: 1 },
    ],
    order: ['lavenderPlant', 'jasminePlant', 'teabag', 'lavenderPlant'],
    description: 'A calming tea made from lavender and jasmine, perfect for relaxation and stress relief.',
    result: { key: 'calmingTea', name: 'Calming Tea', imageKey: 'calmingTea', amount: 1 },
  },
  {
    id: 13,
    name: 'Pain Relief Ointment',
    ingredients: [
      { key: 'willowPlant', amount: 2 },
      { key: 'garlicPlant', amount: 1 },
      { key: 'baseCream', amount: 1 },
    ],
    order: ['willowPlant', 'garlicPlant', 'baseCream', 'willowPlant'],
    description: 'An ointment made from willow bark and garlic, known for its pain-relieving properties.',
    result: { key: 'painReliefOintment', name: 'Pain Relief Ointment', imageKey: 'painReliefOintment', amount: 1 },
  },
  {
    id: 14,
    name: 'Digestive Aid',
    ingredients: [
      { key: 'thymePlant', amount: 2 },
      { key: 'periwinklePlant', amount: 1 },
      { key: 'teabag', amount: 1 },
    ],
    order: ['thymePlant', 'periwinklePlant', 'teabag', 'thymePlant'],
    description: 'A herbal tea made from thyme and periwinkle, known to aid digestion and soothe stomach issues.',
    result: { key: 'digestiveAid', name: 'Digestive Aid', imageKey: 'digestiveAid', amount: 1 },
  }
];

export default recipieData