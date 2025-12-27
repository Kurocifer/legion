import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({ trigger, children, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ icon, label, onClick, danger = false }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
      }`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

export const DropdownDivider = () => {
  return <div className="my-1 border-t border-gray-200" />;
};

export default Dropdown;