const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


// =====================================================
// TOKEN
// =====================================================

export const getToken = () => {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        ""
    );
};


// =====================================================
// COMMON API REQUEST
// =====================================================

export const apiRequest = async (
    endpoint,
    options = {}
) => {

    const token = getToken();

    const isFormData =
        options.body instanceof FormData;

    const headers = {
        ...(isFormData
            ? {}
            : {
                "Content-Type":
                    "application/json"
            }),

        ...(token
            ? {
                Authorization:
                    `Bearer ${token}`
            }
            : {}),

        ...(options.headers || {})
    };


    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );


    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }


    // =================================================
    // AUTH ERROR
    // =================================================

    if (response.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            "Something went wrong"
        );

    }


    return data;
};


// =====================================================
// GET
// =====================================================

export const get = (
    endpoint
) => {

    return apiRequest(
        endpoint,
        {
            method: "GET"
        }
    );

};


// =====================================================
// POST
// =====================================================

export const post = (
    endpoint,
    body
) => {

    return apiRequest(
        endpoint,
        {
            method: "POST",
            body:
                body instanceof FormData
                    ? body
                    : JSON.stringify(body)
        }
    );

};


// =====================================================
// PUT
// =====================================================

export const put = (
    endpoint,
    body
) => {

    return apiRequest(
        endpoint,
        {
            method: "PUT",
            body:
                body instanceof FormData
                    ? body
                    : JSON.stringify(body)
        }
    );

};


// =====================================================
// DELETE
// =====================================================

export const remove = (
    endpoint
) => {

    return apiRequest(
        endpoint,
        {
            method: "DELETE"
        }
    );

};


// =====================================================
// DOWNLOAD FILE
// =====================================================

export const downloadFile = async (
    endpoint
) => {

    const token = getToken();

    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                method: "GET",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


    if (response.status === 401) {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "user"
        );

        throw new Error(
            "Your session has expired. Please login again."
        );
    }


    if (!response.ok) {

        let message =
            "Download failed";

        try {

            const data =
                await response.json();

            message =
                data.message ||
                message;

        } catch {
            // Response was not JSON
        }

        throw new Error(message);
    }


    return response.blob();

};


// =====================================================
// API URL
// =====================================================

export { API_BASE_URL };