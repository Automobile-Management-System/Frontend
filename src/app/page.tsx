// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { 
//   Calendar, 
//   Wrench, 
//   CreditCard, 
//   Bell, 
//   BarChart3, 
//   Users,
//   Clock,
//   Shield,
//   Sparkles
// } from "lucide-react";

// const Home = () => {
//   const features = [
//     {
//       icon: Calendar,
//       title: "Easy Booking",
//       description: "Schedule appointments online with real-time availability"
//     },
//     {
//       icon: Wrench,
//       title: "Service Tracking",
//       description: "Track your vehicle service progress in real-time"
//     },
//     {
//       icon: CreditCard,
//       title: "Secure Payments",
//       description: "Integrated payment system with digital receipts"
//     },
//     {
//       icon: Bell,
//       title: "Smart Notifications",
//       description: "Get instant updates via SMS, email, and in-app alerts"
//     },
//     {
//       icon: BarChart3,
//       title: "Analytics Dashboard",
//       description: "Comprehensive reports and insights for admins"
//     },
//     {
//       icon: Users,
//       title: "Multi-User Support",
//       description: "Separate portals for customers, employees, and admins"
//     },
//     {
//       icon: Clock,
//       title: "Time Management",
//       description: "Employee time tracking and workload optimization"
//     },
//     {
//       icon: Shield,
//       title: "Secure & Reliable",
//       description: "Enterprise-grade security and data protection"
//     },
//     {
//       icon: Sparkles,
//       title: "AI Assistant",
//       description: "24/7 AI chatbot for instant customer support"
//     }
//   ];

//   const userTypes = [
//     {
//       title: "Customers",
//       description: "Book appointments, track services, and manage your vehicle maintenance all in one place.",
//       features: ["Online Booking", "Service History", "Real-time Updates", "Digital Payments"],
//       color: "primary"
//     },
//     {
//       title: "Employees",
//       description: "Manage workload, log time, and update service progress with our intuitive workspace.",
//       features: ["Time Logging", "Task Management", "Progress Updates", "Schedule View"],
//       color: "accent"
//     },
//     {
//       title: "Administrators",
//       description: "Full system control with advanced analytics and comprehensive user management.",
//       features: ["User Management", "Reports & Analytics", "Service Management", "System Settings"],
//       color: "info"
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-subtle">
//       {/* Hero Section */}
//       <section className="pt-32 pb-20 px-4">
//         <div className="container mx-auto">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <div className="animate-slide-up">
//               <h1 className="mb-6">
//                 Modern Automobile
//                 <br />
//                 <span className="text-gradient-primary">Service Management</span>
//               </h1>
//               <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
//                 Streamline your automotive service operations with our comprehensive platform. 
//                 Perfect for service centers, repair shops, and vehicle modification specialists.
//               </p>
//               <div className="flex flex-wrap gap-4">
//                 <Link to="/auth">
//                   <Button variant="hero" size="lg">
//                     Get Started Free
//                   </Button>
//                 </Link>
//                 <Link to="/features">
//                   <Button variant="outline" size="lg">
//                     Learn More
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//             <div className="animate-fade-in">
//               <div className="relative">
//                 <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-full"></div>
//                 <img 
//                   src={heroImage} 
//                   alt="Professional automotive service" 
//                   className="relative rounded-2xl shadow-lg w-full h-auto"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Grid */}
//       <section className="py-20 px-4 bg-card/50">
//         <div className="container mx-auto">
//           <div className="text-center mb-16 animate-slide-up">
//             <h2 className="mb-4">Powerful Features</h2>
//             <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
//               Everything you need to manage your automotive service business efficiently
//             </p>
//           </div>
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {features.map((feature, index) => (
//               <Card 
//                 key={index} 
//                 className="transition-smooth hover:shadow-lg hover:-translate-y-1 animate-scale-in border-border/50"
//                 style={{ animationDelay: `${index * 0.1}s` }}
//               >
//                 <CardHeader>
//                   <div className="gradient-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
//                     <feature.icon className="h-6 w-6 text-primary-foreground" />
//                   </div>
//                   <CardTitle>{feature.title}</CardTitle>
//                   <CardDescription>{feature.description}</CardDescription>
//                 </CardHeader>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* User Types Section */}
//       <section className="py-20 px-4">
//         <div className="container mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="mb-4">Built for Everyone</h2>
//             <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
//               Tailored experiences for each type of user
//             </p>
//           </div>
//           <div className="grid md:grid-cols-3 gap-8">
//             {userTypes.map((userType, index) => (
//               <Card 
//                 key={index}
//                 className="transition-smooth hover:shadow-xl hover:-translate-y-2"
//               >
//                 <CardHeader>
//                   <CardTitle className="text-2xl">{userType.title}</CardTitle>
//                   <CardDescription className="text-base">
//                     {userType.description}
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <ul className="space-y-2">
//                     {userType.features.map((feat, i) => (
//                       <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
//                         <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
//                         {feat}
//                       </li>
//                     ))}
//                   </ul>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Home;


"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Calendar, 
  Wrench, 
  CreditCard, 
  Bell, 
  BarChart3, 
  Users,
  Clock,
  Shield,
  Sparkles
} from "lucide-react";
import heroImage from "../../public/hero.png"; 

import { Navbar } from "../../components/common/navbar";
import { Footer } from "../../components/common/footer";

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Schedule appointments online with real-time availability"
    },
    {
      icon: Wrench,
      title: "Service Tracking",
      description: "Track your vehicle service progress in real-time"
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Integrated payment system with digital receipts"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get instant updates via SMS, email, and in-app alerts"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security and data protection"
    },
    {
      icon: Sparkles,
      title: "AI Assistant",
      description: "24/7 AI chatbot for instant customer support"
    }
  ];

  const userTypes = [
    {
      title: "Customers",
      description: "Book appointments, track services, and manage your vehicle maintenance all in one place.",
      features: ["Online Booking", "Service History", "Real-time Updates", "Digital Payments"],
      color: "primary"
    },
    {
      title: "Employees",
      description: "Manage workload, log time, and update service progress with our intuitive workspace.",
      features: ["Time Logging", "Task Management", "Progress Updates", "Schedule View"],
      color: "accent"
    },
    {
      title: "Administrators",
      description: "Full system control with advanced analytics and comprehensive user management.",
      features: ["User Management", "Reports & Analytics", "Service Management", "System Settings"],
      color: "info"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar/>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h1 className="mb-6 text-6xl font-semibold">
                Modern Automobile
                <br />
                <span className="text-blue-800">Service Management</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Streamline your automotive service operations with our comprehensive platform. 
                Perfect for service centers, repair shops, and vehicle modification specialists.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login">
                  <Button variant="outline" size="lg" className="bg-blue-900 text-white hover:bg-blue-600 hover:text-white">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
            <div className="animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-full"></div>
                <img 
                  src={heroImage.src} 
                  alt="Professional automotive service" 
                  className="relative rounded-2xl shadow-lg w-full h-[300px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="mb-4 text-4xl font-semibold">Powerful Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to manage your automotive service business efficiently
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="transition-smooth hover:shadow-lg hover:-translate-y-1 animate-scale-in border-border/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-800" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4">Built for Everyone</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tailored experiences for each type of user
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((userType, index) => (
              <Card 
                key={index}
                className="transition-smooth hover:shadow-xl hover:-translate-y-2"
              >
                <CardHeader>
                  <CardTitle className="text-2xl">{userType.title}</CardTitle>
                  <CardDescription className="text-base">
                    {userType.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {userType.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full"></div>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
};

export default Home;
