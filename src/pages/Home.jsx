import React from "react";
import HeroSection from "@/components/home/HeroSection";
import ConceptCards from "@/components/home/ConceptCards";
import ExperimentNav from "@/components/home/ExperimentNav";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ConceptCards />
      <ExperimentNav />
    </div>
  );
}