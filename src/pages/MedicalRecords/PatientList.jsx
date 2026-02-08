import React, { useState } from 'react';
import { Search, Plus, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';

const PatientList = () => {
    const { patients } = useMockData();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');

    const filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || patient.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Rekam Medis</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Kelola History Pasien dan Perawatan</p>
                </div>
                <button
                    onClick={() => navigate('/medical-records/new')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Rekam Medis</span>
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-primary/5">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari nama pasien atau ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all"
                        />
                    </div>
                    <div className="relative group min-w-[160px]">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full appearance-none bg-white px-8 py-3.5 pr-12 rounded-2xl text-xs text-primary font-black uppercase tracking-widest border border-primary/5 outline-none cursor-pointer focus:ring-4 focus:ring-primary/5 transition-all"
                        >
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Completed</option>
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 pointer-events-none rotate-90" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] border-b border-primary/5">
                                <th className="px-8 py-6">Nama Pasien</th>
                                <th className="px-8 py-6">Umur</th>
                                <th className="px-8 py-6">Terakhir Visit</th>
                                <th className="px-8 py-6">Treatment</th>
                                <th className="px-8 py-6 text-center">Status</th>
                                <th className="px-8 py-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredPatients.map((patient) => (
                                <tr
                                    key={patient.id}
                                    onClick={() => navigate(`/medical-records/${patient.id}`)}
                                    className="hover:bg-primary/5 transition-all duration-500 group cursor-pointer"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-secondary shadow-sm flex items-center justify-center text-primary font-black text-xs border border-primary/5 group-hover:bg-primary group-hover:text-secondary transition-all duration-500">
                                                {patient.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="font-black text-primary text-sm tracking-tight">{patient.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-primary/60 font-bold text-sm tracking-tight">{patient.age} Thn</td>
                                    <td className="px-8 py-6 text-primary/40 font-black text-xs tracking-widest">{patient.lastVisit}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-primary/60 font-bold text-sm">
                                            <FileText className="w-4 h-4 text-primary/20" />
                                            {patient.condition}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm ${patient.status === 'Active' ? 'bg-primary/10 text-primary' :
                                            patient.status === 'Completed' ? 'bg-accent-gold/10 text-accent-gold' :
                                                'bg-red-50 text-red-400'
                                            }`}>
                                            {patient.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="text-primary/40 hover:text-primary transition-all duration-300 p-2 rounded-xl hover:bg-white hover:shadow-lg active:scale-90">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-primary/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5">
                    <span>Showing {filteredPatients.length} of {patients.length} records</span>
                    <div className="flex gap-3">
                        <button className="px-6 py-2.5 rounded-xl border border-primary/10 bg-white hover:bg-primary hover:text-secondary transition-all duration-500 disabled:opacity-30 active:scale-95 shadow-sm">Previous</button>
                        <button className="px-6 py-2.5 rounded-xl border border-primary/10 bg-white hover:bg-primary hover:text-secondary transition-all duration-500 active:scale-95 shadow-sm">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientList;
