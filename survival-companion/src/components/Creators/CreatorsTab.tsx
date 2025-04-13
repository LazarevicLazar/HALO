import React, { useState } from "react";
import "./Creators.css";

const CreatorsTab: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const creators = [
    {
      name: "Waratchaya Luangphairin",
      email: "waratchaya@usf.edu",
      linkedin: "https://www.linkedin.com/in/wluangphairin/",
      major: "Electrical Engineering",
      position: "left",
    },
    {
      name: "Johan John Joji",
      email: "johanjohnjoji@usf.edu",
      linkedin: "https://www.linkedin.com/in/johanjjoji/",
      major: "Computer Engineering",
      position: "middle",
    },
    {
      name: "Lazar Lazarevic",
      email: "lazarlazarevic@usf.edu",
      linkedin: "https://www.linkedin.com/in/lazarl/",
      major: "Computer Engineering",
      position: "right",
    },
  ];

  return (
    <div className="card">
      <h2 className="creators-title">Meet the Creators</h2>

      <div className="creators-container">
        {/* Team Photo */}
        <div className="team-photo">
          <img src="/assets/images/Spy_Pose.png" alt="The Creators Team" />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "2rem 1.5rem 1rem",
              background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
              zIndex: 2,
            }}
          >
            <h3
              style={{
                margin: 0,
                color: "#fff",
                fontSize: "1.5rem",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              The Survivors
            </h3>
            <p
              style={{
                margin: "0.5rem 0 0",
                color: "rgba(255,255,255,0.8)",
                fontSize: "0.9rem",
              }}
            >
              University of South Florida - Engineering
            </p>
          </div>
        </div>

        {/* Team Description */}
        <div className="team-description">
          <h3>About the Team</h3>
          <p>
            We are a team of passionate engineers from the University of South
            Florida who created this Survival Companion app as part of our
            senior design project. Our goal was to develop a useful tool that
            combines practical survival information with interactive features to
            help users navigate post-apocalyptic scenarios.
          </p>
          <p>
            Each team member brought unique skills and perspectives to the
            project, resulting in a comprehensive application that addresses
            various survival needs. From inventory management to interactive
            maps and AI-powered assistance, we've worked to create a tool that
            would be genuinely useful in challenging situations.
          </p>
        </div>

        {/* Creator Cards */}
        <div className="creators-grid">
          {creators.map((creator, index) => (
            <div
              key={index}
              className="creator-card"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Position Indicator */}
              <div className="position-badge">{creator.position}</div>

              {/* Creator Name */}
              <h3 className="creator-name">{creator.name}</h3>

              {/* Major */}
              <div className="creator-major">{creator.major}</div>

              {/* Contact Info */}
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">✉️</span>
                  <a href={`mailto:${creator.email}`} className="contact-link">
                    {creator.email}
                  </a>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">🔗</span>
                  <a
                    href={creator.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-link"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              </div>

              {/* Decorative Elements */}
              <div
                style={{
                  position: "absolute",
                  bottom: "15px",
                  right: "15px",
                  width: "30px",
                  height: "30px",
                  borderRight: "2px solid var(--accent-color)",
                  borderBottom: "2px solid var(--accent-color)",
                  opacity: hoveredCard === index ? 1 : 0.3,
                  transition: "opacity 0.3s ease",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "15px",
                  left: "15px",
                  width: "30px",
                  height: "30px",
                  borderLeft: "2px solid var(--accent-color)",
                  borderTop: "2px solid var(--accent-color)",
                  opacity: hoveredCard === index ? 1 : 0.3,
                  transition: "opacity 0.3s ease",
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            padding: "1rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            color: "var(--text-color)",
            fontSize: "0.9rem",
            opacity: 0.7,
          }}
        >
          <p>© 2025 USF Engineering Team - All Rights Reserved</p>
          <p>
            Created with passion and dedication for the post-apocalyptic
            survival community
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreatorsTab;
