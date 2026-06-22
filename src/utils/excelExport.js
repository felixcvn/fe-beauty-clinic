import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcel = async (data, title, filename) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Klinik System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Laporan Stok', {
        views: [{ showGridLines: false }]
    });

    // 1. Add Title
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = title.toUpperCase();
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF154734' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // 2. Add Date
    worksheet.mergeCells('A2:H2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Tanggal Export: ${new Date().toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })}`;
    dateCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF555555' } };
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.addRow([]); // Blank row

    // 3. Define Headers
    const headers = ['Kode', 'Nama Item', 'Kategori', 'Tipe', 'Harga Normal', 'Harga Distributor', 'Stok', 'Batas Min'];
    const headerRow = worksheet.addRow(headers);
    
    headerRow.eachCell((cell, colNumber) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF154734' } // Primary clinic green
        };
        cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
        };
    });
    headerRow.height = 25;

    // 4. Add Data
    data.forEach(item => {
        const tipe = item.isPackage ? 'Paket' : item._type === 'product' ? 'Produk' : 
                     item._type === 'material' ? 'Bhn Treatment' :
                     item._type === 'medical' ? 'Bhn Medis' :
                     item._type === 'infusion' ? 'Bhn Infus' :
                     item._type === 'apotekItem' ? 'Brg Apotek' : (item._type || '-');

        const row = worksheet.addRow([
            item.id || '-',
            item.name || '-',
            item.category || '-',
            tipe.toUpperCase(),
            item.price || 0,
            item.priceDistributor || 0,
            item.isPackage ? '-' : (item.stock || 0),
            item.isPackage ? '-' : (item.minStock || 0)
        ]);

        row.eachCell((cell, colNumber) => {
            cell.font = { name: 'Arial', size: 10 };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
            };
            cell.alignment = { vertical: 'middle' };

            // Format Currency columns (5 and 6)
            if (colNumber === 5 || colNumber === 6) {
                cell.numFmt = '"Rp"#,##0;[Red]\-"Rp"#,##0';
                cell.alignment = { horizontal: 'right' };
            }
            // Format Stok columns (7 and 8)
            if (colNumber === 7 || colNumber === 8) {
                cell.alignment = { horizontal: 'center' };
                if (colNumber === 7 && typeof cell.value === 'number') {
                    // Highlight low stock if below minStock
                    if (cell.value <= (item.minStock || 5)) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFEBEB' }
                        };
                        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFDC2626' } };
                    }
                }
            }
        });
    });

    // 5. Adjust Column Widths
    worksheet.columns = [
        { width: 15 }, // Kode
        { width: 35 }, // Nama
        { width: 20 }, // Kategori
        { width: 15 }, // Tipe
        { width: 18 }, // Harga
        { width: 18 }, // Harga Dist
        { width: 10 }, // Stok
        { width: 12 }, // Batas Min
    ];

    // Generate File
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportAttendanceToExcel = async (data, activeTab, title, filename) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Klinik System';
    workbook.created = new Date();

    // Determine Headers based on activeTab
    let headers = [];
    let columnWidths = [];

    if (activeTab === 'attendance') {
        // data is an array of monthly recap objects
        data.forEach((monthData) => {
            const { daysInMonth, rekap, bulan, tahun } = monthData;
            
            headers = ['ID Karyawan', 'Nama Karyawan', 'Role'];
            columnWidths = [35, 30, 25]; // slightly larger widths
            
            // Add days 1 to daysInMonth
            for (let i = 1; i <= daysInMonth; i++) {
                headers.push(i.toString());
                columnWidths.push(12);
            }
            
            // Add totals
            headers.push('Total Cuti', 'Total Lembur', 'Total Masuk');
            columnWidths.push(15, 15, 15);

            const bulanName = new Date(tahun, bulan - 1).toLocaleDateString('id-ID', { month: 'long' });
            const sheetName = `Absensi ${bulanName.substring(0,3)} ${tahun}`;
            
            const worksheet = workbook.addWorksheet(sheetName, {
                views: [{ showGridLines: false }]
            });
            
            const colCount = headers.length;
            const endColLetter = worksheet.getColumn(colCount).letter;

            // 1. Add Title
            worksheet.mergeCells(`A1:${endColLetter}1`);
            const titleCell = worksheet.getCell('A1');
            titleCell.value = title.toUpperCase();
            titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF154734' } };
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

            // 2. Add Month & Date
            worksheet.mergeCells(`A2:${endColLetter}2`);
            const subtitleCell = worksheet.getCell('A2');
            subtitleCell.value = `${bulanName.toUpperCase()} ${tahun}`;
            subtitleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF154734' } };
            subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
            
            worksheet.mergeCells(`A3:${endColLetter}3`);
            const dateCell = worksheet.getCell('A3');
            dateCell.value = `Tanggal Export: ${new Date().toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}`;
            dateCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF555555' } };
            dateCell.alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.addRow([]); // Blank row

            // 3. Define Headers
            const headerRow = worksheet.addRow(headers);
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF154734' } // Primary clinic green
                };
                cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                    left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                    bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                    right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
                };
            });
            headerRow.height = 25;

            // 4. Add Data
            rekap.forEach(item => {
                let rowData = [
                    item.id || '-',
                    item.nama || '-',
                    item.role || '-',
                ];
                
                // Add days
                for (let i = 1; i <= daysInMonth; i++) {
                    rowData.push(item.attendance[i.toString()] || '');
                }
                
                // Add totals
                rowData.push(item.summary.total_cuti || 0);
                rowData.push(item.summary.total_lembur || 0);
                rowData.push(item.summary.total_masuk || 0);
                
                const row = worksheet.addRow(rowData);
                
                row.eachCell((cell, colNumber) => {
                    cell.font = { name: 'Arial', size: 10 };
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                        left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                        bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                        right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
                    };
                    
                    // Color formatting for days
                    if (colNumber > 3 && colNumber <= 3 + daysInMonth) {
                        cell.alignment = { vertical: 'middle', horizontal: 'center' };
                        const status = cell.value;
                        
                        if (status) {
                            cell.font = { name: 'Arial', size: 10, bold: true };
                            if (status === 'Masuk' || status === 'Hadir') {
                                cell.font.color = { argb: 'FF16A34A' };
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
                            } else if (status === 'Cuti') {
                                cell.font.color = { argb: 'FFFFFFFF' };
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } }; // Dark red
                            } else if (status === 'Lembur') {
                                cell.font.color = { argb: 'FFB45309' };
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE68A' } }; // Yellow
                            } else if (status === 'Alpa') {
                                cell.font.color = { argb: 'FFFFFFFF' };
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; // Red
                            } else if (status === 'Sakit' || status === 'Izin') {
                                cell.font.color = { argb: 'FF0369A1' };
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } }; // Blue
                            } else if (status === 'Terlambat') {
                                cell.font.color = { argb: 'FF9A3412' };
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } }; // Orange
                            }
                        }
                    } else if (colNumber > 3 + daysInMonth) {
                        // Totals
                        cell.alignment = { vertical: 'middle', horizontal: 'center' };
                        cell.font = { name: 'Arial', size: 11, bold: true };
                    } else {
                        // ID, Name, Role
                        cell.alignment = { vertical: 'middle' };
                    }
                });
            });

            worksheet.columns = columnWidths.map(width => ({ width }));
        });
    } else if (activeTab === 'leave') {
        const worksheet = workbook.addWorksheet('Laporan Cuti', {
            views: [{ showGridLines: false }]
        });
        
        headers = ['ID Pengajuan', 'Nama Karyawan', 'Role', 'Jenis Pengajuan', 'Tanggal Mulai', 'Tanggal Selesai', 'Alasan', 'Status'];
        columnWidths = [18, 30, 25, 20, 15, 15, 40, 15];
        
        const colCount = headers.length;
        const endColLetter = worksheet.getColumn(colCount).letter;

        // 1. Add Title
        worksheet.mergeCells(`A1:${endColLetter}1`);
        const titleCell = worksheet.getCell('A1');
        titleCell.value = title.toUpperCase();
        titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF154734' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // 2. Add Date
        worksheet.mergeCells(`A2:${endColLetter}2`);
        const dateCell = worksheet.getCell('A2');
        dateCell.value = `Tanggal Export: ${new Date().toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })}`;
        dateCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF555555' } };
        dateCell.alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.addRow([]); // Blank row

        // 3. Define Headers
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF154734' }
            };
            cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
            };
        });
        headerRow.height = 25;

        // 4. Add Data
        data.forEach(item => {
            let status = item.status || '-';
            let rowData = [
                item.id || '-',
                item.staffName || '-',
                item.role || '-',
                item.type || '-',
                item.startDate || '-',
                item.endDate || '-',
                item.reason || '-',
                status
            ];

            const row = worksheet.addRow(rowData);
            row.eachCell((cell, colNumber) => {
                cell.font = { name: 'Arial', size: 10 };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                    left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                    bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                    right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
                };
                cell.alignment = { vertical: 'middle' };

                if (colNumber === colCount) {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    cell.font = { name: 'Arial', size: 10, bold: true };
                    if (status === 'Disetujui') {
                        cell.font.color = { argb: 'FF16A34A' };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
                    } else if (status === 'Menunggu' || status === 'Izin' || status === 'Cuti') {
                        cell.font.color = { argb: 'FFD97706' };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
                    } else if (status === 'Ditolak') {
                        cell.font.color = { argb: 'FFDC2626' };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEB' } };
                    }
                }
                const headerName = headers[colNumber - 1];
                if (['Tanggal Mulai', 'Tanggal Selesai'].includes(headerName)) {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                }
            });
        });

        worksheet.columns = columnWidths.map(width => ({ width }));
    } else {
        // overtime
        const worksheet = workbook.addWorksheet('Laporan Lembur', {
            views: [{ showGridLines: false }]
        });

        headers = ['ID Pengajuan', 'Nama Karyawan', 'Role', 'Shift', 'Jenis', 'Jam Jadwal', 'Jam Aktual', 'Keterangan', 'Status'];
        columnWidths = [18, 30, 25, 20, 20, 15, 15, 40, 15];
        
        const colCount = headers.length;
        const endColLetter = worksheet.getColumn(colCount).letter;

        // 1. Add Title
        worksheet.mergeCells(`A1:${endColLetter}1`);
        const titleCell = worksheet.getCell('A1');
        titleCell.value = title.toUpperCase();
        titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF154734' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // 2. Add Date
        worksheet.mergeCells(`A2:${endColLetter}2`);
        const dateCell = worksheet.getCell('A2');
        dateCell.value = `Tanggal Export: ${new Date().toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })}`;
        dateCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF555555' } };
        dateCell.alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.addRow([]); // Blank row

        // 3. Define Headers
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF154734' }
            };
            cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
            };
        });
        headerRow.height = 25;

        // 4. Add Data
        data.forEach(item => {
            let status = item.status || '-';
            let rowData = [
                item.id || '-',
                item.staffName || '-',
                item.role || '-',
                item.shift || '-',
                item.primaryType || '-',
                item.scheduledTime || '-',
                item.detectedTime || '-',
                item.notes || '-',
                status
            ];

            const row = worksheet.addRow(rowData);
            row.eachCell((cell, colNumber) => {
                cell.font = { name: 'Arial', size: 10 };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                    left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                    bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                    right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
                };
                cell.alignment = { vertical: 'middle' };

                if (colNumber === colCount) {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    cell.font = { name: 'Arial', size: 10, bold: true };
                    if (status === 'Disetujui') {
                        cell.font.color = { argb: 'FF16A34A' };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
                    } else if (status === 'Menunggu') {
                        cell.font.color = { argb: 'FFD97706' };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
                    } else if (status === 'Ditolak') {
                        cell.font.color = { argb: 'FFDC2626' };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEB' } };
                    }
                }
                const headerName = headers[colNumber - 1];
                if (['Jam Jadwal', 'Jam Aktual'].includes(headerName)) {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                }
            });
        });

        worksheet.columns = columnWidths.map(width => ({ width }));
    }

    // Generate File
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
