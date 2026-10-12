const nodemailer = require("nodemailer");

// =====================================================
// CREATE EMAIL TRANSPORTER
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

const verifyEmailConfiguration = async () => {

    try {

        if (
            !process.env.EMAIL_USER ||
            !process.env.EMAIL_PASSWORD
        ) {

            console.warn(
                "Email notification configuration is missing."
            );

            return false;
        }

        await transporter.verify();

        console.log(
            "Email notification service is ready."
        );

        return true;

    } catch (error) {

        console.error(
            "Email configuration error:",
            error.message
        );

        return false;
    }
};


// =====================================================
// SEND EMAIL
// =====================================================

const sendEmail = async ({
    to,
    subject,
    text,
    html
}) => {

    try {

        if (!to) {

            throw new Error(
                "Recipient email is required"
            );
        }


        const mailOptions = {

            from:
                `"Secure File Collaboration" <${process.env.EMAIL_USER}>`,

            to,

            subject,

            text,

            html
        };


        const info =
            await transporter.sendMail(
                mailOptions
            );


        console.log(
            "Email sent successfully:",
            info.messageId
        );


        return info;

    } catch (error) {

        console.error(
            "Email sending error:",
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

    const clientUrl =
        process.env.CLIENT_URL ||
        "http://localhost:5173";


    const subject =
        `A file has been shared with you - ${fileName}`;


    const text = `

Hello ${recipientName || "User"},

${senderName || "A user"} has shared a file with you.

File: ${fileName}

Permission: ${permission}

You can log in to Secure File Collaboration to access the file:

${clientUrl}

Regards,
Secure File Collaboration

`;


    const html = `

<div style="
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: auto;
    padding: 30px;
    background: #f8fafc;
">

    <div style="
        background: #0f172a;
        color: white;
        padding: 20px;
        border-radius: 10px 10px 0 0;
    ">

        <h2 style="margin: 0;">
            Secure File Collaboration
        </h2>

    </div>


    <div style="
        background: white;
        padding: 30px;
        border-radius: 0 0 10px 10px;
    ">

        <h2 style="color: #1e293b;">
            A file has been shared with you
        </h2>


        <p>
            Hello ${recipientName || "User"},
        </p>


        <p>
            <strong>
                ${senderName || "A user"}
            </strong>
            has shared a file with you.
        </p>


        <div style="
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        ">

            <p>
                <strong>File:</strong>
                ${fileName}
            </p>

            <p>
                <strong>Permission:</strong>
                ${permission}
            </p>

        </div>


        <a
            href="${clientUrl}"
            style="
                display: inline-block;
                background: #2563eb;
                color: white;
                text-decoration: none;
                padding: 12px 20px;
                border-radius: 6px;
                font-weight: bold;
            "
        >
            Open Secure Files
        </a>


        <p style="
            margin-top: 30px;
            color: #64748b;
            font-size: 13px;
        ">
            This is an automated notification from
            Secure File Collaboration.
        </p>

    </div>

</div>

`;


    return sendEmail({

        to: recipientEmail,

        subject,

        text,

        html
    });
};


// =====================================================
// PERMISSION CHANGE EMAIL
// =====================================================

const sendPermissionChangeEmail = async ({
    recipientEmail,
    recipientName,
    fileName,
    oldPermission,
    newPermission
}) => {

    const clientUrl =
        process.env.CLIENT_URL ||
        "http://localhost:5173";


    return sendEmail({

        to: recipientEmail,

        subject:
            `File permission changed - ${fileName}`,

        text: `

Hello ${recipientName || "User"},

Your permission for "${fileName}" has been changed.

Previous permission: ${oldPermission}
New permission: ${newPermission}

Login here:

${clientUrl}

Regards,
Secure File Collaboration

`,

        html: `

<div style="
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: auto;
    padding: 30px;
">

    <h2>
        File Permission Changed
    </h2>

    <p>
        Hello ${recipientName || "User"},
    </p>

    <p>
        Your permission for
        <strong>${fileName}</strong>
        has been changed.
    </p>

    <div style="
        background: #f1f5f9;
        padding: 20px;
        border-radius: 8px;
    ">

        <p>
            <strong>Previous:</strong>
            ${oldPermission}
        </p>

        <p>
            <strong>New:</strong>
            ${newPermission}
        </p>

    </div>

    <p style="margin-top: 25px;">

        <a
            href="${clientUrl}"
            style="
                background: #2563eb;
                color: white;
                padding: 12px 20px;
                text-decoration: none;
                border-radius: 6px;
            "
        >
            Open Secure Files
        </a>

    </p>

</div>

`
    });
};


// =====================================================
// ACCESS REVOKED EMAIL
// =====================================================

const sendAccessRevokedEmail = async ({
    recipientEmail,
    recipientName,
    fileName
}) => {

    return sendEmail({

        to: recipientEmail,

        subject:
            `File access revoked - ${fileName}`,

        text: `

Hello ${recipientName || "User"},

Your access to "${fileName}" has been revoked.

You can no longer access this shared file.

Regards,
Secure File Collaboration

`,

        html: `

<div style="
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: auto;
    padding: 30px;
">

    <h2>
        File Access Revoked
    </h2>

    <p>
        Hello ${recipientName || "User"},
    </p>

    <p>
        Your access to
        <strong>${fileName}</strong>
        has been revoked.
    </p>

    <div style="
        background: #fee2e2;
        padding: 15px;
        border-radius: 8px;
        color: #991b1b;
    ">

        You can no longer access this shared file.

    </div>

    <p>
        Secure File Collaboration
    </p>

</div>

`
    });
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    sendEmail,

    verifyEmailConfiguration,

    sendFileSharedEmail,

    sendPermissionChangeEmail,

    sendAccessRevokedEmail

};