"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";

interface QrScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export function QrScanner({ onScan, onClose }: QrScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Initialize Scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                scanner.clear();
                onScan(decodedText);
            },
            (errorMessage) => {
                // Parse error, ignore common errors
                console.log(errorMessage);
            }
        );

        scannerRef.current = scanner;

        // Cleanup on unmount
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Scan QR / Barcode</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="p-6 bg-white">
                    <div id="reader" className="w-full h-auto border rounded-lg overflow-hidden"></div>
                    <p className="text-center text-sm text-gray-500 mt-4">
                        Point camera at a QR code or Barcode to search.
                    </p>
                </div>
            </div>
        </div>
    );
}
