import {pdfjs, PDFViewer} from './src/viewer';

const PdfjsWorker = require('worker-loader!pdfjs-dist/build/pdf.worker.js');
pdfjs.GlobalWorkerOptions.workerPort = new PdfjsWorker();

export {PDFViewer}
