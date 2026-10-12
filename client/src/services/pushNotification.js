const API_URL = "http://http://localhost:5000";

// =====================================================
// DEBUG: CHECK VAPID PUBLIC KEY
// =====================================================

console.log(
    "VAPID KEY FROM VITE:",
    import.meta.env.VITE_VAPID_PUBLIC_KEY
);


// =====================================================
// GET VAPID PUBLIC KEY
// =====================================================

const getVapidPublicKey = () => {

    return import.meta.env.VITE_VAPID_PUBLIC_KEY;

};


// =====================================================
// CONVERT BASE64 TO UINT8 ARRAY
// =====================================================

const urlBase64ToUint8Array = (base64String) => {

    const padding =
        "=".repeat(
            (4 - (base64String.length % 4)) % 4
        );

    const base64 =
        (
            base64String +
            padding
        )
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const rawData =
        window.atob(base64);

    return Uint8Array.from(
        [...rawData].map(
            (char) =>
                char.charCodeAt(0)
        )
    );

};


// =====================================================
// REGISTER SERVICE WORKER
// =====================================================

const registerServiceWorker = async () => {

    if (!("serviceWorker" in navigator)) {

        throw new Error(
            "Service workers are not supported by this browser."
        );

    }

    const registration =
        await navigator.serviceWorker.register(
            "/sw.js"
        );

    console.log(
        "Service worker registered:",
        registration
    );

    return registration;

};


// =====================================================
// REQUEST NOTIFICATION PERMISSION
// =====================================================

const requestNotificationPermission = async () => {

    if (!("Notification" in window)) {

        throw new Error(
            "Notifications are not supported by this browser."
        );

    }

    const permission =
        await Notification.requestPermission();

    console.log(
        "Notification permission:",
        permission
    );

    return permission;

};


// =====================================================
// SUBSCRIBE USER
// =====================================================

export const subscribeToPushNotifications =
    async () => {

        try {

            // -------------------------------------------------
            // GET LOGIN TOKEN
            // -------------------------------------------------

            const token =
                localStorage.getItem("token");

            if (!token) {

                throw new Error(
                    "User is not logged in."
                );

            }


            // -------------------------------------------------
            // GET VAPID PUBLIC KEY
            // -------------------------------------------------

            const publicKey =
                getVapidPublicKey();

            console.log(
                "VAPID public key:",
                publicKey
            );


            if (!publicKey) {

                throw new Error(
                    "VAPID public key is missing."
                );

            }


            // -------------------------------------------------
            // REGISTER SERVICE WORKER
            // -------------------------------------------------

            const registration =
                await registerServiceWorker();


            // -------------------------------------------------
            // REQUEST NOTIFICATION PERMISSION
            // -------------------------------------------------

            const permission =
                await requestNotificationPermission();


            if (permission !== "granted") {

                console.log(
                    "Notification permission was not granted."
                );

                return false;

            }


            // -------------------------------------------------
            // GET EXISTING PUSH SUBSCRIPTION
            // -------------------------------------------------

            let subscription =
                await registration.pushManager.getSubscription();


            // -------------------------------------------------
            // CREATE NEW PUSH SUBSCRIPTION
            // -------------------------------------------------

            if (!subscription) {

                console.log(
                    "Creating new push subscription..."
                );

                subscription =
                    await registration.pushManager.subscribe({

                        userVisibleOnly: true,

                        applicationServerKey:
                            urlBase64ToUint8Array(
                                publicKey
                            )

                    });

            }


            // -------------------------------------------------
            // SHOW SUBSCRIPTION
            // -------------------------------------------------

            console.log(
                "Push subscription:",
                subscription
            );


            // -------------------------------------------------
            // SEND SUBSCRIPTION TO BACKEND
            // -------------------------------------------------

            const response =
                await fetch(
                    `${API_URL}/api/push/subscribe`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({
                                subscription
                            })

                    }
                );


            // -------------------------------------------------
            // READ BACKEND RESPONSE
            // -------------------------------------------------

            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to save push subscription."
                );

            }


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            console.log(
                "Push subscription saved:",
                data.message
            );

            return true;

        } catch (error) {

            console.error(
                "Push notification setup error:",
                error
            );

            return false;

        }

    };


// =====================================================
// UNSUBSCRIBE USER
// =====================================================

export const unsubscribeFromPushNotifications =
    async () => {

        try {

            // -------------------------------------------------
            // GET LOGIN TOKEN
            // -------------------------------------------------

            const token =
                localStorage.getItem("token");


            if (!token) {

                return;

            }


            // -------------------------------------------------
            // GET SERVICE WORKER
            // -------------------------------------------------

            const registration =
                await navigator.serviceWorker.getRegistration(
                    "/sw.js"
                );


            if (!registration) {

                console.log(
                    "No service worker registration found."
                );

                return;

            }


            // -------------------------------------------------
            // GET PUSH SUBSCRIPTION
            // -------------------------------------------------

            const subscription =
                await registration.pushManager.getSubscription();


            if (!subscription) {

                console.log(
                    "No push subscription found."
                );

                return;

            }


            // -------------------------------------------------
            // SAVE ENDPOINT BEFORE UNSUBSCRIBE
            // -------------------------------------------------

            const endpoint =
                subscription.endpoint;


            // -------------------------------------------------
            // UNSUBSCRIBE FROM BROWSER
            // -------------------------------------------------

            await subscription.unsubscribe();


            // -------------------------------------------------
            // REMOVE SUBSCRIPTION FROM BACKEND
            // -------------------------------------------------

            const response =
                await fetch(
                    `${API_URL}/api/push/unsubscribe`,
                    {

                        method: "DELETE",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({
                                endpoint
                            })

                    }
                );


            if (!response.ok) {

                console.error(
                    "Failed to remove subscription from backend."
                );

                return;

            }


            console.log(
                "Push notifications unsubscribed."
            );

        } catch (error) {

            console.error(
                "Unsubscribe push notification error:",
                error
            );

        }

    };

