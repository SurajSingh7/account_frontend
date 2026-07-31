"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Profile } from "./components/Profile";
import { Navbar } from "./components/NavBar/Navbar";
import { ModuleSwitcher } from "./components/NavBar/ModuleSwitcher";
import {
    DEFAULT_MODULE,
    MODULES,
    SELECTED_MODULE_STORAGE_KEY,
    getModuleFromPath,
} from "./components/NavBar/modules";
import { usePermissions } from "@/context/PermissionContext";
import ZoomButtons from "./components/zoom/ZoomButton";
import { ROUTES } from "@/constants/routes";

const Header = () => {
    const { userData } = usePermissions();
    const pathname = usePathname();
    const [selectedModule, setSelectedModule] = useState(DEFAULT_MODULE);

    // Keep the module in sync with whatever page is actually open (typed URL,
    // pasted link, browser back/forward) instead of trusting stale state.
    // Fall back to the last-picked module from localStorage only when the
    // current path doesn't belong to any module.
    useEffect(() => {
        const fromPath = getModuleFromPath(pathname);
        if (fromPath) {
            setSelectedModule(fromPath);
            localStorage.setItem(SELECTED_MODULE_STORAGE_KEY, fromPath);
            return;
        }
        const stored = localStorage.getItem(SELECTED_MODULE_STORAGE_KEY);
        if (stored && MODULES.some((m) => m.key === stored)) {
            setSelectedModule(stored);
        }
    }, [pathname]);

    const handleModuleSelect = (key) => {
        setSelectedModule(key);
        localStorage.setItem(SELECTED_MODULE_STORAGE_KEY, key);
    };

    if (!userData) {
        return null;
    }

    return (
        <>
            <div className="h-14"></div>
            <header className="fixed top-0 left-0 w-full z-50 bg-gray-800 text-white shadow">
                <div className="flex justify-between items-center p-4 h-14">

                    {/* CLICKABLE TITLE - FULL REFRESH */}
                    <div className="flex items-center gap-4">
                        <div
                            className="text-lg font-bold cursor-pointer hover:text-orange-300 transition"
                            onClick={() => (window.location.href = ROUTES.customers.billing.pcdClosure.root)}
                        >
                            Netra Account
                        </div>
                        <ModuleSwitcher selectedModule={selectedModule} onSelect={handleModuleSelect} />
                        <div
                            className="text-lg font-bold cursor-pointer hover:text-orange-300 transition" >
                           <ZoomButtons variant="inline" show={1} />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex-1 flex justify-center">
                            <Navbar selectedModule={selectedModule} />
                        </div>
                        <div>
                            <Profile />
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
