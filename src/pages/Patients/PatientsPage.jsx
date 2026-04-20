import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronRight, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import CustomSelect from '../../components/UI/CustomSelect';
import PatientEditModal from '../../components/UI/PatientEditModal';
import BookingFormModal from '../../components/UI/ReservationFormModal';
import TableSkeleton from '../../components/UI/TableSkeleton';
import EmptyState from '../../components/UI/EmptyState';

const PatientsPage = () => {
    const { patients, updatePatient, addPatient } = useMockData();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isOwner = ['Owner', 'Komisaris'].includes(user?.role);
    const [searchTerm, setSearchTerm] = useState('');
    const [memberFilter, setMemberFilter] = useState('Semua Tipe');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const { addBooking } = useMockData();
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const isCS = user?.role === 'Customer Service';
    const isOwnerOrKomisaris = ['Owner', 'Komisaris'].includes(user?.role);

    const handleSaveBooking = (bookingData) => {
        addBooking(bookingData);
        showToast('Booking berhasil ditambahkan!', 'success');
        setIsBookingModalOpen(false);
    };

    const handleSaveForm = (formData) => {
        if (selectedPatient) {
            updatePatient(formData);
            showToast('Data pasien berhasil diperbarui!', 'success');
        } else {
            addPatient(formData);
            showToast('Pasien baru berhasil didaftarkan!', 'success');
        }
        setIsFormModalOpen(false);
    };

    const handleOpenAdd = () => {
        setSelectedPatient(null);
        setIsFormModalOpen(true);
    };

    // SABUK PENGAMAN 1: Fungsi untuk ambil inisial nama dengan aman
    const getInitials = (name) => {
        if (!name) return 'NN'; // No Name cadangan
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const filteredPatients = patients.filter(patient => {
        // SABUK PENGAMAN 2: Antisipasi perbedaan nama key (name vs namaLengkap)
        const patientName = patient.namaLengkap || patient.name || '';
        const patientId = patient.id || patient.noIdentitas || patient.noMember || '';
        
        const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patientId.toLowerCase().includes(searchTerm.toLowerCase());
            
        const patientMemberType = patient.tipeMember || 'GOLD';
        const matchesMemberType = memberFilter === 'Semua Tipe' || patientMemberType === memberFilter;
        
        return matchesSearch && matchesMemberType;
    });

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, memberFilter]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Data Pasien</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Kelola seluruh data pasien terdaftar di klinik</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {!isOwnerOrKomisaris && (
                        <button
                            onClick={handleOpenAdd}
                            className="flex items-center justify-center gap-2 bg-primary text-secondary px-6 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Daftar Pasien Baru</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-primary/5">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari nama pasien atau ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all"
                        />
                    </div>
                    <div className="w-48 relative z-50">
                        <CustomSelect
                            value={memberFilter}
                            onChange={setMemberFilter}
                            options={[
                                { value: 'Semua Tipe', label: 'Semua Tipe' },
                                { value: 'SILVER', label: 'Silver' },
                                { value: 'GOLD', label: 'Gold' },
                                { value: 'PLATINUM', label: 'Platinum' }
                            ]}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <TableSkeleton rows={itemsPerPage} columns={isOwner ? 5 : 6} />
                ) : (
                    <>
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] border-b border-primary/5 bg-gray-50/30">
                                <th className="px-4 py-3 text-primary/80">ID</th>
                                <th className="px-4 py-3 text-primary/80">Nama</th>
                                <th className="px-4 py-3 text-primary/80">No. Member</th>
                                <th className="px-4 py-3 text-primary/80">No. RM</th>
                                <th className="px-4 py-3 text-primary/80">Tipe Member</th>
                                {!isOwner && <th className="px-4 py-3 text-right text-primary/80">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {currentPatients.map((patient, index) => {
                                // Ambil data dengan aman
                                const pName = patient.namaLengkap || patient.name || '-';
                                const pId = patient.id || patient.noIdentitas || `ID-${index}`;
                                
                                return (
                                    <tr
                                        key={pId}
                                        onClick={() => navigate(`/patients/detail/${pId}`)}
                                        className="border-b border-primary/5 last:border-0 cursor-pointer hover:bg-primary/[0.02] transition-colors"
                                    >
                                        <td className="px-4 py-2">
                                            <span className="font-medium text-blue-600 text-sm tracking-tight">{pId}</span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-secondary shadow-sm flex items-center justify-center text-primary font-medium text-xs border border-primary/5 shrink-0">
                                                    {getInitials(pName)}
                                                </div>
                                                <div className="font-medium text-primary text-sm tracking-tight">{pName}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-primary/80 font-medium text-sm">
                                            {patient.noMember || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-primary/80 font-medium text-sm">
                                            {patient.noRM || '-'}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className={`font-bold text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full shadow-sm border border-white/50 ${
                                                (patient.tipeMember || 'GOLD') === 'PLATINUM' ? 'bg-slate-100 text-slate-600' :
                                                (patient.tipeMember || 'GOLD') === 'GOLD' ? 'bg-accent-gold/10 text-accent-gold' :
                                                'bg-gray-100 text-gray-500' 
                                            }`}>
                                                {patient.tipeMember || 'GOLD'}
                                            </span>
                                        </td>
                                        {!isOwner && (
                                            <td className="px-4 py-2">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedPatient(patient);
                                                            setIsFormModalOpen(true);
                                                        }}
                                                        className="text-primary/40 hover:text-accent-gold transition-all duration-300 p-2 rounded-xl hover:bg-white hover:shadow-sm active:scale-90"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )
                            })}
                            {filteredPatients.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState 
                                            type="patient"
                                            title="Pasien Tidak Ditemukan"
                                            description="Belum ada data pasien yang sesuai dengan pencarian Anda. Pastikan nama atau ID yang Anda masukkan sudah benar."
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-primary/5">
                    {currentPatients.map((patient, index) => {
                        const pName = patient.namaLengkap || patient.name || '-';
                        const pId = patient.id || patient.noIdentitas || `ID-${index}`;
                        
                        return (
                            <div
                                key={pId}
                                onClick={() => navigate(`/patients/detail/${pId}`)}
                                className="p-6 border-b border-primary/5 last:border-0 flex flex-col gap-3 cursor-pointer hover:bg-primary/[0.02]"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-secondary shadow-sm flex items-center justify-center text-primary font-black text-xs border border-primary/5 shrink-0">
                                            {getInitials(pName)}
                                        </div>
                                        <div>
                                            <span className="font-bold text-blue-500 text-xs tracking-tight">{pId}</span>
                                            <h4 className="font-black text-primary text-sm tracking-tight mt-0.5">{pName}</h4>
                                        </div>
                                    </div>
                                    <span className={`font-black text-[10px] tracking-widest uppercase px-2 py-1 rounded-md mt-1 ${
                                        (patient.tipeMember || 'GOLD') === 'PLATINUM' ? 'bg-slate-100 text-slate-600' :
                                        (patient.tipeMember || 'GOLD') === 'GOLD' ? 'bg-accent-gold/10 text-accent-gold' :
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                        {patient.tipeMember || 'GOLD'}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-primary/60 mt-2 bg-gray-50 p-3 rounded-xl border border-primary/5">
                                    <div>
                                        <span className="text-[9px] text-primary/40 uppercase tracking-widest block mb-0.5">No Member</span>
                                        {patient.noMember || '-'}
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-primary/40 uppercase tracking-widest block mb-0.5">No RM</span>
                                        {patient.noRM || '-'}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-2">
                                    {!isOwner && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPatient(patient);
                                                setIsFormModalOpen(true);
                                            }}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-accent-gold hover:border-accent-gold/30 transition-all shadow-sm active:scale-95"
                                        >
                                            <Pencil className="w-3 h-3" /> Edit
                                        </button>
                                    )}
                                    <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:border-primary/30 transition-all shadow-sm active:scale-95">
                                        Detail <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                    {filteredPatients.length === 0 && (
                        <EmptyState 
                            type="patient"
                            title="Pasien Tidak Ditemukan"
                            description="Belum ada data pasien yang sesuai dengan pencarian Anda."
                        />
                    )}
                </div>
                    </>
                )}

                <div className="p-6 md:p-8 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5">
                    <span>Menampilkan {filteredPatients.length === 0 ? 0 : indexOfFirstItem + 1} hingga {Math.min(indexOfLastItem, filteredPatients.length)} dari {filteredPatients.length} data</span>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button 
                            onClick={handlePrevPage} 
                            disabled={currentPage === 1}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-primary/10 bg-white hover:bg-gray-50 text-primary transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm"
                        >
                            Sebelumnya
                        </button>
                        <button 
                            onClick={handleNextPage} 
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-primary text-secondary hover:bg-primary/90 transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm"
                        >Selanjutnya</button>
                    </div>
                </div>
            </div>

            <PatientEditModal 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveForm}
                initialData={selectedPatient}
            />

            <BookingFormModal 
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                onSave={handleSaveBooking}
            />
        </div>
    );
};

export default PatientsPage;