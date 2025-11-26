import React from 'react';
import TestimonialCard from './TestimonialCard';

const testimonials = [
    {
        author: {
            name: "Emma Thompson",
            handle: "@emmaai",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
        },
        text: "Using this AI platform has transformed how we handle data analysis. The speed and accuracy are unprecedented.",
        href: "https://twitter.com/emmaai"
    },
    {
        author: {
            name: "David Park",
            handle: "@davidtech",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        },
        text: "The API integration is flawless. We've reduced our development time by 60% since implementing this solution.",
        href: "https://twitter.com/davidtech"
    },
    {
        author: {
            name: "Sofia Rodriguez",
            handle: "@sofiaml",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
        },
        text: "Finally, an AI tool that actually understands context! The accuracy in natural language processing is impressive."
    }
];

const Testimonials = () => {
    return (
        <section className="testimonials-section">
            <div className="testimonials-container">
                <div className="testimonials-header">
                    <h2>Trusted by developers worldwide</h2>
                    <p>Join thousands of developers who are already building the future with our AI platform</p>
                </div>

                <div className="marquee-wrapper">
                    <div className="marquee-track">
                        {/* Repeat 4 times for smooth infinite scroll */}
                        {[...Array(4)].map((_, setIndex) => (
                            <div key={setIndex} className="marquee-group">
                                {testimonials.map((testimonial, i) => (
                                    <TestimonialCard
                                        key={`${setIndex}-${i}`}
                                        {...testimonial}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="marquee-gradient-left"></div>
                    <div className="marquee-gradient-right"></div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
