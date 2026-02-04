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
            <div className="p-8 text-center text-primary-light">
                <p>Patient not found.</p>
                <button onClick={() => navigate('/medical-records')} className="mt-4 text-primary font-bold hover:underline">
                    Back to List
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Report Modal */}
            <ReportModal
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                data={{ ...selectedRecord, patientDetails: patient }}
                type="patient"
            />

            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-light hover:text-primary transition-colors font-medium mb-2">
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {/* Patient Header Profile */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-dark/20 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border-2 border-primary/20">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-primary">{patient.name}</h2>
                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-primary-light font-medium">
                            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {patient.age} Years Old</span>
                            <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> ID: {patient.id}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-red-50 px-4 py-3 rounded-xl border border-red-100 flex items-start gap-3 max-w-sm">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-red-700">Allergies</p>
                        <p className="text-xs text-red-600">{patient.allergies}</p>
                    </div>
                </div>
            </div>

            {/* Medical History Timeline */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-dark/20">
                <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Medical History
                </h3>

                <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-0 before:w-0.5 before:bg-secondary-dark/30">
                    {patient.history && patient.history.length > 0 ? (
                        patient.history.map((record) => (
                            <div key={record.id} className="relative pl-10">
                                {/* Timeline Dot */}
                                <div className="absolute left-1.5 top-1.5 w-5 h-5 bg-secondary-light border-4 border-primary rounded-full z-10"></div>

                                <div className="bg-secondary-light/30 p-5 rounded-2xl border border-secondary-dark/10 hover:border-primary/20 transition-all">
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-primary">{record.treatment}</h4>
                                            <div className="flex gap-4 text-sm text-primary-light mt-1">
                                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {record.date}</span>
                                                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {record.specialist}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedRecord(record)}
                                            className="px-4 py-2 text-sm font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-colors"
                                        >
                                            View Full Report
                                        </button>
                                    </div>

                                    <p className="text-primary-dark/80 mb-4 text-sm leading-relaxed bg-white/50 p-3 rounded-lg border border-secondary-dark/5">
                                        {record.notes}
                                    </p>

                                    {/* Before & After Photos */}
                                    {record.beforeImage && record.afterImage && (
                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <div className="group relative overflow-hidden rounded-xl">
                                                <img src={record.beforeImage} alt="Before" className="w-full aspect-square object-cover transition-transform group-hover:scale-105" />
                                                <span className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">BEFORE</span>
                                            </div>
                                            <div className="group relative overflow-hidden rounded-xl">
                                                <img src={record.afterImage} alt="After" className="w-full aspect-square object-cover transition-transform group-hover:scale-105" />
                                                <span className="absolute top-2 left-2 bg-primary/80 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">AFTER</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="pl-10 text-primary-light italic">No medical history records found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDetail;
