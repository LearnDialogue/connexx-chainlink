import { useEffect, useState } from 'react';
import ReactSlider from 'react-slider';
import '../styles/components/multi-ranged-slider.css';

/*
interface MultirangedSliderProps {
  onChange: (value: number[]) => void;
  //Passes default 0,0 before this change
  defaultValues: number[];
}
*/
 interface MultirangedSliderProps {
  onChange: (value: number[]) => void;
  defaultValues: number[];
  min?: number;
  max?: number;
  step?: number;
  minDistance?: number;
}


// function MultirangedSlider({ onChange, defaultValues }: MultirangedSliderProps) 
function MultirangedSlider({
  onChange,
  defaultValues,
  min = 0.5,
  max = 7,
  step = 0.1,
  minDistance = 0.5,
}: MultirangedSliderProps)
{
  const [value, setValue] = useState<number[]>(defaultValues);

  useEffect(() => {
    if (defaultValues && defaultValues.length === 2) {
      setValue(defaultValues);
    } else {
      console.error('Invalid default values for MultirangedSlider');
    }
  }, [defaultValues]);

  const handleChange = (value: number[]) => {
    if (value && value.length === 2) {
      setValue(value);
      onChange(value);
    } else {
      console.error('Invalid value for MultirangedSlider');
    }
  }

  return (
    <div className='MultiRangedSlider'>
      <ReactSlider
        className="horizontal-slider"
        thumbClassName="example-thumb"
        trackClassName="example-track"
        value={value}
        /*
        max={7}
        min={.5}
        step={.1}
        minDistance={.5}
        */
        max={max}
        min={min}
        step={step}
        minDistance={minDistance}
        pearling
        onChange={handleChange}
        renderTrack={(props, state) => (
        <div {...props} 
          key = {state.index}
          className={`example-track ${state.index === 1 ? 'example-track-active' : ''}`}
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