import Hero from "@/features/home/Hero";
import Banner from "@/features/home/Banner";
import Inventory from "@/features/home/Inventory";
import CarVideo from "@/features/home/CarVideo";
import Aboutx from "./Aboutx";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section id="hero" className="min-h-screen">
        <Hero />
      </section>
      
      {/* Video/Experience Section */}
      <section id="video" className="min-h-screen">
        <CarVideo />
      </section>
      
      {/* Cars/Inventory Section */}
      <section id="inventory" className="min-h-screen">
        <Inventory />
      </section>
      
      {/* About Us Section */}
      <section id="about" className="min-h-screen">
        <Aboutx />
      </section>
      
      {/* Contact/Banner Section */}
      <section id="contact" className="min-h-screen">
        <Banner />
      </section>
    </div>
  );
}
