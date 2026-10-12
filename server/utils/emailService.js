const nodemailer = require("nodemailer");

// =====================================================
// EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});


// =====================================================
// VERIFY EMAIL CONFIGURATION
// =====================================================

const verifyEmailConnection = async () => {

    try {

        await transporter.verify();

        console.log(
            "✅ Email service is ready"
        );

    } catch (error) {

        console.error(
            "❌ Email service configuration error:",
            error.message
        );
    }
};


// =====================================================
// SEND EMAIL
// =====================================================

const sendEmail = async ({
    to,
    subject,
    html
}) => {

    try {

        if (!to) {

            throw new Error(
                "Recipient email is required"
            );
        }

        const info =
            await transporter.sendMail({

                from: `"Secure Files" <${process.env.EMAIL_USER}>`,

                to,

                subject,

                html
            });


        console.log(
            "📧 Email sent successfully:",
            info.messageId
        );


        return info;

    } catch (error) {

        console.error(
            "❌ Email sending error:",
            error.message
        );

        throw error;
    }
};


// =====================================================
// FILE SHARED EMAIL
// =====================================================

const sendFileSharedEmail = async ({
    recipientEmail,
    recipientName,
    senderName,
    fileName,
    permission
}) => {

    const subject =
        `Secure Files - ${senderName} shared a file with you`;


    const html = `

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <meta name="viewport"
                content="width=device-width, initial-scale=1.0">

            <title>
                File Shared
            </title>

        </head>


        <body
            style="
                margin:0;
                padding:0;
                background:#f1f5f9;
                font-family:Arial, sans-serif;
            "
        >

            <div
                style="
                    max-width:600px;
                    margin:40px auto;
                    background:white;
                    border-radius:12px;
                    overflow:hidden;
                    box-shadow:0 4px 15px rgba(0,0,0,0.08);
                "
            >

                <!-- HEADER -->

                <div
                    style="
                        background:#0f172a;
                        padding:25px;
                        text-align:center;
                    "
                >

                    <h1
                        style="
                            color:white;
                            margin:0;
                            font-size:24px;
                        "
                    >
                        Secure Files
                    </h1>

                    <p
                        style="
                            color:#94a3b8;
                            margin:8px 0 0;
                        "
                    >
                        Secure File Management System
                    </p>

                </div>


                <!-- CONTENT -->

                <div
                    style="
                        padding:35px;
                    "
                >

                    <h2
                        style="
                            color:#0f172a;
                            margin-top:0;
                        "
                    >
                        📁 A file was shared with you
                    </h2>


                    <p
                        style="
                            color:#475569;
                            font-size:16px;
                            line-height:1.6;
                        "
                    >

                        Hello
                        <strong>
                            ${recipientName || "User"}
                        </strong>,

                    </p>


                    <p
                        style="
                            color:#475569;
                            font-size:16px;
                            line-height:1.6;
                        "
                    >

                        <strong>
                            ${senderName}
                        </strong>
                        has shared a file with you
                        through Secure Files.

                    </p>


                    <!-- FILE CARD -->

                    <div
                        style="
                            background:#f8fafc;
                            border:1px solid #e2e8f0;
                            border-radius:10px;
                            padding:20px;
                            margin:25px 0;
                        "
                    >

                        <p
                            style="
                                margin:0 0 10px;
                                color:#64748b;
                                font-size:13px;
                            "
                        >
                            FILE
                        </p>


                        <p
                            style="
                                margin:0;
                                color:#0f172a;
                                font-size:18px;
                                font-weight:bold;
                            "
                        >
                            📄 ${fileName}
                        </p>


                        <p
                            style="
                                margin:15px 0 0;
                                color:#64748b;
                            "
                        >

                            Permission:

                            <strong>
                                ${permission === "write"
                                    ? "Write"
                                    : "Read"}
                            </strong>

                        </p>

                    </div>


                    <p
                        style="
                            color:#475569;
                            line-height:1.6;
                        "
                    >

                        You can log in to Secure Files
                        to access this file.

                    </p>


                    <!-- BUTTON -->

                    <div
                        style="
                            text-align:center;
                            margin:30px 0;
                        "
                    >

                        <a
                            href="${process.env.CLIENT_URL || "#"}"
                            style="
                                display:inline-block;
                                background:#2563eb;
                                color:white;
                                text-decoration:none;
                                padding:13px 25px;
                                border-radius:8px;
                                font-weight:bold;
                            "
                        >
                            Open Secure Files
                        </a>

                    </div>


                    <p
                        style="
                            color:#94a3b8;
                            font-size:13px;
                            line-height:1.5;
                        "
                    >

                        If you were not expecting this
                        notification, you can safely ignore
                        this email.

                    </p>

                </div>


                <!-- FOOTER -->

                <div
                    style="
                        background:#f8fafc;
                        padding:20px;
                        text-align:center;
                        border-top:1px solid #e2e8f0;
                    "
                >

                    <p
                        style="
                            margin:0;
                            color:#94a3b8;
                            font-size:12px;
                        "
                    >

                        © ${new Date().getFullYear()}
                        Secure Files

                    </p>

                    <p
                        style="
                            margin:6px 0 0;
                            color:#94a3b8;
                            font-size:12px;
                        "
                    >

                        This is an automated notification.

                    </p>

                </div>

            </div>

        </body>

        </html>

    `;


    return sendEmail({

        to:
            recipientEmail,

        subject,

        html

    });
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    sendEmail,

    sendFileSharedEmail,

    verifyEmailConnection

};