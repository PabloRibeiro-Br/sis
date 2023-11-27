import React from 'react';
import { Document, Page } from 'react-pdf';

const PdfViewer = () => {
  const pdfUrl = 'https://drive.google.com/file/d/1KoBp42wbd2gukMxdlb-9oqHs3BleBcgN/view?usp=sharing';

  return (
    <div>
      <Document file={pdfUrl} onLoadSuccess={console.log}>
        <Page pageNumber={1} />
      </Document>
    </div>
  );
};

export default PdfViewer;
