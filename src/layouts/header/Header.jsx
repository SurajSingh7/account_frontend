"use client";

import React, { useState } from "react";
import { Profile } from "./components/Profile";
import { Navbar } from "./components/NavBar/Navbar";
import { ModuleSwitcher } from "./components/NavBar/ModuleSwitcher";
import { DEFAULT_MODULE } from "./components/NavBar/modules";
import { usePermissions } from "@/context/PermissionContext";
import ZoomButtons from "./components/zoom/ZoomButton";
import { ROUTES } from "@/constants/routes";

const Header = () => {
    const { userData } = usePermissions();
    const [selectedModule, setSelectedModule] = useState(DEFAULT_MODULE);

    if (!userData) {
        return null;
    }

    return (
        <>
            <div className="h-14"></div>
            <header className="fixed top-0 left-0 w-full z-50 bg-gray-800 text-white shadow">
                <div className="flex justify-between items-center p-4 h-14">

                    {/* CLICKABLE TITLE - FULL REFRESH */}
                    <div className="flex gap-2">
                        <div
                            className="text-lg font-bold cursor-pointer hover:text-orange-300 transition"
                            onClick={() => (window.location.href = ROUTES.customers.billing.pcdClosure.root)}
                        >
                            Netra Account
                        </div>
                        <ModuleSwitcher selectedModule={selectedModule} onSelect={setSelectedModule} />
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
