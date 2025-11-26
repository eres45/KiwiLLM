import React from 'react';

const TestimonialCard = ({ author, text, href }) => {
    const Card = href ? 'a' : 'div';

    return (
        <Card
            href={href}
            className={`testimonial-card ${href ? 'clickable' : ''}`}
            target={href ? "_blank" : undefined}
            rel={href ? "noopener noreferrer" : undefined}
        >
            <div className="testimonial-header">
                <div className="testimonial-avatar">
                    <img src={author.avatar} alt={author.name} />
                </div>
                <div className="testimonial-info">
                    <h3>{author.name}</h3>
                    <p>{author.handle}</p>
                </div>
            </div>
            <p className="testimonial-text">{text}</p>
        </Card>
    );
};

export default TestimonialCard;
