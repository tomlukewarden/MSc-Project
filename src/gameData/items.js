const itemsData = [
  // Plant items for harvesting
  {
    id: "foxglovePlant",
    key: "foxglovePlant",
    name: "Foxglove Plant",
    description: "A harvested foxglove plant.",
    imageKey: "foxglovePlant",
    type: "plant"
  },
  {
    id: "aloePlant",
    key: "aloePlant",
    name: "Aloe Vera Plant",
    description: "A harvested aloe vera plant.",
    imageKey: "aloePlant",
    type: "plant"
  },
  {
    id: "lavenderPlant",
    key: "lavenderPlant",
    name: "Lavender Plant",
    description: "A harvested lavender plant.",
    imageKey: "lavenderPlant",
    type: "plant"
  },
  {
    id: "marigoldPlant",
    key: "marigoldPlant",
    name: "Marigold Plant",
    description: "A harvested marigold plant.",
    imageKey: "marigoldPlant",
    type: "plant"
  },
  {
    id: "garlicPlant",
    key: "garlicPlant",
    name: "Garlic Plant",
    description: "A harvested garlic plant.",
    imageKey: "garlicPlant",
    type: "plant"
  },
  {
    id: "jasminePlant",
    key: "jasminePlant",
    name: "Jasmine Plant",
    description: "A harvested jasmine plant.",
    imageKey: "jasminePlant",
    type: "plant"
  },
  {
    id: "periwinklePlant",
    key: "periwinklePlant",
    name: "Periwinkle Plant",
    description: "A harvested periwinkle plant.",
    imageKey: "periwinklePlant",
    type: "plant"
  },
  {
    id: "thymePlant",
    key: "thymePlant",
    name: "Thyme Plant",
    description: "A harvested thyme plant.",
    imageKey: "thymePlant",
    type: "plant"
  },
  {
    id: "willowPlant",
    key: "willowPlant",
    name: "Willow Plant",
    description: "A harvested willow plant.",
    imageKey: "willowPlant",
    type: "plant"
  },

  // Extras (base cream, oil, alcohol, teabag)
  {
    id: "baseCream",
    key: "baseCream",
    name: "Base Cream",
    price: 10,
    description: "A versatile base cream for making salves.",
    imageKey: "baseCream",
    type: "extra"
  },
  {
    id: "oilBase",
    key: "oilBase",
    name: "Oil Base",
    price: 15,
    description: "A base oil for making oils.",
    imageKey: "oilBase",
    type: "extra"
  },
  {
    id: "alcoholBase",
    key: "alcoholBase",
    name: "Alcohol Base",
    price: 20,
    description: "A base alcohol for making tinctures.",
    imageKey: "alcoholBase",
    type: "extra"
  },
  {
    id: "teaBag",
    key: "teaBag",
    name: "Tea Bag",
    price: 5,
    description: "A simple tea bag for brewing.",
    imageKey: "teaBag",
    type: "extra"
  },

  // Seeds
  {
    id: "foxgloveSeeds",
    key: "foxgloveSeeds",
    name: "Foxglove Seeds",
    price: 20,
    description: "Seeds for growing foxglove plants.",
    imageKey: "foxgloveSeeds",
    type: "seed",
    plantKey: "foxglovePlant"
  },
  {
    id: "jasmineSeeds",
    key: "jasmineSeeds",
    name: "Jasmine Seeds",
    price: 20,
    description: "Seeds for growing jasmine plants.",
    imageKey: "jasmineSeeds",
    type: "seed",
    plantKey: "jasminePlant"
  },
  {
    id: "lavenderSeeds",
    key: "lavenderSeeds",
    name: "Lavender Seeds",
    price: 20,
    description: "Seeds for growing lavender plants.",
    imageKey: "lavenderSeeds",
    type: "seed",
    plantKey: "lavenderPlant"
  },
  {
    id: "marigoldSeeds",
    key: "marigoldSeeds",
    name: "Marigold Seeds",
    price: 20,
    description: "Seeds for growing marigold plants.",
    imageKey: "marigoldSeeds",
    type: "seed",
    plantKey: "marigoldPlant"
  },
  {
    id: "aloeVeraSeeds",
    key: "aloeVeraSeeds",
    name: "Aloe Vera Seeds",
    price: 20,
    description: "Seeds for growing aloe vera plants.",
    imageKey: "aloeSeeds",
    type: "seed",
    plantKey: "aloeVeraPlant"
  },
  {
    id: "garlicSeeds",
    key: "garlicSeeds",
    name: "Garlic Seeds",
    price: 20,
    description: "Seeds for growing garlic plants.",
    imageKey: "garlicSeeds",
    type: "seed",
    plantKey: "garlicPlant"
  },
  {
    id: "periwinkleSeeds",
    key: "periwinkleSeeds",
    name: "Periwinkle Seeds",
    price: 20,
    description: "Seeds for growing periwinkle plants.",
    imageKey: "periwinkleSeeds",
    type: "seed",
    plantKey: "periwinklePlant"
  },
  {
    id: "thymeSeeds",
    key: "thymeSeeds",
    name: "Thyme Seeds",
    price: 20,
    description: "Seeds for growing thyme plants.",
    imageKey: "thymeSeeds",
    type: "seed",
    plantKey: "thymePlant"
  },
  {
    id: "willowSeeds",
    key: "willowSeeds",
    name: "Willow Seeds",
    price: 20,
    description: "Seeds for growing willow plants.",
    imageKey: "willowSeeds",
    type: "seed",
    plantKey: "willowPlant"
  },

  // Tools
  {
    id:"hoe",
    key: "hoe",
    name: "Hoe",
    price: 50,  
    description: "A tool for preparing soil for planting.",
    imageKey: "hoeImage",
    type: "tool"  
  },
  {
    id: "wateringCan",
    key: "wateringCan",
    name: "Watering Can",
    price: 30,
    description: "A can for watering plants.",
    imageKey: "wateringCanImage",
    type: "tool"
  },
  {
    id: "shovel",
    key: "shovel",
    name: "Shovel",
    price: 40,
    description: "A tool for harvesting plants.",
    imageKey: "shovelImage",
    type: "tool"
  },
  {
    id:"springShard",
    key: "springShard",
    name: "Spring Shard",
    price: 100,
    description: "A shard of spring energy, used to power the garden.",
    imageKey: "springShard",
    type: "extra"
  },
  {id: "summerShard",
    key: "summerShard",
    name: "Summer Shard",
    price: 100,
    description: "A shard of summer energy, used to power the garden.",
    imageKey: "summerShard",
    type: "extra"
  },
  {id: "autumnShard",
    key: "autumnShard",
    name: "Autumn Shard",
    price: 100,
    description: "A shard of autumn energy, used to power the garden.",
    imageKey: "autumnShard",
    type: "extra"
  },
  {id: "winterShard",
    key: "winterShard",
    name: "Winter Shard",  
    price: 100,
    description: "A shard of winter energy, used to power the garden.",
    imageKey: "winterShard",
    type: "extra"
  }
];

export default itemsData;