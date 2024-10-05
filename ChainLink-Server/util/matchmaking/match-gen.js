const User = require("../../models/User.js");
const Config = require("./match-config.json");

module.exports.generateEventMatches = async (userID, events) => {
    const user = await User.findOne({ _id: userID });

    // User Variables
    const userWKG = user.FTP / user.weight;

    // Match Calculation
    const matchedEvents = events.map(event => {

        // === W/KG Calculation ===
        let wkgScore;

        if (event.difficulty === "Above 4.5" || event.difficulty === "Below 2.0"){
            const rideWKG = parseFloat(event.difficulty.slice(-3))
            wkgDifference = Math.abs(rideWKG - userWKG);
        } else {
            const [minWKGstr, maxWKGstr] = event.difficulty.split(' to ');
            const minWKG = parseFloat(minWKGstr);
            const maxWKG = parseFloat(maxWKGstr);

            const diffFromMinWKG = Math.abs(userWKG - minWKG);
            const diffFromMaxWKG = Math.abs(userWKG - maxWKG);

            wkgDifference = Math.min(diffFromMinWKG, diffFromMaxWKG);
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
