"use client";

import React from "react";
import { Shield, Users, Wrench, Sparkles, Target, Heart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Navbar } from "../../../components/common/navbar";
import { Footer } from "../../../components/common/footer";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Trust & Reliability",
      description: "We ensure top-notch security and transparent service operations."
    },
    {
      icon: Users,
      title: "Customer-Centric",
      description: "Our customers are at the heart of everything we build and improve."
    },
    {
      icon: Wrench,
      title: "Innovation in Service",
      description: "We continuously adopt new technologies to enhance service delivery."
    },
    {
      icon: Sparkles,
      title: "AI-Driven Solutions",
      description: "Leveraging AI to simplify processes and enhance decision-making."
    },
    {
      icon: Target,
      title: "Mission Focused",
      description: "We aim to revolutionize the automobile service experience through smart automation."
    },
    {
      icon: Heart,
      title: "Passion for Excellence",
      description: "We believe that every vehicle deserves the best care, every time."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* About Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto text-center animate-slide-up">
          <h1 className="text-5xl font-semibold mb-6">
            About <span className="text-blue-800">Our Platform</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We are a team of innovators dedicated to transforming the automobile service industry. 
            Our mission is to create a seamless, transparent, and technology-driven service management experience 
            for customers and service providers alike.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start animate-slide-up">
            {/* Mission */}
            <div className="p-6 bg-white rounded-xl hover:shadow-md transition-smooth">
              <h2 className="text-4xl font-semibold mb-4 text-blue-800">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our mission is to streamline vehicle servicing operations and make them smarter, 
                faster, and more reliable. By integrating modern technologies, we empower service centers 
                and customers to stay connected, informed, and satisfied every step of the way.
              </p>
            </div>

            {/* Vision */}
            <div className="p-6 bg-white rounded-xl hover:shadow-md transition-smooth">
              <h2 className="text-4xl font-semibold mb-4 text-blue-800">Our Vision</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To become the leading digital ecosystem for automobile services — where efficiency, 
                transparency, and innovation redefine customer experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-semibold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The principles that guide our innovation, teamwork, and commitment to excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card
                key={index}
                className="transition-smooth hover:shadow-lg hover:-translate-y-1 animate-scale-in border-border/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-blue-100 text-blue-800">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{value.title}</CardTitle>
                  <CardDescription>{value.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>   
      <Footer />
    </div>
  );
};

export default About;
