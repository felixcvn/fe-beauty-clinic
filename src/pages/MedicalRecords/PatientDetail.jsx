import React, { useState } from 'react';
import { Calendar, User, AlertCircle, Clock, FileText, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import ReportModal from '../../components/UI/ReportModal';

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getPatient } = useMockData();
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Fallback if patient not found
    const patient = getPatient(id);

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
            {/* Report Modal */}
            <ReportModal
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                data={{ ...selectedRecord, patientDetails: patient }}
                type="patient"
            />

            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary/40 hover:text-primary transition-all duration-300 font-bold text-xs uppercase tracking-widest group">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to History
            </button>

            {/* Patient Header Profile */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-secondary shadow-lg flex items-center justify-center text-primary font-black text-3xl border border-primary/5 relative">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-gold rounded-full border-4 border-white" title="Active Patient" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-primary tracking-tighter leading-none">{patient.name}</h2>
                        <div className="flex flex-wrap gap-6 mt-4 text-[10px] font-black uppercase tracking-widest text-primary/40">
                            <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary/20" /> {patient.age} Years</span>
                            <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary/20" /> ID: {patient.id}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-red-50/50 px-6 py-5 rounded-[2rem] border border-red-100/50 flex items-start gap-4 max-w-sm">
                    <div className="p-2 bg-red-100 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Critical Allergies</p>
                        <p className="text-xs font-bold text-red-700">{patient.allergies}</p>
                    </div>
                </div>
            </div>

            {/* Medical History Timeline */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-primary tracking-tighter flex items-center gap-3">
                        <Clock className="w-6 h-6 text-primary/20" /> Medical History
                    </h3>
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary/30">
                        {patient.history?.length || 0} Total Records
                    </div>
                </div>

                <div className="space-y-12 relative before:absolute before:left-6 before:top-2 before:bottom-0 before:w-0.5 before:bg-primary/5">
                    {patient.history && patient.history.length > 0 ? (
                        patient.history.map((record) => (
                            <div key={record.id} className="relative pl-14 group">
                                {/* Timeline Dot */}
                                <div className="absolute left-3 top-2 w-6.5 h-6.5 bg-white border-4 border-secondary shadow-md group-hover:border-primary rounded-2xl z-10 transition-colors duration-500"></div>

                                <div className="bg-secondary/20 p-8 rounded-[2rem] border border-primary/5 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                                    <div className="flex flex-wrap justify-between items-start gap-6 mb-6">
                                        <div>
                                            <h4 className="text-xl font-black text-primary tracking-tight mb-2">{record.treatment}</h4>
                                            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-primary/30">
                                                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary/20" /> {record.date}</span>
                                                <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary/20" /> {record.specialist}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedRecord(record)}
                                            className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 rounded-xl hover:bg-primary hover:text-secondary transition-all duration-300 shadow-sm"
                                        >
                                            View Report
                                        </button>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm">
                                        <p className="text-primary/60 text-sm leading-relaxed font-medium">
                                            {record.notes}
                                        </p>
                                    </div>

                                    {/* Before & After Photos */}
                                    {record.beforeImage && record.afterImage && (
                                        <div className="mt-8 grid grid-cols-2 gap-6">
                                            <div className="group/photo relative overflow-hidden rounded-2xl shadow-lg border border-primary/5">
                                                <img src={record.beforeImage} alt="Before" className="w-full aspect-video object-cover transition-transform group-hover/photo:scale-110 duration-700" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                                    <span className="text-white text-[9px] font-black uppercase tracking-[0.2em] bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">BEFORE TREATMENT</span>
                                                </div>
                                            </div>
                                            <div className="group/photo relative overflow-hidden rounded-2xl shadow-lg border border-primary/5">
                                                <img src={record.afterImage} alt="After" className="w-full aspect-video object-cover transition-transform group-hover/photo:scale-110 duration-700" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex items-end p-4">
                                                    <span className="text-white text-[9px] font-black uppercase tracking-[0.2em] bg-primary/40 px-3 py-1 rounded-full backdrop-blur-md">AFTER TREATMENT</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="pl-14 text-primary/20 font-black uppercase text-xs tracking-widest py-8">No history records found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDetail;
