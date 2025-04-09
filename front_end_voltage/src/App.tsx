import React from 'react';
import logo from './logo.svg';
import './App.css';
import Chart1 from './chart1';
import ImageDisplay from './displayImage';

function App() {
  return (
    <div>
      <h1>Azure Application</h1>
      <Chart1 />
      {/* <ImageDisplay fileName="voltage_chart.png" /> */}
    </div>
  );
}

export default App;
