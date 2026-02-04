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
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-primary">Rekam Medis</h2>
                    <p className="text-primary-light mt-1">Kelola History Pasien dan Rencana Perawatan</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/medical-records/new')}
                        className="flex items-center gap-2 bg-primary text-secondary px-6 py-3 rounded-xl hover:bg-primary-dark transition-all font-medium shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Tambah Rekam Medis</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-secondary-dark/20 overflow-hidden">
                <div className="p-4 border-b border-secondary-dark/10 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-light" />
                        <input
                            type="text"
                            placeholder="Cari nama pasien atau ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary-light/50 border-none outline-none text-primary placeholder:text-primary-light/70 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-secondary-light/50 px-4 py-2 rounded-lg text-sm text-primary font-medium border-none outline-none cursor-pointer"
                    >
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Completed</option>
                    </select>
                </div>

                <table className="w-full">
                    <thead className="bg-secondary/50">
                        <tr className="text-left text-sm text-primary font-semibold">
                            <th className="px-6 py-4 rounded-tl-lg">Nama Pasien</th>
                            <th className="px-6 py-4">Umur</th>
                            <th className="px-6 py-4">Terakhir Visit</th>
                            <th className="px-6 py-4">Treatment</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 rounded-tr-lg">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-dark/10">
                        {filteredPatients.map((patient) => (
                            <tr
                                key={patient.id}
                                onClick={() => navigate(`/medical-records/${patient.id}`)}
                                className="hover:bg-secondary-light/30 transition-colors group cursor-pointer"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {patient.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="font-medium text-primary">{patient.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-primary-light font-medium">{patient.age}</td>
                                <td className="px-6 py-4 text-primary-light font-medium">{patient.lastVisit}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-primary font-medium">
                                        <FileText className="w-4 h-4 text-primary-light" />
                                        {patient.condition}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${patient.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                                            patient.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-orange-50 text-orange-700 border-orange-200'
                                        }`}>
                                        {patient.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-primary-light hover:text-primary transition-colors p-2 rounded-lg hover:bg-secondary-dark/20">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredPatients.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-primary-light">
                                    Data Pasien Tidak Ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="p-4 border-t border-secondary-dark/10 flex justify-between items-center text-sm text-primary-light">
                    <span>Showing {filteredPatients.length} of {patients.length} records</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-lg border border-secondary-dark/20 hover:bg-secondary hover:text-primary transition-colors disabled:opacity-50">Previous</button>
                        <button className="px-3 py-1 rounded-lg border border-secondary-dark/20 hover:bg-secondary hover:text-primary transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientList;
