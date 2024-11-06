import React, { useState } from "react";
import Slider from "rc-slider";
import "./styles.css";
import "rc-slider/assets/index.css";

function App() {
  const [value, setValue] = useState([]);

  const marks = {
    0: 0,
    100000: {
      style: {
        color: "red",
        fontSize: "20px",
      },
      label: 100000,
    },
  };

  const SliderToolTip = ({ children }) => {
    const themeToolTip = {
      color: "blue",
      fontSize: "0.8125rem",
      whiteSpace: "nowrap",
      position: "relative",
      bottom: "100%",
      transform: "translate(-50%, -10px)",
    };

    return <div style={themeToolTip}>{children}</div>;
  };

  return (
    <div className="App">
      <h1>Slider</h1>
      <div className="slider">
        <Slider
          range
          min={0}
          max={100000}
          step={50}
          marks={marks}
          onChange={(newValue) => setValue(newValue)}
          handleRender={(renderProps) => {
            return (
              <div {...renderProps.props}>
                <SliderToolTip>{value}</SliderToolTip>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

export default App;