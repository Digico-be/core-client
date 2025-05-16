'use client'

import React from 'react'
import { jsPDF } from 'jspdf'

interface Props {
    content: string
}

const ExportReportButton: React.FC<Props> = ({ content }) => {
    const exportToPdf = () => {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        })

        const lines = pdf.splitTextToSize(content, 180) // wrap long lines to fit page width
        pdf.setFont('Courier', 'normal') // monospace for alignment
        pdf.setFontSize(10)
        pdf.text(lines, 10, 20)

        pdf.save('rapport.pdf')
    }

    return (
        <button
            onClick={exportToPdf}
            className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 transition"
            title="Exporter en PDF"
        >
            📄 Télécharger
        </button>
    )
}

export default ExportReportButton
