'use client'

import React from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Props {
    targetId: string
}

export const ExportReportButton: React.FC<Props> = ({ targetId }) => {
    const exportToPdf = () => {
        const element = document.getElementById(targetId)
        if (!element) return

        const pdf = new jsPDF()
        let y = 10

        element.querySelectorAll('h1, h2, p, table').forEach((node) => {
            const tag = node.tagName.toLowerCase()
            const text = (node.textContent || '').replace(/[^             const text = (node.textContent || '').replace(/[^\x20-~            const text = (node.textContent || '').replace(/[^\x20-\x7EÀ-ÿ]/g, '') // nettoyer les caractères spéciaux non imprimables

            if (tag === 'h1') {
                pdf.setFontSize(16)
                pdf.setFont('helvetica', 'bold')
                pdf.text(text, 10, y)
                y += 10
            }

            if (tag === 'h2') {
                pdf.setFontSize(13)
                pdf.setFont('helvetica', 'bold')
                pdf.text(text, 10, y)
                y += 8
            }

            if (tag === 'p') {
                pdf.setFontSize(10)
                pdf.setFont('helvetica', 'normal')
                const lines = pdf.splitTextToSize(text, 180)
                pdf.text(lines, 10, y)
                y += lines.length * 5.5
            }

            if (tag === 'table') {
                const head: string[][] = []
                const body: string[][] = []

                node.querySelectorAll('thead tr').forEach((tr) => {
                    const row: string[] = []
                    tr.querySelectorAll('th').forEach((th) => row.push((th.textContent || '').replace(/[^                     tr.querySelectorAll('th').forEach((th) => row.push((th.textContent || '').replace(/[^\x20-~                    tr.querySelectorAll('th').forEach((th) => row.push((th.textContent || '').replace(/[^\x20-\x7EÀ-ÿ]/g, '')))
                    head.push(row)
                })

                node.querySelectorAll('tbody tr').forEach((tr) => {
                    const row: string[] = []
                    tr.querySelectorAll('td').forEach((td) => row.push((td.textContent || '').replace(/[^                     tr.querySelectorAll('td').forEach((td) => row.push((td.textContent || '').replace(/[^\x20-~                    tr.querySelectorAll('td').forEach((td) => row.push((td.textContent || '').replace(/[^\x20-\x7EÀ-ÿ]/g, '')))
                    body.push(row)
                })

                const colCount = head[0]?.length || 1
                const colWidth = 180 / colCount
                const columnStyles: Record<number, { cellWidth: number }> = {}
                for (let i = 0; i < colCount; i++) {
                    columnStyles[i] = { cellWidth: colWidth }
                }

                autoTable(pdf, {
                    head,
                    body,
                    startY: y,
                    theme: 'grid',
                    styles: { fontSize: 8 },
                    columnStyles
                })

                y = (pdf as any).lastAutoTable.finalY + 10
            }
        })

        pdf.save('rapport.pdf')
    }

    return (
        <button
            onClick={exportToPdf}
            className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 transition"
        >
            📄 Télécharger PDF
        </button>
    )
}
