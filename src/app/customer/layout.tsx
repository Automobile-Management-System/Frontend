"use client";

import React from "react";
import Navbar from "../../../components/customer/navbar";
import Footer from "../../../components/common/footer";


interface CustomerLayoutProps {
  children: React.ReactNode;
}

const layout: React.FC<CustomerLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header>
        <Navbar />
      </header>

      {/* Main content area */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Footer */}
      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
};

export default layout;
