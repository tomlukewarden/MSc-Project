import React from "react";

const fishInfo = [
    { key: "roundFish1", label: "Good Fish" },
    { key: "pointyFish1", label: "Good Fish" },
    { key: "badFish1", label: "Bad Fish" }
];

export default function FishTutorial({ onStart }) {
    return (
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(34,34,34,0.85)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <h1 style={{ color: "#ffe066", fontFamily: "Georgia", fontSize: 40 }}>Fishing Minigame</h1>
            <p style={{ color: "#fff", fontFamily: "Georgia", fontSize: 26, textAlign: "center" }}>
                Catch as many good fish as you can!<br />Avoid the bad fish.
            </p>
            <div style={{ display: "flex", gap: 60, margin: "40px 0" }}>
                {fishInfo.map((info, i) => (
                    <div key={info.key} style={{ textAlign: "center" }}>
                        <img
                            src={require(`/assets/minigame/fish/${info.key}.png`)}
                            alt={info.label}
                            style={{ width: 80, height: 80, objectFit: "contain" }}
                        />
                        <div style={{
                            color: info.label === "Bad Fish" ? "#ff4444" : "#fff",
                            fontFamily: "Georgia",
                            fontSize: 22,
                            marginTop: 10
                        }}>{info.label}</div>
                    </div>
                ))}
            </div>
            <button
                style={{
                    width: 260,
                    height: 70,
                    background: "#1976d2",
                    color: "#fff",
                    fontFamily: "Georgia",
                    fontSize: 32,
                    border: "2px solid #333",
                    borderRadius: 8,
                    cursor: "pointer"
                }}
                onClick={onStart}
            >
                Start Game
            </button>
        </div>
    );
}
