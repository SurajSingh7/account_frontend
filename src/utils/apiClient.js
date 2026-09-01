import { toast } from "react-hot-toast";

/**
 *  BEST PRACTICE API CLIENT (USAGE)
 * --------------------------------------------------
 
    try {
        // apiClient(url, { method, headers, body, credentials }, router)
      const res = await apiClient(url, options);
         // success → toast in UI
         // use res.data / res.message here
    } catch {
         // error → toast in apiClient
         // API failed → already handled centrally
    }

 */


export const apiClient = async (url, options = {}, router = null) => {
    try {
        const response = await fetch(url, {
            credentials: "include",
            ...options,
        });

        const contentType = response.headers.get("content-type");
        let data = null;

        if (contentType?.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // ❌ FAILURE → HANDLE + THROW
        if (!response.ok) {
            handleError(response.status, data, router);
            throw new Error(data?.message || "API request failed");
        }

        // ✅ SUCCESS → RETURN DATA (UI CAN READ res.message / res.data)
        return data;

    } catch (error) {
        // Network / unexpected error only
        if (error.message === "Failed to fetch") {
            toast.error("Network error. Please check your internet connection.");
        }

        console.error("API Error:", error);
        throw error; // 🔥 REQUIRED
    }
};

/**
 * CENTRALIZED ERROR HANDLER
 * --------------------------------------------------
 * ❗ Handles ONLY error toasts
 * ❗ No success toast here
 * ❗ No return values
 */
const handleError = (status, data, router) => {
    switch (status) {
        case 400:
            toast.error(
                data?.errors?.[0]?.msg ||
                data?.message ||
                "Invalid request"
            );
            break;

        case 401:
        case 403:
            toast.error("Session expired. Please login again.");
            if (router) router.push("/error/notAuthorized");
            break;

        case 404:
            toast("No records available", { icon: "ℹ️" });

            break;

        case 500:
            toast.error("Internal server error. Please try again later.");
            break;

        default:
            toast.error(data?.message || "Something went wrong");
    }
};