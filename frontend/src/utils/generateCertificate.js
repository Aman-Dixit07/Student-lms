import jsPDF from "jspdf";

export const generateCertificate = (studentName, courseName) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, 297, 210, "F");

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(3);
  doc.rect(15, 15, 267, 180);

  doc.setLineWidth(1);
  doc.rect(20, 20, 257, 170);

  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("Certificate of Completion", 148.5, 55, { align: "center" });

  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.line(80, 62, 217, 62);

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  doc.text("This is to certify that", 148.5, 80, { align: "center" });

  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(studentName, 148.5, 100, { align: "center" });

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  const nameWidth = doc.getTextWidth(studentName);
  doc.line(148.5 - nameWidth / 2, 103, 148.5 + nameWidth / 2, 103);

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  doc.text("has successfully completed the course", 148.5, 118, {
    align: "center",
  });

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text(courseName, 148.5, 138, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Issued on: ${date}`, 148.5, 165, { align: "center" });

  doc.setFontSize(10);
  doc.text("LearnNicely - Online Learning Platform", 148.5, 180, {
    align: "center",
  });

  const fileName = `Certificate_${courseName.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
};
