export const dynamic = 'force-dynamic';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Roles from "@/components/Roles";
import Features from "@/components/Features";
import Flow from "@/components/Flow";
import Transparency from "@/components/Transparency";
import Testimonial from "@/components/Testimonial";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="top">
        <Hero />
        <Stats />
        <Roles />
        <Features />
        <Flow />
        <Transparency />
        <Testimonial />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
