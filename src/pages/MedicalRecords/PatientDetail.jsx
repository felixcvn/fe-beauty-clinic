import React, { useState } from 'react';
import { Calendar, User, AlertCircle, Clock, FileText, ArrowLeft, Plus } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { useAuth } from '../../context/AuthContext';
import { rekamMedisAPI, pasienAPI, STORAGE_URL } from '../../services/api';
import ReportModal from '../../components/UI/ReportModal';
import MedicalRecordFormModal from '../../components/UI/MedicalRecordFormModal';
import TableSkeleton from '../../components/UI/TableSkeleton';

const getImageUrl = (url) => {
    if (!url) return null;
    let finalUrl = url.startsWith('http') || url.startsWith('/') ? url : `${STORAGE_URL}/${url}`;
    const separator = finalUrl.includes('?') ? '&' : '?';
    if (!finalUrl.includes('ngrok-skip-browser-warning')) {
        finalUrl += `${separator}ngrok-skip-browser-warning=1`;
    }
    return finalUrl;
};

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getPatient } = useMockData();
    const { user } = useAuth();
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPatientLoading, setIsPatientLoading] = useState(true);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [apiPatient, setApiPatient] = useState(null);
    const [fetchTrigger, setFetchTrigger] = useState(0);

    React.useEffect(() => {
        const fetchPatient = async () => {
            if (!user?.token) return;
            setIsPatientLoading(true);
            try {
                const result = await pasienAPI.getById(user.token, id);
                if (result.success) {
                    const p = result.data.data || result.data;
                    
                    let age = '-';
                    if (p.Tanggal_Lahir) {
                        const birthDate = new Date(p.Tanggal_Lahir);
                        const today = new Date();
                        age = today.getFullYear() - birthDate.getFullYear();
                        const m = today.getMonth() - birthDate.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                        }
                    }

                    setApiPatient({
                        id: p.id,
                        name: p.Nama_pasien || p.nama_pasien || p.name || 'Unknown Patient',
                        age: age,
                        lastVisit: p.terakhir_kunjungan || p.updated_at?.split('T')[0] || '-',
                        allergies: p.riwayat_alergi || p.allergies || 'Tidak ada riwayat alergi yang tercatat.',
                    });
                }
            } catch (error) {
                console.error("Failed to fetch patient details", error);
            } finally {
                setIsPatientLoading(false);
            }
        };
        fetchPatient();
    }, [id, user]);

    React.useEffect(() => {
        const fetchRecords = async () => {
            if (!user?.token) return;
            setIsLoading(true);
            try {
                const result = await rekamMedisAPI.getAll(user.token);
                if (result.success) {
                    const data = result.data.data || result.data;
                    const recordsArray = Array.isArray(data) ? data : [];
                    const patientRecords = recordsArray
                        .filter(r => String(r.data_pasien_id || r.pasien_id) === String(id))
                        .sort((a, b) => {
                            const dateA = new Date(a.tanggal_kunjungan || a.tanggal || a.created_at || 0);
                            const dateB = new Date(b.tanggal_kunjungan || b.tanggal || b.created_at || 0);
                            return dateB - dateA;
                        });
                    setMedicalRecords(patientRecords);
                }
            } catch (error) {
                console.error("Failed to fetch medical records", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecords();
    }, [id, user, fetchTrigger]);

    // Fallback if patient not found in mock data
    const patient = apiPatient || getPatient(id);

    if (isPatientLoading && !patient) {
        return (
            <div className="p-8 text-center text-primary/40">
                <TableSkeleton mode="card" rows={1} />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="p-8 text-center text-primary/40">
                <p className="font-bold text-lg mb-4">Patient not found.</p>
                <button onClick={() => navigate('/medical-records')} className="text-primary font-black uppercase text-xs tracking-widest hover:underline">
                    Back to List
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            {/* Add Record Modal */}
            <MedicalRecordFormModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditData(null);
                }}
                patientId={patient.id}
                patientName={patient.name}
                mode={editData ? 'edit' : 'add'}
                initialData={editData}
                onSuccess={() => setFetchTrigger(prev => prev + 1)}
            />

            {/* Report Modal */}
            <ReportModal
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                data={{ ...selectedRecord, patientDetails: patient }}
                type="patient"
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-all duration-300 font-bold text-xs uppercase tracking-widest group">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to History
                </button>
                <div className="text-[10px] font-black uppercase tracking-widest text-primary/30">
                    ID: {patient.id}
                </div>
            </div>

            {/* Patient Header Profile */}
            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-primary/10 shadow-primary/5 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-6 text-center sm:text-left">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-secondary flex items-center justify-center text-primary font-black text-3xl border border-primary/5 relative shrink-0">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-gold rounded-full border-4 border-white shadow-lg" title="Active Patient" />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-tight">{patient.name}</h2>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-4 md:gap-6 mt-4 text-[10px] font-black uppercase tracking-widest text-primary/60">
                            <span className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full"><User className="w-4 h-4 text-primary/20" /> {patient.age} Pasien</span>
                            <span className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full"><Calendar className="w-4 h-4 text-primary/20" /> Terdaftar {patient.lastVisit}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Medical History Timeline */}
            <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-primary/10 shadow-2xl shadow-primary/5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
                    <h3 className="text-2xl md:text-3xl font-black text-primary tracking-tighter flex items-center gap-3">
                        <Clock className="w-7 h-7 text-primary/20" /> Riwayat Medis
                    </h3>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="hidden md:block px-4 py-2 bg-primary/5 rounded-full text-[10px] font-black uppercase tracking-widest text-primary/50">
                            {medicalRecords.length} Total Rekaman
                        </div>
                        <button
                            onClick={() => {
                                setEditData(null);
                                setIsAddModalOpen(true);
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-secondary px-6 py-3 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Rekam Medis</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-12 relative before:absolute before:left-3 sm:before:left-6 before:top-2 before:bottom-0 before:w-0.5 before:bg-primary/10">
                    {isLoading ? (
                        <div className="pl-10 sm:pl-16">
                            <TableSkeleton mode="card" rows={3} />
                        </div>
                    ) : (
                        <>
                            {medicalRecords.length > 0 ? (
                                medicalRecords.map((record) => {
                                    const treatmentStr = record.treatments?.map(t => t.Nama_treatment || t.name || t.Nama_Treatment).join(', ') || 'General Checkup';
                                    const specialistStr = record.dokter?.NamaLengkap_karyawan || record.dokter?.nama_lengkap || record.dokter?.Nama_karyawan || record.karyawan?.Nama_karyawan || 'Unknown';
                                    const recordDate = record.tanggal_kunjungan || record.tanggal || record.created_at?.split('T')[0] || '-';
                                    const recordNote = record.diagnosa || record.catatan_tindakan || record.catatan || '-';
                                    const beforeImg = record.gambar_sebelum;
                                    const afterImg = record.gambar_sesudah;
                                    
                                    return (
                                    <div key={record.id} className="relative pl-10 sm:pl-16 group">
                                        <div className="absolute left-0 sm:left-3 top-2 w-6 h-6 bg-white border-4 border-secondary shadow-md group-hover:border-primary rounded-full z-10 transition-colors duration-500"></div>

                                        <div className="bg-secondary/10 p-6 sm:p-10 rounded-[2rem] border border-primary/5 hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                                            <div className="flex flex-col xl:flex-row justify-between items-start gap-6 mb-8">
                                                <div className="space-y-3">
                                                    <h4 className="text-xl md:text-2xl font-black text-primary tracking-tight">{treatmentStr}</h4>
                                                    <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-primary/40">
                                                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary/20" /> {recordDate}</span>
                                                        <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary/20" /> {specialistStr}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                                                    <button
                                                        onClick={() => {
                                                            setEditData(record);
                                                            setIsAddModalOpen(true);
                                                        }}
                                                        className="w-full sm:w-auto px-8 py-3 text-[10px] font-black uppercase tracking-widest text-primary bg-secondary/50 border border-primary/10 rounded-2xl hover:bg-primary/10 transition-all duration-500 shadow-sm active:scale-95"
                                                    >
                                                        Edit Data
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedRecord({
                                                             ...record, 
                                                             treatment: treatmentStr, 
                                                             specialist: specialistStr,
                                                             date: recordDate,
                                                             notes: recordNote,
                                                             beforeImage: getImageUrl(beforeImg),
                                                             afterImage: getImageUrl(afterImg)
                                                         })}
                                                        className="w-full sm:w-auto px-8 py-3 text-[10px] font-black uppercase tracking-widest text-secondary bg-primary rounded-2xl hover:bg-primary/90 transition-all duration-500 shadow-xl shadow-primary/20 active:scale-95"
                                                    >
                                                        Lihat Laporan Lengkap
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-primary/5 shadow-sm mb-8">
                                                <div className="text-[9px] font-black text-primary/20 uppercase tracking-[0.2em] mb-3">Diagnosa / Catatan Dokter</div>
                                                <p className="text-primary/70 text-sm md:text-base leading-relaxed font-medium italic">
                                                    "{recordNote}"
                                                </p>
                                            </div>

                                            {(beforeImg || afterImg) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                                    {beforeImg && (
                                                    <div className="group/photo relative overflow-hidden rounded-[2rem] shadow-xl border border-primary/5 aspect-square">
                                                        <img 
                                                            src={getImageUrl(beforeImg)} 
                                                            alt="Before" 
                                                            className="w-full h-full object-cover transition-transform group-hover/photo:scale-110 duration-1000" 
                                                        />
                                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                                                            <span className="text-white text-[9px] font-black uppercase tracking-[0.2em] bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 uppercase">FOTO SEBELUM</span>
                                                        </div>
                                                    </div>
                                                    )}
                                                    {afterImg && (
                                                    <div className="group/photo relative overflow-hidden rounded-[2rem] shadow-xl border border-primary/10 aspect-square">
                                                        <img 
                                                            src={getImageUrl(afterImg)} 
                                                            alt="After" 
                                                            className="w-full h-full object-cover transition-transform group-hover/photo:scale-110 duration-1000" 
                                                        />
                                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent p-6">
                                                            <span className="text-white text-[9px] font-black uppercase tracking-[0.2em] bg-primary/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 uppercase">FOTO SESUDAH</span>
                                                        </div>
                                                    </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )})
                            ) : (
                                <div className="pl-10 sm:pl-16 text-primary/20 font-black uppercase text-xs tracking-widest py-10">Belum ada riwayat rekam medis.</div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDetail;
