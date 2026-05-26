import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HeroSection() {
    return (
        <section className="relative h-[600px] flex items-center justify-center bg-slate-900 text-white overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop"
                    alt="Hero background"
                    className="w-full h-full object-cover opacity-50"
                />
            </div>
            <div className="container relative z-10 text-center space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                    Find Your Perfect Getaway
                </h1>
                <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto">
                    Experience luxury and comfort in our hand-picked apartments.
                </p>
                <Link to="/apartments">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Browse Apartments
                    </Button>
                </Link>
            </div>
        </section>
    );
}
