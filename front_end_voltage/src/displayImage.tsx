import React, { useState, useEffect } from "react";

const ImageDisplay: React.FC<{ fileName: string }> = ({ fileName }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(
          `http://localhost:7094/api/image/${fileName}`
        );
        
        if (!response.ok) throw new Error("Image not found");

        const data = await response.json();
        setImageUrl(data.url);
      } catch (err) {
        setError("Failed to load image");
        console.error(err);
      }
    };

    fetchImage();
  }, [fileName]);

  return (
    <div>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : imageUrl ? (
        <img src={imageUrl} alt="Fetched from Azure" style={{ maxWidth: "100%" }} />
      ) : (
        <p>Loading image...</p>
      )}
    </div>
  );
};

export default ImageDisplay;
