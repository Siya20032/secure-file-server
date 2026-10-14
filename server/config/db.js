
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;

        if (!uri) {
            throw new Error("MONGO_URI is missing");
        }

        // Safely inspect the URI without logging credentials.
        const queryStart = uri.indexOf("?");

        if (queryStart !== -1) {
            const query = new URLSearchParams(
                uri.substring(queryStart + 1)
            );

            if (query.has("appName") && !query.get("appName")) {
                throw new Error(
                    "MONGO_URI contains an empty appName parameter. " +
                    "Remove appName or give it a value in Render."
                );
            }
        }

        await mongoose.connect(uri);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
