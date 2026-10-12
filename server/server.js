require("dotenv").config();

console.log(
    "Mongo URI exists:",
    !!process.env.MONGO_URI
);


// =====================================================
// IMPORTS
// =====================================================

const cors = require("cors");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const {
    setIO
} = require("./socket");

const connectDB =
    require("./config/db");

const authRoutes =
    require("./routes/authRoutes");

const fileRoutes =
    require("./routes/fileRoutes");

const shareRoutes =
    require("./routes/shareRoutes");

const userRoutes =
    require("./routes/userRoutes");

const adminRoutes =
    require("./routes/adminRoutes");

const activityRoutes =
    require("./routes/activityRoutes");

const storageRoutes =
    require("./routes/storageRoutes");
   

const notificationRoutes =
    require("./routes/notificationRoutes");

const pushRoutes =
    require("./routes/pushRoutes");


// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();


// =====================================================
// CREATE HTTP SERVER
// =====================================================

const server =
    http.createServer(app);


// =====================================================
// ALLOWED FRONTEND ORIGINS
// =====================================================

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:5174"
].filter(Boolean);


// =====================================================
// CREATE SOCKET.IO SERVER
// =====================================================

const io =
    new Server(server, {

        cors: {

            origin: allowedOrigins,

            methods: [
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
            ],

            credentials: true

        }

    });


// =====================================================
// SOCKET.IO AUTHENTICATION
// =====================================================

// The client must provide a JWT token.
//
// The server verifies the token before allowing
// the socket connection.
//
// This prevents an unauthenticated client from
// accessing private notification rooms.
// =====================================================

io.use(
    (socket, next) => {

        const token =
            socket.handshake.auth?.token;


        if (!token) {

            console.log(
                "Socket authentication failed: token missing"
            );

            return next(
                new Error(
                    "Authentication required"
                )
            );

        }


        try {

            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );


            socket.user =
                decoded;


            next();

        } catch (error) {

            console.log(
                "Socket authentication failed: invalid or expired token"
            );


            next(
                new Error(
                    "Invalid or expired token"
                )
            );

        }

    }
);


// =====================================================
// MAKE SOCKET.IO AVAILABLE
// =====================================================

setIO(io);


// =====================================================
// SOCKET.IO CONNECTION
// =====================================================

io.on(
    "connection",
    (socket) => {

        console.log(
            "Socket connected:",
            socket.id
        );


        // =============================================
        // GET USER ID FROM VERIFIED JWT
        // =============================================

        const userId =
            socket.user?.userId;


        if (!userId) {

            console.log(
                "User ID missing from authenticated socket"
            );


            socket.disconnect(true);

            return;

        }


        // =============================================
        // JOIN PRIVATE USER ROOM
        // =============================================

        // IMPORTANT:
        //
        // We do NOT accept a userId from the client.
        //
        // The server gets the user ID from the JWT
        // that was already verified above.
        // =============================================

        const room =
            `user-${userId}`;


        socket.join(room);


        console.log(
            `Authenticated user ${userId} joined notification room`
        );


        // =============================================
        // DISCONNECT
        // =============================================

        socket.on(
            "disconnect",
            (reason) => {

                console.log(
                    "Socket disconnected:",
                    socket.id,
                    reason
                );

            }
        );

    }
);


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    cors({

        origin: function (origin, callback) {

            // Allow requests that don't contain
            // an Origin header, such as Postman
            // or server-to-server requests.

            if (!origin) {
                return callback(null, true);
            }


            if (allowedOrigins.includes(origin)) {

                return callback(
                    null,
                    true
                );

            }


            return callback(
                new Error("Not allowed by CORS")
            );

        },

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]

    })
);


app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended: true
    })
);


// =====================================================
// STATIC UPLOADS
// =====================================================

// Allows uploaded files to be accessed if needed.
//
// Example:
// http://localhost:5000/uploads/file.pdf
// =====================================================

app.use(
    "/uploads",
    express.static("uploads")
);


// =====================================================
// CONNECT DATABASE
// =====================================================

connectDB();


// =====================================================
// API ROUTES
// =====================================================


// -----------------------------------------
// ROUTE TYPE CHECKS
// -----------------------------------------

console.log(
    "AUTH:",
    typeof authRoutes
);

console.log(
    "FILES:",
    typeof fileRoutes
);

console.log(
    "SHARES:",
    typeof shareRoutes
);

console.log(
    "USERS:",
    typeof userRoutes
);

console.log(
    "ADMIN:",
    typeof adminRoutes
);

console.log(
    "ACTIVITY:",
    typeof activityRoutes
);

console.log(
    "STORAGE:",
    typeof storageRoutes
);

console.log(
    "NOTIFICATIONS:",
    typeof notificationRoutes
);

console.log(
    "PUSH:",
    typeof pushRoutes
);


// -----------------------------------------
// AUTH
// -----------------------------------------

app.use(
    "/api/auth",
    authRoutes
);


// -----------------------------------------
// FILES
// -----------------------------------------

// Includes:
//
// POST   /api/files/upload
// GET    /api/files
// GET    /api/files/:id/download
// DELETE /api/files/:id
// PUT    /api/files/:id/rename
//
// VERSIONING:
//
// POST   /api/files/:id/version
// GET    /api/files/:id/versions
// GET    /api/files/:id/versions/:version/download
// PUT    /api/files/:id/versions/:version/restore
//
// LOCK:
//
// PUT    /api/files/:id/lock
// PUT    /api/files/:id/unlock
// -----------------------------------------

app.use(
    "/api/files",
    fileRoutes
);


// -----------------------------------------
// SHARING
// -----------------------------------------

app.use(
    "/api/shares",
    shareRoutes
);


// -----------------------------------------
// USERS
// -----------------------------------------

app.use(
    "/api/users",
    userRoutes
);


// -----------------------------------------
// ADMIN
// -----------------------------------------

app.use(
    "/api/admin",
    adminRoutes
);


// -----------------------------------------
// ACTIVITY
// -----------------------------------------

app.use(
    "/api/activity",
    activityRoutes
);

// -----------------------------------------
// STORAGE
// -----------------------------------------

app.use(
    "/api/storage",
    storageRoutes
);


// -----------------------------------------
// NOTIFICATIONS
// -----------------------------------------

app.use(
    "/api/notifications",
    notificationRoutes
);


// -----------------------------------------
// PUSH NOTIFICATIONS
// -----------------------------------------

app.use(
    "/api/push",
    pushRoutes
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
    "/",
    (req, res) => {

        return res.status(200).json({

            success: true,

            message:
                "Secure File Server API is running",

            version:
                "1.0.0"

        });

    }
);


// =====================================================
// API HEALTH CHECK
// =====================================================

app.get(
    "/api/health",
    (req, res) => {

        return res.status(200).json({

            success: true,

            message:
                "API is healthy",

            timestamp:
                new Date().toISOString()

        });

    }
);


// =====================================================
// 404 API HANDLER
// =====================================================

app.use(
    (req, res, next) => {

        return res.status(404).json({

            success: false,

            message:
                `Route not found: ${req.method} ${req.originalUrl}`

        });

    }
);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "Global server error:",
            err
        );


        // -----------------------------------------
        // MULTER FILE SIZE ERROR
        // -----------------------------------------

        if (
            err &&
            err.code === "LIMIT_FILE_SIZE"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "File size cannot exceed 5 MB"

            });

        }


        // -----------------------------------------
        // MULTER FILE TYPE / FILTER ERROR
        // -----------------------------------------

        if (
            err &&
            err.message ===
            "File type not allowed"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "File type not allowed"

            });

        }


        // -----------------------------------------
        // DEFAULT ERROR
        // -----------------------------------------

        return res.status(
            err.status || 500
        ).json({

            success: false,

            message:
                err.message ||
                "Internal server error"

        });

    }
);


// =====================================================
// PORT
// =====================================================

const PORT =
    process.env.PORT || 5000;


// =====================================================
// START SERVER
// =====================================================

server.listen(
    PORT,
    "0.0.0.0",

    () => {

        console.log("");

        console.log(
            "=============================================="
        );

        console.log(
            "   SECURE FILE SERVER"
        );

        console.log(
            "=============================================="
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `API: http://localhost:${PORT}/api`
        );

        console.log(
            `Health: http://localhost:${PORT}/api/health`
        );

        console.log(
            "Socket.IO server is running"
        );

        console.log(
            "File versioning APIs enabled"
        );

        console.log(
            "=============================================="
        );

        console.log("");

    }
);