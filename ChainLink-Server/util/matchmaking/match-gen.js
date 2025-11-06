const User = require("../../models/User.js");
const Config = require("./match-config.json");

module.exports.generateEventMatches = async (userID, events) => {
    const user = await User.findOne({ _id: userID });

    // User Variables
    // const userWKG = user.FTP / user.weight;
    const userWKG = (user?.FTP && user?.weight) ? (user.FTP / user.weight) : 0;


    // Match Calculation
    const matchedEvents = events.map(event => {

        // === W/KG Calculation ===
        /*
        let wkgScore;

        const [minWKG, maxWKG] = event.wattsPerKilo || [0, 0];
        const diffFromMinWKG = Math.abs(userWKG - minWKG);
        const diffFromMaxWKG = Math.abs(userWKG - maxWKG);
        const wkgDifference = Math.min(diffFromMinWKG, diffFromMaxWKG);
        */
       // === W/KG Calculation (robust) ===
        let wkgScore;
        let wkgDifference = 0;

        if (Array.isArray(event.wattsPerKilo) && event.wattsPerKilo.length === 2) {
        const minWKG = Number(event.wattsPerKilo[0]) || 0;
        const maxWKG = Number(event.wattsPerKilo[1]) || 0;
        const diffFromMinWKG = Math.abs(userWKG - minWKG);
        const diffFromMaxWKG = Math.abs(userWKG - maxWKG);
        wkgDifference = Math.min(diffFromMinWKG, diffFromMaxWKG);
        } else {
        // No wattsPerKilo provided → neutral
        wkgDifference = 0;
        }



        if (wkgDifference <= Config["wkg-thresh-great"]) {
            wkgScore = 1;
        } else if (wkgDifference <= Config["wkg-thresh-good"]) {
            wkgScore = 2;
        } else {
            wkgScore = 3;
        }

        // * Implement additional calculations here *

        // === Final Match Weight Calculation ===

        // * Factor in additional scores here and apply respective multipliers *
        const matchScore = wkgScore * Config["wkg-multiplier"];

        // === Final Match Assignment ===
        let match = "";
        if (matchScore <= Config["match-thresh-great"]) {
            match = 1;
        } else if (matchScore <= Config["match-thresh-good"]) {
            match = 2;
        } else {
            match = 3;
        }

        return {
            ...event,
            match: match,
        };
    });
    return matchedEvents;
}
