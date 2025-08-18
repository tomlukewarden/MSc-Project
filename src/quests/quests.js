import buddiesData from "../buddies";

const quests = [
    {
        id: 0,
        title: "Welcome to the Gardens",
        description: "Go and talk to your fairy friend to get started.",
        active: true,
        completed: false,
        imageKey: "fairySad" // Will show fairyBuddy when completed
    },
    {
        id: 1,
        title: "Help Paula Nator",
        description: "Give Paula Nator a plant to help her out.",
        imageKey: "beeSad", // Will show beeBuddy when completed
        active: false,
        completed: false
    },
    {
        id: 2,
        title: "Plant your first crop",
        description: "Hoe the ground and plant your first crop. Remember to water it daily for 3 days!",
        active: false,
        completed: false,
        imageKey: "hoeIcon" // Generic tool, no sad/happy version
    },
    {
        id: 3,
        title: "Return the first Shard",
        description: "Talk to the Mona, she will take you to the pillars to return the first Shard.",
        active: false,
        completed: false,
        imageKey: "butterflySad" // Will show butterflyBuddy when completed (Mona is the butterfly)
    },
    {
        id: 4,
        title: "Return all Shards",
        description: "Return all Shards to the Season Pillars.",
        active: false,
        completed: false,
        imageKey: "butterflySad" // Will show butterflyBuddy when completed
    }
];

// Add a quest for each buddy
buddiesData.forEach((buddy, idx) => {
    // Determine the sad version of the buddy's imageKey
    let sadImageKey = buddy.imageKey.replace("Buddy", "Sad");
    
    quests.push({
        id: quests.length + 1,
        title: `Help ${buddy.name}`,
        description: `Give ${buddy.name} a remedy to help them out.`,
        active: false,
        buddy: idx,
        completed: false,
        imageKey: sadImageKey // Will show buddy.imageKey when completed
    });
});

export default quests;
