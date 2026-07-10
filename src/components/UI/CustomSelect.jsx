import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';

const CustomSelect = ({ label, value, onChange, options, placeholder = "Pilih salah satu...", icon: Icon, required, searchable = false, className = "", direction = "down" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef(null);
    const dropdownRef = useRef(null);
    const [dropdownStyles, setDropdownStyles] = useState({ position: 'fixed', opacity: 0, pointerEvents: 'none' });

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isOutsideButton = selectRef.current && !selectRef.current.contains(event.target);
            const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);
            if (isOutsideButton && isOutsideDropdown) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updatePosition = () => {
        if (isOpen && selectRef.current) {
            const rect = selectRef.current.getBoundingClientRect();
            // Calculate absolute position based on viewport
            setDropdownStyles({
                position: 'fixed',
                top: direction === 'down' ? rect.bottom + 8 : 'auto',
                bottom: direction === 'up' ? window.innerHeight - rect.top + 8 : 'auto',
                left: rect.left,
                width: rect.width,
                zIndex: 999999,
                opacity: 1,
                pointerEvents: 'auto'
            });
        }
    };

    useLayoutEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);
        } else {
            setDropdownStyles(prev => ({ ...prev, opacity: 0, pointerEvents: 'none' }));
        }
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen, direction]);

    const selectedOption = options.find(opt => opt.value === value) || null;

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div ref={selectRef} className={`relative w-full ${isOpen ? 'z-[100]' : 'z-[10]'} ${className}`}>
            {label && <label className="block text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 mb-2">{label}</label>}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 shadow-sm outline-none bg-secondary/20 hover:bg-white ${
                    isOpen 
                        ? 'border-primary ring-4 ring-primary/5 bg-white' 
                        : 'border-primary/5 hover:border-primary/20'
                }`}
            >
                <div className="flex items-center gap-3 w-full">
                    {Icon && <Icon className="w-5 h-5 text-primary/40 shrink-0" />}
                    <span className={`font-medium text-sm truncate ${selectedOption ? 'text-primary' : 'text-primary/40'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-primary/40 shrink-0 ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu using Portal */}
            {isOpen && createPortal(
                <div 
                    ref={dropdownRef}
                    style={dropdownStyles}
                    className={`bg-white border border-primary/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-200`}
                >
                    {/* Search Bar */}
                    {searchable && (
                        <div className="p-3 border-b border-primary/5 bg-gray-50">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                                <input
                                    type="text"
                                    placeholder="Cari..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-primary/5 text-xs font-medium text-primary placeholder:text-primary/30 focus:ring-2 focus:ring-primary/10 outline-none transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    <div className="max-h-[250px] overflow-y-auto scrollbar-hide py-2">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => {
                                const isSelected = option.value === value;
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-all duration-200 hover:bg-primary/5 group ${
                                            isSelected ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        <span className={`font-medium text-sm group-hover:text-primary transition-colors ${
                                            isSelected ? 'text-primary' : 'text-primary/60'
                                        }`}>
                                            {option.label}
                                        </span>
                                        {isSelected && (
                                            <Check className="w-5 h-5 text-primary animate-fade-in" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-5 py-6 text-center text-xs font-medium text-primary/40 uppercase tracking-widest">
                                Tidak ada pilihan
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* Hidden native input for required validation */}
            {required && (
                <input
                    type="text"
                    className="absolute opacity-0 h-0 w-0 bottom-0"
                    value={value || ''}
                    onChange={() => { }}
                    required={required}
                    onInvalid={(e) => e.target.setCustomValidity('Harap pilih salah satu')}
                    onInput={(e) => e.target.setCustomValidity('')}
                />
            )}
        </div>
    );
};

export default CustomSelect;
