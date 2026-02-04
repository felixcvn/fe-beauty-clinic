import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

const CustomSelect = ({ label, value, onChange, options, placeholder, icon: Icon, required, searchable = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="space-y-2 relative" ref={dropdownRef}>
            {label && <label className="text-sm font-medium text-primary">{label}</label>}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-3 rounded-xl border border-secondary-dark/20 bg-secondary-light/30 flex items-center justify-between cursor-pointer transition-all hover:border-primary/30 ${isOpen ? 'ring-2 ring-primary/20 border-primary/40' : ''}`}
            >
                <div className="flex items-center gap-2 truncate">
                    {Icon && <Icon className="w-5 h-5 text-primary-light" />}
                    {selectedOption ? (
                        <span className="text-primary font-medium">{selectedOption.label}</span>
                    ) : (
                        <span className="text-primary-light/70">{placeholder || 'Select...'}</span>
                    )}
                </div>
                <ChevronDown className={`w-5 h-5 text-primary-light transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-secondary-dark/10 max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                    {/* Search Bar (if enabled) */}
                    {searchable && (
                        <div className="p-2 border-b border-secondary-dark/10">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-light" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary-light border-none text-sm text-primary placeholder:text-primary-light/50 focus:ring-1 focus:ring-primary/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    {/* Options List */}
                    <div className="overflow-y-auto max-h-48 p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${value === option.value ? 'bg-primary/5 text-primary font-semibold' : 'text-primary hover:bg-secondary-light'}`}
                                >
                                    <span>{option.label}</span>
                                    {value === option.value && <Check className="w-4 h-4 text-primary" />}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-primary-light">No options found</div>
                        )}
                    </div>
                </div>
            )}

            {/* Hidden native input for required validation if needed, though typically handled by state */}
            {required && (
                <input
                    type="text"
                    className="absolute opacity-0 h-0 w-0 bottom-0"
                    value={value}
                    onChange={() => { }}
                    required={required}
                    onInvalid={(e) => e.target.setCustomValidity('Please select an option')}
                    onInput={(e) => e.target.setCustomValidity('')}
                />
            )}
        </div>
    );
};

export default CustomSelect;
