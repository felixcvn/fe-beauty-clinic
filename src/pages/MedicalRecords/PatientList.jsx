import React, { useState } from 'react';
import { MagnifyingGlassIcon as Search, PlusIcon as Plus, DocumentTextIcon as FileText, ChevronRightIcon as ChevronRight } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { rekamMedisAPI } from '../../services/api';
import CustomSelect from '../../components/UI/CustomSelect';
import MedicalRecordFormModal from '../../components/UI/MedicalRecordFormModal';
import TableSkeleton from '../../components/UI/TableSkeleton';
import EmptyState from '../../components/UI/EmptyState';
import Pagination from '../../components/UI/Pagination';

const PatientList = () => {
    const { patients } = useMockData();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [records, setRecords] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    React.useEffect(() => {
        const fetchRecords = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const result = await rekamMedisAPI.getAll(token);
                    if (result.success) {
                        const data = result.data.data || result.data;
                        const recordsArray = Array.isArray(data) ? data : [];
                        // Sort by ID descending to ensure latest records come first
                        const sortedRecords = [...recordsArray].sort((a, b) => b.id - a.id);
                        setRecords(sortedRecords);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch medical records", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecords();
    }, []);

    const filteredRecords = records
        .filter(record => {
            const patientName = record.pasien?.Nama_pasien || record.pasien?.nama_pasien || record.nama_pasien || '';
            const patientId = String(record.data_pasien_id || record.pasien_id || '');
            
            const matchesSearch = 
                patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(record.no_RM || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        })
        .filter((record, index, self) => {
            // Deduplicate by patient ID, keep only the first (latest) one
            const pId = record.data_pasien_id || record.pasien_id;
            return index === self.findIndex((r) => (r.data_pasien_id || r.pasien_id) === pId);
        });

    // Reset pagination to first page when search query changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const indexOfLastRecord = currentPage * itemsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <MedicalRecordFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Rekam Medis</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Kelola History Pasien dan Perawatan</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Rekam Medis</span>
                </button>
            </div>

            <div className="bg-white rounded-card md:rounded-[1rem] border border-primary/5 elevation-2 overflow-hidden">
                <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-primary/5">
                    {/* ... (Search & Select bars) ... */}
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari nama, ID, No RM, atau No Member..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <TableSkeleton rows={8} columns={6} />
                ) : (
                    <>
                        <div className="hidden lg:block overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] border-b border-primary/5 bg-gray-50/30">
                                <th className="px-4 py-3 text-primary/80">ID</th>
                                <th className="px-4 py-3 text-primary/80">Nama Pasien</th>
                                <th className="px-4 py-3 text-primary/80">No Member</th>
                                <th className="px-4 py-3 text-primary/80">No RM</th>
                                <th className="px-4 py-3 text-center text-primary/80">Tipe Member</th>
                                <th className="px-4 py-3 text-right text-primary/80">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {currentRecords.map((record) => {
                                const patientName = record.pasien?.Nama_pasien || record.pasien?.nama_pasien || record.nama_pasien || 'Unknown';
                                const patientId = record.data_pasien_id || record.pasien_id;
                                
                                return (
                                <tr
                                    key={record.id}
                                    onClick={() => navigate(`/medical-records/${patientId}`)}
                                    className="border-b border-primary/5 last:border-0 cursor-pointer hover:bg-primary/5 transition-colors"
                                >
                                    <td className="px-4 py-2 text-primary/80 font-black text-xs">{record.id}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-secondary shadow-sm flex items-center justify-center text-primary font-medium text-xs border border-primary/5">
                                                {patientName.split(' ').map(n => n[0]).join('').substring(0,2)}
                                            </div>
                                            <div className="font-medium text-primary text-sm tracking-tight">{patientName}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-primary/80 font-medium text-sm">{record.pasien?.no_member || '-'}</td>
                                    <td className="px-4 py-2 text-primary/80 font-medium text-sm">{record.pasien?.no_RM || record.no_RM || '-'}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm border border-primary/10 bg-primary/5 text-primary">
                                            {record.pasien?.Tipe_member || record.pasien?.tipe_member || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <button className="text-primary/40 hover:text-primary transition-all duration-300 p-2 rounded-xl hover:bg-white hover:shadow-sm active:scale-90">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )})}
                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState 
                                            type="records"
                                            title="Data Medis Tidak Ditemukan"
                                            description="Sistem tidak menemukan riwayat medis yang sesuai dengan pencarian Anda. Pastikan nama atau ID yang Anda masukkan sudah benar."
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-primary/5">
                    {currentRecords.map((record) => {
                        const patientName = record.pasien?.Nama_pasien || record.pasien?.nama_pasien || record.nama_pasien || 'Unknown';
                        const patientId = record.data_pasien_id || record.pasien_id;

                        return (
                        <div
                            key={record.id}
                            onClick={() => navigate(`/medical-records/${patientId}`)}
                            className="p-6 border-b border-primary/5 last:border-0 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-secondary shadow-sm flex items-center justify-center text-primary font-black text-xs border border-primary/5 shrink-0">
                                {patientName.split(' ').map(n => n[0]).join('').substring(0,2)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1 gap-2">
                                    <h4 className="font-black text-primary text-sm tracking-tight truncate">{patientName}</h4>
                                    <span className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm shrink-0 bg-primary/10 text-primary">
                                        {record.pasien?.Tipe_member || record.pasien?.tipe_member || '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-primary/60 font-bold uppercase tracking-wider mt-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="flex items-center gap-1.5"><span className="text-primary/40">No Member:</span> {record.pasien?.no_member || '-'}</span>
                                        <span className="flex items-center gap-1.5"><span className="text-primary/40">No RM:</span> {record.pasien?.no_RM || record.no_RM || '-'}</span>
                                    </div>
                                    <div className="text-[10px] text-primary/30 font-black uppercase tracking-widest text-right">
                                        ID: {record.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )})}
                    {filteredRecords.length === 0 && (
                        <EmptyState 
                            type="records"
                            title="Data Medis Tidak Ditemukan"
                            description="Sistem tidak menemukan riwayat medis yang sesuai dengan pencarian Anda."
                        />
                    )}
                </div>
                    </>
                )}

                <div className="p-6 md:p-8 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5">
                    <span>Menampilkan {filteredRecords.length === 0 ? 0 : indexOfFirstRecord + 1} hingga {Math.min(indexOfLastRecord, filteredRecords.length)} dari {filteredRecords.length} data</span>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="pt-0 w-full sm:w-auto" />
                </div>
            </div>
        </div>
    );
};

export default PatientList;
