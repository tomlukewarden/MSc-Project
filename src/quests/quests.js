import buddiesData from "../buddies";

const quests = [
    {    id: 0,
        title: "Welcome to the Gardens",
        description: "Go and talk to your fairy friend to get started.",
        active: true,
        completed: false
    },
    {
        id: 1,
        title: "Help Paula Nator",
        description: "Give Paula Nator a plant to help her out.",
        active: false,
        completed: false
    },
    {
        id: 2,
        title: "Plant your first crop",
        description: "Hoe the ground and plant your first crop. Remember to water it daily for 3 days!",
        active: false,
        completed: false
    },
    {
        id: 3,
        title: "Return the first Shard",
        description: "Talk to the Mona, she will take you to the pillars to return the first Shard.",
        active: false,
        completed: false
    },
    {
        id: 4,
        title:"Return all Shards",
        description: "Return all Shards to the Season Pillars.",
       active: false,
        completed: false
    }
];

// Add a quest for each buddy
buddiesData.forEach((buddy, idx) => {
    quests.push({
        id: quests.length + 1,
        title: `Help ${buddy.name}`,
        description: `Give ${buddy.name} a remedy to help them out.`,
        active: false,
        buddy: idx,
        completed: false
    });
});

export default quests;
