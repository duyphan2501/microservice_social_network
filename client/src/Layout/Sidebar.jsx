import { Outlet } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="flex ">
      <nav className="w-20 border-r border-gray-300 fixed inset-0">
        sidebar
      </nav>
      <main className="ml-20 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Sidebar;
