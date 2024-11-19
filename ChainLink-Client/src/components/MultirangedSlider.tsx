import { useState } from 'react';
import ReactSlider from 'react-slider';
import '../styles/components/multi-ranged-slider.css';

interface MultirangedSliderProps {
  onChange: (value: number[]) => void;
}


function MultirangedSlider({ onChange}: MultirangedSliderProps) {
  const [value, setValue] = useState<number[]>([.5, 7]);

  const handleChange = (value: number[]) => {
    setValue(value);
    onChange(value);
  };

  return (
    <div className='MultiRangedSlider'>
      <ReactSlider
        className="horizontal-slider"
        thumbClassName="example-thumb"
        trackClassName="example-track"
        defaultValue={[.5, 7]}
        max={7}
        min={.5}
        step={.1}
        pearling
        minDistance={.5}
        onChange={handleChange}
        renderTrack={(props, state) => (
        <div {...props} className={`example-track ${state.index === 1 ? 'example-track-active' : ''}`}
        />)}
      />
      <div className='slider-values'>
        <div className='labels'>
          <span>Min: {value[0]}</span>
          <span>Max: {value[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default MultirangedSlider;