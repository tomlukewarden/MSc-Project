import buddiesData from "../buddies";

const quests = [
    {
        id: 1,
        title: "Help Paula Nator",
        description: "Give Paula Nator a plant to help her out.",
        completed: false
    },
    {
        id: 2,
        title: "Plant your first crop",
        description: "Hoe the ground and plant your first crop. Remember to water it daily for 3 days!",
        completed: false
    },
    {
        id: 3,
        title: "Return the first Shard",
        description: "Return the first Shard to the Season Pillars.",
        completed: false
    },
    {
        id: 4,
        title:"Return all Shards",
        description: "Return all Shards to the Season Pillars.",
        completed: false
    }
];

// Add a quest for each buddy
buddiesData.forEach((buddy, idx) => {
    quests.push({
        id: quests.length + 1,
        title: `Help ${buddy.name}`,
        description: `Give ${buddy.name} a remedy to help them out.`,
        completed: false
    });
});

export default quests;
