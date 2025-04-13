import React, { useState } from "react";
import "./Encyclopedia.css";
import encyclopediaData from "../../data/encyclopediaData";

// Define the encyclopedia data structure
interface EncyclopediaEntry {
  title: string;
  content: string;
  icon?: string;
}

interface EncyclopediaCategory {
  name: string;
  icon: string;
  description: string;
  entries: EncyclopediaEntry[];
}

// Component for displaying encyclopedia entries
const EncyclopediaTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(0);
  const [selectedEntry, setSelectedEntry] = useState<number | null>(0);

  return (
    <div className="card">
      <h2 className="card-title">Survival Encyclopedia</h2>
      <div className="encyclopedia-container">
        <div className="encyclopedia-categories">
          {encyclopediaData.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className={`encyclopedia-category ${
                selectedCategory === categoryIndex ? "selected" : ""
              }`}
              onClick={() => {
                setSelectedCategory(categoryIndex);
                setSelectedEntry(0); // Reset to first entry when changing categories
              }}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </div>
          ))}
        </div>

        {selectedCategory !== null && (
          <div className="encyclopedia-content">
            <div className="encyclopedia-entries">
              <h3>{encyclopediaData[selectedCategory].name}</h3>
              <p className="category-description">
                {encyclopediaData[selectedCategory].description}
              </p>
              <div className="entry-list">
                {encyclopediaData[selectedCategory].entries.map(
                  (entry, entryIndex) => (
                    <div
                      key={entryIndex}
                      className={`entry-item ${
                        selectedEntry === entryIndex ? "selected" : ""
                      }`}
                      onClick={() => setSelectedEntry(entryIndex)}
                    >
                      {entry.title}
                    </div>
                  )
                )}
              </div>
            </div>

            {selectedEntry !== null && (
              <div className="entry-content">
                <h3>
                  {
                    encyclopediaData[selectedCategory].entries[selectedEntry]
                      .title
                  }
                </h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      encyclopediaData[selectedCategory].entries[selectedEntry]
                        .content,
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Export the component
export default EncyclopediaTab;
