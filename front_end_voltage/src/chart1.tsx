import React, { useEffect, useState, useRef  } from "react";
import ReactECharts from "echarts-for-react";


const Chart1: React.FC = () => {
  const [labels, setLabels] = useState<string[]>([]);
  const [voltageLevels, setVoltageLevels] = useState<number[]>([]);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data from API...");
  
      try {
        const response = await fetch("https://voltagedata20250309115248-d6fhath6b2gwfhhj.australiaeast-01.azurewebsites.net/api/Voltage/");
        
        // Check if the response is OK (status 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Received data:", data);  // Log entire response

        // Check that both labels and voltageLevels exist
        if (data.labels && data.voltageLevels) {
          setLabels(data.labels);  // Set the labels array
          setVoltageLevels(data.voltageLevels);  // Set the voltage levels array
        } else {
          throw new Error("API response missing 'labels' or 'voltageLevels'");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);


  
  const options = {
    title: { text: "Voltage Levels" },
    tooltip: {},
    xAxis: { type: "category", data: labels },
    yAxis: { type: "value" },
    series: [{ name: "Voltage", type: "bar", data: voltageLevels }]
  };

  const saveChartAsImage = () => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();
      const imgData = chartInstance.getDataURL({
        type: "png",
        pixelRatio: 2, // High resolution
        backgroundColor: "#ffffff"
      });

      // Create a temporary link and trigger the download
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "voltage_chart.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const saveChartInBlob = async () => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();
      const imgData = chartInstance.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: "#ffffff"
      });
  
      // Convert Base64 to Blob
      const blob = base64ToBlob(imgData, "image/png");

      const fileName = "Voltage_chart_"+Date.now().toString()+".png"
      const file = new File([blob], fileName, { type: "image/png" });
      
      // Upload the image to Azure
      await uploadToAzureFunction(file);
    }
  };
  
  // Convert Base64 to Blob
  const base64ToBlob = (base64: string, contentType: string) => {
    const byteCharacters = atob(base64.split(",")[1]); // Remove data URL prefix
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  };
  
  // Upload to Azure Function
  const uploadToAzureFunction = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const REACT_APP_FUNC_KEY = process.env.REACT_APP_FUNC_KEY;
      const response = await fetch(`https://functionapp120250324221850.azurewebsites.net/api/upload?code=${REACT_APP_FUNC_KEY}`, {
        method: "POST",
        body: formData
      });
  
      const result = await response.json();
      console.log("Azure Function Response:", result);
    } catch (error) {
      console.error("Error uploading image to Azure:", error);
    }
  };
  
  return(
    <div>
      <ReactECharts ref={chartRef} option={options} />
      <button onClick={saveChartAsImage}>Save Chart As Image</button> <br />
      <button onClick={saveChartInBlob} disabled={false}>Save Chart to Azure Blob</button>
    </div>
  ) ;
};

export default Chart1;
