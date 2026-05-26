import React, { createContext, useContext, useState } from 'react';

type LanguageContextType = {
    language: string;
    setLanguage: (lang: string) => void;
    t: {
        home: {
            welcome: {
                subtitle: string;
                title: string;
                description1: string;
                description2: string;
                learnMore: string;
            };
            booking: {
                subtitle: string;
                title: string;
                description: string;
                benefits: string[];
            };
            featuredApartments: {
                subtitle: string;
                title: string;
                description: string;
                viewAll: string;
            };
            amenities: {
                subtitle: string;
                title: string;
                description: string;
                features: {
                    beachfront: { title: string; description: string };
                    pools: { title: string; description: string };
                    restaurant: { title: string; description: string };
                    wifi: { title: string; description: string };
                    bar: { title: string; description: string };
                    location: { title: string; description: string };
                };
            };
            cta: {
                title: string;
                description: string;
                bookNow: string;
            };
        };
    };
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState('en');

    const t = {
        home: {
            welcome: {
                subtitle: "Welcome to Paradise",
                title: "Experience Luxury Living",
                description1: "Discover our premium apartments with breathtaking views.",
                description2: "Your perfect vacation starts here.",
                learnMore: "Learn More"
            },
            booking: {
                subtitle: "Book Your Stay",
                title: "Ready for a Vacation?",
                description: "Book your dream apartment today.",
                benefits: ["Best Price Guarantee", "Free Cancellation", "24/7 Support"]
            },
            featuredApartments: {
                subtitle: "Our Apartments",
                title: "Featured Stays",
                description: "Hand-picked luxury apartments for you.",
                viewAll: "View All Apartments"
            },
            amenities: {
                subtitle: "Amenities",
                title: "Everything You Need",
                description: "Enjoy top-class amenities during your stay.",
                features: {
                    beachfront: { title: "Beachfront", description: "Direct access to the beach" },
                    pools: { title: "Swimming Pools", description: "Infinity pools with a view" },
                    restaurant: { title: "Fine Dining", description: "Gourmet restaurants nearby" },
                    wifi: { title: "Free Wi-Fi", description: "High-speed internet access" },
                    bar: { title: "Bar & Lounge", description: "Relax with a drink" },
                    location: { title: "Prime Location", description: "Close to all attractions" }
                }
            },
            cta: {
                title: "Don't Wait, Book Now",
                description: "Secure your spot in paradise.",
                bookNow: "Book Now"
            }
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
