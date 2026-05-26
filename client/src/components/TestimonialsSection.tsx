export default function TestimonialsSection() {
    return (
        <section className="py-12 bg-slate-50">
            <div className="container">
                <h2 className="text-3xl font-bold text-center mb-8">What Our Guests Say</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                            <p className="text-slate-600 mb-4">
                                "Absolutely amazing experience. The apartment was stunning and the service was top-notch."
                            </p>
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-slate-200 rounded-full mr-3"></div>
                                <div>
                                    <p className="font-semibold">John Doe</p>
                                    <p className="text-sm text-slate-500">Verified Guest</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
