import React, { useState } from "react";
import { Outlet } from "react-router-dom";

// Navigation Item Component
const NavItem = ({
  icon,
  label,
  isActive = false,
  isCollapsed,
  href = "#",
}) => {
  return (
    <a
      href={href}
      className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors ${
        isActive ? "font-bold" : "font-normal"
      }`}
    >
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      {!isCollapsed && <span className="text-base">{label}</span>}
    </a>
  );
};

// Sidebar Component
const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005Z" />
        </svg>
      ),
      label: "Home",
      isActive: true,
      href: "/",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="10.5" cy="10.5" r="7.5" />
          <line x1="21" y1="21" x2="15.8" y2="15.8" />
        </svg>
      ),
      label: "Search",
      href: "/search",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <line x1="21.17" y1="8" x2="12" y2="8" />
          <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
          <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
        </svg>
      ),
      label: "Explore",
      href: "/explore",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
      label: "Reels",
      href: "/reels",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      label: "Messages",
      href: "/direct/inbox",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      label: "Notifications",
      href: "/notifications",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
      label: "Create",
      href: "/create",
    },
    {
      icon: (
        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      ),
      label: "Profile",
      href: "/profile",
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } border-r border-gray-200 bg-white transition-all duration-300 flex-col fixed h-full z-50 hidden lg:flex`}
      >
        {/* Logo */}
        <div className="h-24 flex items-center px-6 border-b border-gray-200">
          {isCollapsed ? (
            <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 0C10.7 0 0 10.7 0 24s10.7 24 24 24 24-10.7 24-24S37.3 0 24 0zm0 43.2C13.4 43.2 4.8 34.6 4.8 24S13.4 4.8 24 4.8 43.2 13.4 43.2 24 34.6 43.2 24 43.2z"
                fill="currentColor"
              />
              <circle cx="24" cy="24" r="6" fill="currentColor" />
            </svg>
          ) : (
            <h1
              className="text-2xl font-semibold"
              style={{ fontFamily: "Brush Script MT, cursive" }}
            >
              PhanNhutDuy
            </h1>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item, index) => (
            <NavItem
              key={index}
              icon={item.icon}
              label={item.label}
              isActive={item.isActive}
              isCollapsed={isCollapsed}
              href={item.href}
            />
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-200 space-y-1">
          <NavItem
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            }
            label="More"
            isCollapsed={isCollapsed}
            href="/settings"
          />

          <NavItem
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            }
            label="Also from Meta"
            isCollapsed={isCollapsed}
            href="/meta"
          />

          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {isCollapsed ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              )}
            </div>
            {!isCollapsed && <span className="text-base">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 overflow-auto bg-gray-50 pb-16 lg:pb-0 transition-all duration-300 ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-40">
        {[0, 1, 2, 3, 6, 7].map((index) => (
          <a
            key={index}
            href={navItems[index].href}
            className="flex items-center justify-center w-12 h-12"
          >
            <div className="w-6 h-6">{navItems[index].icon}</div>
          </a>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
