const pv = require('./build/viewer');
const pdfjs = pv.pdfjs;
var PdfjsWorker = require('worker-loader!pdfjs-dist/build/pdf.worker.js');

if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerPort = new PdfjsWorker();
}
module.exports = {PDFViewer: pv.PDFViewer};
