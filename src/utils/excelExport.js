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

    const worksheet = workbook.addWorksheet('Laporan Absensi', {
        views: [{ showGridLines: false }]
    });

    // Determine Headers based on activeTab
    let headers = [];
    let columnWidths = [];

    if (activeTab === 'attendance') {
        headers = ['ID Karyawan', 'Nama Karyawan', 'Role', 'Shift', 'Tanggal', 'Jam Masuk', 'Jam Keluar', 'Status', 'Lokasi'];
        columnWidths = [18, 30, 25, 20, 15, 15, 15, 15, 40];
    } else if (activeTab === 'leave') {
        headers = ['ID Pengajuan', 'Nama Karyawan', 'Role', 'Jenis Pengajuan', 'Tanggal Mulai', 'Tanggal Selesai', 'Alasan', 'Status'];
        columnWidths = [18, 30, 25, 20, 15, 15, 40, 15];
    } else {
        // overtime
        headers = ['ID Pengajuan', 'Nama Karyawan', 'Role', 'Shift', 'Jenis', 'Jam Jadwal', 'Jam Aktual', 'Keterangan', 'Status'];
        columnWidths = [18, 30, 25, 20, 20, 15, 15, 40, 15];
    }

    const colCount = headers.length;
    const endColLetter = String.fromCharCode(64 + colCount);

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
        let rowData = [];
        let status = item.status || '-';

        if (activeTab === 'attendance') {
            rowData = [
                item.id || '-',
                item.name || '-',
                item.role || '-',
                item.shift || '-',
                item.date || '-',
                item.checkIn || '-',
                item.checkOut || '-',
                status,
                item.isOutside ? (item.locationAddress || 'Luar Kantor (Alamat Tidak Ditemukan)') : 'HQ Clinic'
            ];
        } else if (activeTab === 'leave') {
            rowData = [
                item.id || '-',
                item.staffName || '-',
                item.role || '-',
                item.type || '-',
                item.startDate || '-',
                item.endDate || '-',
                item.reason || '-',
                status
            ];
        } else {
            // overtime
            rowData = [
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
        }

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

            // Format Status Column (always the last column)
            if (colNumber === colCount) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.font = { name: 'Arial', size: 10, bold: true };
                
                if (status === 'Hadir' || status === 'Disetujui') {
                    cell.font.color = { argb: 'FF16A34A' }; // Green
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
                } else if (status === 'Terlambat' || status === 'Menunggu' || status === 'Sakit' || status === 'Izin' || status === 'Cuti') {
                    cell.font.color = { argb: 'FFD97706' }; // Amber/Yellow
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
                } else if (status === 'Alpa' || status === 'Ditolak') {
                    cell.font.color = { argb: 'FFDC2626' }; // Red
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEB' } };
                }
            }
            
            // Format time/date columns for center alignment
            const headerName = headers[colNumber - 1];
            if (['Tanggal', 'Jam Masuk', 'Jam Keluar', 'Tanggal Mulai', 'Tanggal Selesai', 'Jam Jadwal', 'Jam Aktual'].includes(headerName)) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
        });
    });

    // 5. Adjust Column Widths
    worksheet.columns = columnWidths.map(width => ({ width }));

    // Generate File
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
