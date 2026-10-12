
self.addEventListener("push", (event) => {

    if (!event.data) {
        return;
    }

    const data = event.data.json();

    const title =
        data.title || "Secure Files";

    const options = {

        body:
            data.message ||
            "You have a new notification.",

        icon:
            "/favicon.ico",

        badge:
            "/favicon.ico",

        data: {
            url:
                data.url || "/dashboard"
        }

    };


    event.waitUntil(

        self.registration.showNotification(
            title,
            options
        )

    );

});


// =====================================================
// NOTIFICATION CLICK
// =====================================================

self.addEventListener(
    "notificationclick",
    (event) => {

        event.notification.close();

        const url =
            event.notification.data?.url ||
            "/dashboard";


        event.waitUntil(

            clients.matchAll({
                type: "window",
                includeUncontrolled: true
            })

            .then((clientList) => {

                // If application is already open,
                // focus it.

                for (const client of clientList) {

                    if (
                        "focus" in client
                    ) {

                        client.navigate(url);

                        return client.focus();

                    }

                }


                // Otherwise open the application.

                if (
                    clients.openWindow
                ) {

                    return clients.openWindow(
                        url
                    );

                }

            })

        );

    }
);

