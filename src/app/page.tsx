// "use client";

// import React from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { 
//   Card, 
//   CardDescription, 
//   CardHeader, 
//   CardTitle 
// } from "@/components/ui/card";
// import { 
//   Calendar, 
//   Wrench, 
//   CreditCard, 
//   Bell, 
//   Shield,
//   Sparkles
// } from "lucide-react";
// import heroImage from "../../public/hero.png"; 

// import { Navbar } from "../../components/common/navbar";
// import { Footer } from "../../components/common/footer";

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
//     <div className="min-h-screen">
//       <Navbar/>
//       {/* Hero Section */}
//       <section className="pt-32 pb-20 px-4">
//         <div className="container mx-auto">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <div className="animate-slide-up">
//               <h1 className="mb-6 text-6xl font-semibold">
//                 Modern Automobile
//                 <br />
//                 <span className="text-blue-800">Service Management</span>
//               </h1>
//               <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
//                 Streamline your automotive service operations with our comprehensive platform. 
//                 Perfect for service centers, repair shops, and vehicle modification specialists.
//               </p>
//               <div className="flex flex-wrap gap-4">
//                 <Link href="/login">
//                   <Button variant="outline" size="lg" className="bg-blue-900 text-white hover:bg-blue-600 hover:text-white">
//                     Get Started
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//             <div className="animate-fade-in">
//               <div className="relative">
//                 <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-full"></div>
//                 <img 
//                   src={heroImage.src} 
//                   alt="Professional automotive service" 
//                   className="relative rounded-2xl shadow-lg w-full h-[300px] object-cover"
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
//             <h2 className="mb-4 text-4xl font-semibold">Powerful Features</h2>
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
//                   <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4">
//                     <feature.icon className="h-6 w-6 text-blue-800" />
//                   </div>
//                   <CardTitle>{feature.title}</CardTitle>
//                   <CardDescription>{feature.description}</CardDescription>
//                 </CardHeader>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       <Footer/>
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
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Calendar, 
  Wrench, 
  CreditCard, 
  Bell, 
  Shield,
  Sparkles,
  CheckCircle,
  Star
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

  const howToUseSteps = [
    {
      step: "1",
      title: "Sign Up / Login",
      description: "Create an account or log in to access all features."
    },
    {
      step: "2",
      title: "Book an Appointment",
      description: "Choose your service type, date, and time easily online."
    },
    {
      step: "3",
      title: "Track Service",
      description: "Monitor your vehicle’s service progress in real-time."
    },
    {
      step: "4",
      title: "Make Payment",
      description: "Securely pay online and receive a digital receipt."
    }
  ];

  const reviews = [
    {
      name: "John Doe",
      rating: 5,
      comment: "Excellent service! Booking was seamless and my car was ready on time."
    },
    {
      name: "Emma Stone",
      rating: 4,
      comment: "Great platform and very user-friendly. Loved the notifications feature."
    },
    {
      name: "Mike Johnson",
      rating: 5,
      comment: "AI assistant helped me resolve my queries instantly. Highly recommend!"
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
                    Get Started
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

      {/* How to Use Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="mb-4 text-4xl font-semibold">How to Use</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Follow these simple steps to get started with our platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howToUseSteps.map((step) => (
              <Card key={step.step} className="transition-smooth hover:shadow-lg hover:-translate-y-1 animate-scale-in border-border/50">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-100 text-blue-800">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="mb-4 text-4xl font-semibold">Customer Reviews</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See what our users have to say about our service
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <Card key={index} className="transition-smooth hover:shadow-lg hover:-translate-y-1 animate-scale-in border-border/50">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle>{review.name}</CardTitle>
                  <CardDescription>{review.comment}</CardDescription>
                </CardHeader>
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
