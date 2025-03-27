import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { Icon } from '@components/Icon'

type DropdownMenuContextType = {
    isOpen: boolean;
    toggleMenu: () => void;
    closeMenu: () => void;
};

const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(undefined);

type DropdownMenuProps = {
    children: ReactNode;
    className?: string;
};

export const DropdownMenu = ({ children, className = "" }: DropdownMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => setIsOpen((prev) => !prev);
    const closeMenu = () => setIsOpen(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                closeMenu();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <DropdownMenuContext.Provider value={{ isOpen, toggleMenu, closeMenu }}>
            <div className={`relative ${className}`} ref={menuRef} >
                <button
                    onClick={toggleMenu}
                    className="p-2 rounded hover:bg-gray-200 transition flex items-center justify-center"
                    aria-label="Ouvrir le menu"
                >
                    <Icon name="dots-vertical" className="w-5 h-5 text-gray-700" />
                </button>

                {isOpen && (
                    // z-50 sert à forcer l'affichage au-dessus des cards.
                    <div className="absolute right-0 mt-2 w-auto bg-white border border-gray-300 rounded shadow-md p-2 z-50">
                        <div className="flex flex-col space-y-1">{children}</div>
                    </div>
                )}
            </div>
        </DropdownMenuContext.Provider>
    );
};

type DropdownMenuItemProps = {
    children: ReactNode;
    onClick?: () => void;
};

const DropdownMenuItem = ({ children, onClick }: DropdownMenuItemProps) => {
    const context = useContext(DropdownMenuContext);
    if (!context) throw new Error("DropdownMenu.Item must be used within a DropdownMenu");

    const handleClick = () => {
        onClick?.();
        context.closeMenu();
    };

    return (
        <div
            onClick={handleClick}
            className="cursor-pointer block w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-100 transition"
        >
            {children}
        </div>
    );
};

DropdownMenu.Item = DropdownMenuItem;