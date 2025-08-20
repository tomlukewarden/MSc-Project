const recipieData = [
  {
    id: 1,
    name: 'Foxglove Tea',
    ingredients: [
      { key: 'foxglovePlant', amount: 2 },
      { key: 'teaBag', amount: 1 },
    ],
    order: ['foxglovePlant', 'teaBag', 'foxglovePlant'],
    description: 'A soothing herbal tea made from foxglove leaves, known to aid irregular heart rhythms.',
    result: { key: 'foxgloveTea', name: 'Foxglove Tea', imageKey: 'foxgloveTea', amount: 1 },
    imageKey : 'foxgloveTea',
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
    imageKey: 'aloeAfterSunCream',
  },
  {
    id: 3,
    name: 'Jasmine Tea',
    ingredients: [
      { key: 'jasminePlant', amount: 2 },
      { key: 'teaBag', amount: 1 },
    ],
    order: ['jasminePlant', 'teaBag', 'jasminePlant'],
    description: 'A fragrant tea made from jasmine flowers, known for its calming properties.',
    result: { key: 'jasmineTea', name: 'Jasmine Tea', imageKey: 'jasmineTea', amount: 1 },
    imageKey: 'jasmineTea',
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
        imageKey: 'lavenderOil',
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
        imageKey: 'marigoldSalve',
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
        imageKey: 'garlicPaste',
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
        imageKey: 'periwinkleExtract',
    },
    {
        id: 8,
        name: 'Thyme Infused Oil',
        ingredients: [
        { key: 'thymePlant', amount: 2 },
        { key: 'oilBase', amount: 1 },
        ],
        order: ['thymePlant', 'oilBase', 'thymePlant'],
        description: 'An infused oil made from thyme, known for its culinary and medicinal properties. It hasben proven to be effective in treating coughs and colds.',
        result: { key: 'thymeInfusedOil', name: 'Thyme Infused Oil', imageKey: 'thymeInfusedOil', amount: 1 },
        imageKey: 'thymeInfusedOil',
    },
    {
        id: 9,
        name: 'Willow Bark Tea',
        ingredients: [
        { key: 'willowPlant', amount: 2 },
        { key: 'teaBag', amount: 1 },
        ],
        order: ['willowPlant', 'teaBag', 'willowPlant'],
    description: 'A herbal tea made from willow bark, known for its pain-relieving properties. It has been used for centuries to treat fevers and other pains.',
        result: { key: 'willowBarkTea', name: 'Willow Bark Tea', imageKey: 'willowBarkTea', amount: 1 },
        imageKey: 'willowBarkTea',
    }
];

export default recipieData