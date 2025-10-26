import React from "react";
import { CustomerNavbar } from "../../../components/customer/navbar";
import { CustomerFooter } from "../../../components/customer/footer";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const layout: React.FC<CustomerLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header>
        <CustomerNavbar />
      </header>

      {/* Main content area */}
      <main className="flex-grow container mx-auto px-4 py-6">{children}</main>

      {/* Bottom Footer */}
      <footer className="mt-auto">
        <CustomerFooter />
      </footer>
    </div>
  );
};

export default layout;
