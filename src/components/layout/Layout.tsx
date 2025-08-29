import { Outlet } from "react-router";
import { ThemeToggle } from "../common/ThemeToggle";

const Layout = () => {
  return (
    <div className="min-h-screen">
      <nav>
        <ThemeToggle />
      </nav>
      <main className="bg-background h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
