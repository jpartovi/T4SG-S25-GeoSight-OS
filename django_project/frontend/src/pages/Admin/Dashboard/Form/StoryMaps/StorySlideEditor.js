import React, { useState } from 'react';
import './style.scss';

// Component to edit or create a story slide
export default function StorySlideEditor({ existingSlide, onSave, onCancel, availableIndicators, indicatorLookup }) {
  // Initialize state from existing slide or defaults
  const [title, setTitle] = useState(existingSlide?.title || '');
  const [description, setDescription] = useState(existingSlide?.description || '');
  const [selectedIndicator, setSelectedIndicator] = useState(
    existingSlide?.checkpoint?.selected_indicator_layers?.[0] || ''
  );

  // Handle save button click
  const handleSave = () => {
    const checkpoint = indicatorLookup[selectedIndicator];

    if (!checkpoint) {
      alert('Selected indicator does not have a checkpoint');
      return;
    }

    // Construct the slide object and pass it to onSave callback
    const slide = {
      ...existingSlide,
      id: existingSlide?.id || Date.now().toString(),
      title,
      description,
      checkpoint
    };

    onSave(slide);
  };

  return (
    <div className="story-slide-editor">
      {/* Slide title input */}
      <label>Slide Title</label>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} />

      {/* Slide description input */}
      <label>Description</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} />

      {/* Indicator selection dropdown */}
      <label>Select Indicator</label>
      <select value={selectedIndicator} onChange={e => setSelectedIndicator(e.target.value)}>
        <option value="" disabled>Select one</option>
        {availableIndicators.map(ind => (
          <option key={ind.id} value={ind.id}>{ind.name}</option>
        ))}
      </select>

      {/* Save and cancel buttons */}
      <div className="actions">
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
