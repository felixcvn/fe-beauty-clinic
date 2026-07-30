import React, { useState } from 'react';
import { MagnifyingGlassIcon as Search, PencilIcon as Edit2, CheckIcon as Check, XMarkIcon as X, ClockIcon as Clock } from '@heroicons/react/24/outline';
import { useMockData } from '../../../context/MockDataContext';
import { getActiveShift, getShiftOptionsByDivisi } from '../../../utils/shiftConfig';

const ShiftManagementTab = () => {
    const { employeeLocations, updateEmployeeLocation } = useMockData();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    const filteredEmployees = (employeeLocations || []).filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (emp) => {
        setEditingId(emp.id);
        setEditValue(emp.shift || '');
    };

    const handleSave = (id) => {
        updateEmployeeLocation(id, { shift: editValue });
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-black text-primary tracking-tighter">Manajemen Shift Karyawan</h3>
                    <p className="text-primary/40 text-sm font-medium">Atur jam kerja dan shift operasional masing-masing karyawan.</p>
                </div>
            </div>

            <div className="w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                <input 
                    type="text" 
                    placeholder="Cari karyawan atau departemen..." 
                    className="w-full pl-12 pr-6 py-3 rounded-2xl bg-primary/5 border-none outline-none text-primary placeholder:text-primary/30 font-medium text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 border-b border-primary/10">
                            <th className="px-4 py-4">Karyawan</th>
                            <th className="px-4 py-4">Departemen</th>
                            <th className="px-4 py-4">Shift Saat Ini</th>
                            <th className="px-4 py-4">Jam Kerja</th>
                            <th className="px-4 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                        {filteredEmployees.map((emp) => {
                            const activeShift = getActiveShift(emp.shift, false);
                            const shiftOptions = getShiftOptionsByDivisi(emp.department);

                            return (
                                <tr key={emp.id} className="hover:bg-primary/[0.02] transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={emp.photo} alt={emp.name} className="w-10 h-10 rounded-full object-cover border border-primary/10 shadow-sm" />
                                            <div>
                                                <div className="font-bold text-primary text-sm">{emp.name}</div>
                                                <div className="text-[10px] text-primary/40 font-black uppercase tracking-widest mt-0.5">{emp.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-wider">
                                            {emp.department}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        {editingId === emp.id ? (
                                            <select 
                                                value={editValue} 
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="bg-white border border-primary/20 rounded-xl px-3 py-2.5 text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20 shadow-sm w-full max-w-[200px]"
                                            >
                                                {shiftOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="font-bold text-primary text-sm bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 inline-block">
                                                {activeShift.label}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-sm font-bold text-primary/80">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-primary/30" />
                                            {activeShift.checkIn} - {activeShift.checkOut}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        {editingId === emp.id ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleSave(emp.id)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm shadow-green-500/20" title="Simpan">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors" title="Batal">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleEdit(emp)} className="p-2 hover:bg-primary/5 rounded-lg text-primary/40 hover:text-primary transition-colors" title="Edit Shift">
                                                <Edit2 className="w-4 h-4 mx-auto" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-primary/40 mt-4 border-t border-primary/10 pt-4 gap-4">
                <div>Menampilkan {filteredEmployees.length} dari {employeeLocations?.length || 0} Karyawan</div>
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-primary/10 hover:bg-primary/5 transition-colors">&lt;</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-secondary shadow-md shadow-primary/20">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-primary/10 hover:bg-primary/5 transition-colors">&gt;</button>
                </div>
            </div>
        </div>
    );
};

export default ShiftManagementTab;
