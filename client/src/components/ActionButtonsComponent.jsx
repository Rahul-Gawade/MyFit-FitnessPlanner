import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ActionButtonsComponent = ({ resultRef }) => {
  const downloadPDF = async () => {
    const input = resultRef.current;
    if (!input) return;

    try {
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Additional pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("MyFit_Plan.pdf");
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Error downloading PDF");
    }
  };

  const speakResult = () => {
    if (!resultRef.current) return;
    const text = resultRef.current.innerText;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  const pauseSpeech = () => window.speechSynthesis.pause();
  const resumeSpeech = () => window.speechSynthesis.resume();
  const stopSpeech = () => window.speechSynthesis.cancel();

  return (
    <div className="action-buttons-container">
      <div className="button-group">
        <button className="speech-button" onClick={speakResult}>
          🔊 Read Full Plan
        </button>
        <button className="speech-button" onClick={pauseSpeech}>
          ⏸ Pause
        </button>
        <button className="speech-button" onClick={resumeSpeech}>
          ▶ Resume
        </button>
        <button className="speech-button" onClick={stopSpeech}>
          ⏹ Stop
        </button>
      </div>
      <div className="button-group">
        <button className="speech-button pdf-button" onClick={downloadPDF}>
          📄 Download PDF
        </button>
      </div>
    </div>
  );
};

export default ActionButtonsComponent;
