import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

    useEffect(() => {
        document.body.classList.remove("light-theme", "dark-theme");
        if (theme === "light") {
            document.body.classList.add("light-theme");
        } else if (theme === "dark") {
            document.body.classList.add("dark-theme");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}