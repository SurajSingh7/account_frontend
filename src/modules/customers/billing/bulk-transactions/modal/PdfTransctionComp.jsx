"use client";

import React, { useMemo } from "react";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import { FileText, Loader2, Download, X } from "lucide-react";
import TransactionPdfDocument from "./TransactionPdfDocument";

const PdfTransctionComp = ({ open, onClose, loading, details }) => {
  const fileName = useMemo(() => {
    const company = details?.meta?.companyGroupId?.companyName || "transaction";
    const safeCompany = company.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const id = details?.meta?._id || "receipt";
    return `${safeCompany}-${id}.pdf`;
  }, [details]);

  const handleDownload = async () => {
    const confirmed = window.confirm("Do you want to download this PDF?");
    if (!confirmed || !details) return;

    try {
      const blob = await pdf(<TransactionPdfDocument details={details} />).toBlob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Failed to generate PDF.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
      />

      <div className="relative flex h-[94vh] w-full max-w-[1280px] flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-6 py-5">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-700">
              <FileText className="h-3.5 w-3.5" />
              PDF Preview
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Customer Receipt PDF
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Real PDF preview for download and customer sharing
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!loading && details ? (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#f4f5f7] p-4 sm:p-5">
          {loading ? (
            <div className="flex h-full items-center justify-center rounded-[24px] border border-gray-200 bg-white">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-100">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                </div>
                <p className="text-sm font-semibold text-gray-600">
                  Preparing PDF preview...
                </p>
              </div>
            </div>
          ) : !details ? (
            <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-white">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gray-100">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-500">
                  No PDF data available.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm">
              <PDFViewer width="100%" height="100%" showToolbar>
                <TransactionPdfDocument details={details} />
              </PDFViewer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfTransctionComp;