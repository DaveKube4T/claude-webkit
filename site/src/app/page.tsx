import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Nosotros from "@/components/Nosotros";
import Especialidades from "@/components/Especialidades";
import SocialProof from "@/components/SocialProof";
import CTA from "@/components/CTA";
import Location from "@/components/Location";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Nosotros />
        <Especialidades />
        <SocialProof />
        <CTA />
        <Location />
      </main>
      <Footer />
    </>
  );
}
