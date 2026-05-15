import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Architecture from "../components/Architecture";
import CodeExplorer from "../components/CodeExplorer";
import SnakeGame from "../components/SnakeGame";
import Team from "../components/Team";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Architecture />
        <CodeExplorer />
        <SnakeGame />
        <Team />
      </main>
      <Footer />
    </>
  );
}
