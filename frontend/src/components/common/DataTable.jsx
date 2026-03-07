import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Download,
  Edit,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  Loader2,
  Filter,
  X,
  FileText,
  FileSpreadsheet,
  Calendar,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

const DataTable = ({
  data = [],
  columns = [],
  isLoading = false,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  actions = [],
  searchable = true,
  filterable = false,
  exportable = false,
  pagination = true,
  pageSize: initialPageSize = 10,
  emptyMessage = 'لا توجد بيانات',
  title = '',
  filters = [], // Array of filter configs: { key, label, type: 'text'|'select'|'date'|'dateRange'|'number'|'numberRange'|'boolean'|'multiSelect', options?: [] }
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState({});
  const [dateRangeFilters, setDateRangeFilters] = useState({});
  const [numberRangeFilters, setNumberRangeFilters] = useState({});
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  // Reset to page 1 when page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // Initialize column filters from filters prop
  const filterConfigs = useMemo(() => {
    if (filters && filters.length > 0) return filters;
    // Auto-generate filters from columns
    return columns
      .filter(col => col.filterable !== false && col.accessor)
      .map(col => ({
        key: col.accessor,
        label: col.header || col.label,
        type: col.filterType || 'text',
        options: col.filterOptions,
      }));
  }, [filters, columns]);

  // Apply all filters
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Global search
      if (searchTerm) {
        const matchesSearch = columns.some((col) => {
          const value = col.accessor ? row[col.accessor] : '';
          if (col.render) {
            // For rendered columns, try to extract text
            try {
              const rendered = col.render(row);
              if (typeof rendered === 'string') {
                return rendered.toLowerCase().includes(searchTerm.toLowerCase());
              }
            } catch (e) {
              // Ignore render errors
            }
          }
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
        if (!matchesSearch) return false;
      }

      // Column filters
      for (const [key, value] of Object.entries(columnFilters)) {
        if (!value || value === '' || value === null || (Array.isArray(value) && value.length === 0)) continue;
        const filterConfig = filterConfigs.find(f => f.key === key);
        if (!filterConfig) continue;

        const rowValue = row[key];
        
        switch (filterConfig.type) {
          case 'text':
            if (!String(rowValue || '').toLowerCase().includes(String(value).toLowerCase())) {
              return false;
            }
            break;
          case 'select':
            if (String(rowValue) !== String(value)) {
              return false;
            }
            break;
          case 'multiSelect':
            if (Array.isArray(value) && !value.includes(String(rowValue))) {
              return false;
            }
            break;
          case 'number':
            const numValue = Number(value);
            if (isNaN(numValue) || Number(rowValue) !== numValue) {
              return false;
            }
            break;
          case 'boolean':
            const boolValue = value === 'true' || value === true;
            if (Boolean(rowValue) !== boolValue) {
              return false;
            }
            break;
          case 'date':
            if (rowValue) {
              const rowDate = new Date(rowValue).toDateString();
              const filterDate = new Date(value).toDateString();
              if (rowDate !== filterDate) {
                return false;
              }
            }
            break;
        }
      }

      // Date range filters
      for (const [key, range] of Object.entries(dateRangeFilters)) {
        if (!range.from && !range.to) continue;
        const rowValue = row[key];
        if (!rowValue) return false;
        
        const rowDate = new Date(rowValue);
        if (range.from && rowDate < new Date(range.from)) return false;
        if (range.to) {
          const toDate = new Date(range.to);
          toDate.setHours(23, 59, 59, 999); // Include full day
          if (rowDate > toDate) return false;
        }
      }

      // Number range filters
      for (const [key, range] of Object.entries(numberRangeFilters)) {
        if (range.min === '' && range.max === '') continue;
        const rowValue = Number(row[key]);
        if (isNaN(rowValue)) return false;
        
        if (range.min !== '' && rowValue < Number(range.min)) return false;
        if (range.max !== '' && rowValue > Number(range.max)) return false;
      }

      return true;
    });
  }, [data, searchTerm, columnFilters, dateRangeFilters, numberRangeFilters, columns, filterConfigs]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = pagination ? sortedData.slice(startIndex, endIndex) : sortedData;

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleFilterChange = (key, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const handleMultiSelectChange = (key, optionValue, checked) => {
    setColumnFilters(prev => {
      const current = prev[key] || [];
      const newValue = checked
        ? [...current, optionValue]
        : current.filter(v => v !== optionValue);
      return {
        ...prev,
        [key]: newValue.length > 0 ? newValue : null
      };
    });
    setCurrentPage(1);
  };

  const handleDateRangeChange = (key, type, value) => {
    setDateRangeFilters(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [type]: value
      }
    }));
    setCurrentPage(1);
  };

  const handleNumberRangeChange = (key, type, value) => {
    setNumberRangeFilters(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [type]: value
      }
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setColumnFilters({});
    setDateRangeFilters({});
    setNumberRangeFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.keys(columnFilters).length > 0 || 
                          Object.keys(dateRangeFilters).length > 0 || 
                          Object.keys(numberRangeFilters).length > 0 ||
                          searchTerm;

  // Export to CSV
  const exportToCSV = () => {
    const headers = columns.map(col => col.header || col.label || col.accessor);
    const rows = sortedData.map(row => 
      columns.map(col => {
        const value = col.accessor ? row[col.accessor] : '';
        if (col.render) {
          // For rendered columns, try to extract text
          try {
            const rendered = col.render(row);
            if (typeof rendered === 'string') return rendered;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = typeof rendered === 'object' ? JSON.stringify(rendered) : String(rendered);
            return tempDiv.textContent || tempDiv.innerText || '';
          } catch (e) {
            return String(value || '');
          }
        }
        return value || '';
      })
    );

    const csv = Papa.unparse({
      fields: headers,
      data: rows
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title || 'export'}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    if (title) {
      doc.setFontSize(16);
      doc.text(title, 14, 15);
      doc.setFontSize(10);
      doc.text(`تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}`, 14, 22);
    }

    const headers = columns.map(col => col.header || col.label || col.accessor);
    const rows = sortedData.map(row => 
      columns.map(col => {
        const value = col.accessor ? row[col.accessor] : '';
        if (col.render) {
          try {
            const rendered = col.render(row);
            if (typeof rendered === 'string') return rendered;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = typeof rendered === 'object' ? JSON.stringify(rendered) : String(rendered);
            return tempDiv.textContent || tempDiv.innerText || String(value);
          } catch (e) {
            return String(value || '');
          }
        }
        return String(value || '');
      })
    );

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: title ? 28 : 15,
      styles: { 
        font: 'Arial',
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [249, 250, 251],
        textColor: [55, 65, 81],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      margin: { top: title ? 28 : 15 },
    });

    doc.save(`${title || 'export'}-${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportMenu(false);
  };

  // Determine column alignment
  const getColumnAlignment = (column) => {
    if (column.align) return column.align;
    if (column.accessor) {
      const sampleValue = data[0]?.[column.accessor];
      if (typeof sampleValue === 'number') return 'text-right';
    }
    return 'text-right';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-gray-400 mb-3" size={24} />
            <p className="text-sm text-gray-500 font-medium">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      {(title || searchable || exportable || filterable) && (
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {title && (
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {searchable && (
                  <div className="relative">
                    <Search className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="بحث..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                )}
                {filterable && filterConfigs.length > 0 && (
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md transition-colors ${
                      showFilters || hasActiveFilters
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                    <span>فلتر</span>
                    {hasActiveFilters && (
                      <span className="bg-white text-gray-900 rounded-full px-1.5 py-0.5 text-xs">
                        {Object.keys(columnFilters).length + Object.keys(dateRangeFilters).length + Object.keys(numberRangeFilters).length + (searchTerm ? 1 : 0)}
                      </span>
                    )}
                  </button>
                )}
                {exportable && (
                  <div className="relative" ref={exportMenuRef}>
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Download size={14} />
                      <span className="hidden sm:inline">تصدير</span>
                      <ChevronDown size={12} />
                    </button>
                    {showExportMenu && (
                      <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                        <button
                          onClick={exportToCSV}
                          className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FileSpreadsheet size={14} />
                          <span>تصدير CSV</span>
                        </button>
                        <button
                          onClick={exportToPDF}
                          className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                        >
                          <FileText size={14} />
                          <span>تصدير PDF</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && filterConfigs.length > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filterConfigs.map((filter) => (
                    <div key={filter.key}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {filter.label}
                      </label>
                      {filter.type === 'text' && (
                        <input
                          type="text"
                          value={columnFilters[filter.key] || ''}
                          onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                          placeholder={`فلترة ${filter.label}...`}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-900"
                        />
                      )}
                      {filter.type === 'select' && (
                        <select
                          value={columnFilters[filter.key] || ''}
                          onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-900"
                        >
                          <option value="">الكل</option>
                          {filter.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {filter.type === 'multiSelect' && (
                        <div className="border border-gray-300 rounded-md p-2 max-h-32 overflow-y-auto bg-white">
                          {filter.options?.map(opt => {
                            const isSelected = (columnFilters[filter.key] || []).includes(opt.value);
                            return (
                              <label key={opt.value} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => handleMultiSelectChange(filter.key, opt.value, e.target.checked)}
                                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">{opt.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                      {filter.type === 'number' && (
                        <input
                          type="number"
                          value={columnFilters[filter.key] || ''}
                          onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                          placeholder={`فلترة ${filter.label}...`}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-900"
                        />
                      )}
                      {filter.type === 'numberRange' && (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={numberRangeFilters[filter.key]?.min || ''}
                            onChange={(e) => handleNumberRangeChange(filter.key, 'min', e.target.value)}
                            placeholder="من"
                            className="flex-1 px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-900"
                          />
                          <input
                            type="number"
                            value={numberRangeFilters[filter.key]?.max || ''}
                            onChange={(e) => handleNumberRangeChange(filter.key, 'max', e.target.value)}
                            placeholder="إلى"
                            className="flex-1 px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-900"
                          />
                        </div>
                      )}
                      {filter.type === 'boolean' && (
                        <select
                          value={columnFilters[filter.key] || ''}
                          onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-900"
                        >
                          <option value="">الكل</option>
                          <option value="true">نعم</option>
                          <option value="false">لا</option>
                        </select>
                      )}
                      {filter.type === 'date' && (
                        <input
                          type="date"
                          value={columnFilters[filter.key] || ''}
                          onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-900"
                        />
                      )}
                      {filter.type === 'dateRange' && (
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={dateRangeFilters[filter.key]?.from || ''}
                            onChange={(e) => handleDateRangeChange(filter.key, 'from', e.target.value)}
                            placeholder="من"
                            className="flex-1 px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-900"
                          />
                          <input
                            type="date"
                            value={dateRangeFilters[filter.key]?.to || ''}
                            onChange={(e) => handleDateRangeChange(filter.key, 'to', e.target.value)}
                            placeholder="إلى"
                            className="flex-1 px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-900"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {hasActiveFilters && (
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={clearFilters}
                      className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <X size={12} />
                      <span>مسح جميع الفلاتر</span>
                    </button>
                    <span className="text-xs text-gray-500">
                      {sortedData.length} نتيجة
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto data-table-container">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider ${getColumnAlignment(column)} ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 transition-colors select-none' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.accessor || column.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{column.header || column.label}</span>
                    {column.sortable !== false && sortConfig.key === (column.accessor || column.key) && (
                      <span className="text-gray-500">
                        {sortConfig.direction === 'asc' ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || onView || actions.length > 0) && (
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-center w-24">
                  الإجراءات
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`transition-colors ${
                    rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  } ${
                    selectedRows.includes(rowIndex) ? 'bg-blue-50' : ''
                  } ${
                    onRowClick ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`px-4 py-3 text-sm text-gray-900 ${getColumnAlignment(column)} ${
                        column.nowrap !== false ? 'whitespace-nowrap' : ''
                      }`}
                    >
                      {column.render ? (
                        column.render(row)
                      ) : column.cell ? (
                        column.cell(row)
                      ) : (
                        <span className="text-gray-900">
                          {column.accessor ? row[column.accessor] : '-'}
                        </span>
                      )}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView || actions.length > 0) && (
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onView && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(row);
                            }}
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                            title="عرض"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(row);
                            }}
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                            title="تعديل"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(row);
                            }}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        {actions
                          .filter((action) => !action.show || action.show(row))
                          .map((action, actionIndex) => {
                            const className = typeof action.className === 'function' 
                              ? action.className(row) 
                              : action.className || 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
                            const label = typeof action.label === 'function' 
                              ? action.label(row) 
                              : action.label;
                            const IconComponent = typeof action.icon === 'function' 
                              ? action.icon(row) 
                              : action.icon;
                            return (
                              <button
                                key={actionIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(row);
                                }}
                                className={`p-1.5 rounded transition-colors ${className}`}
                                title={label}
                              >
                                {IconComponent && <IconComponent size={14} />}
                              </button>
                            );
                          })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete || onView || actions.length > 0 ? 1 : 0)}
                  className="px-6 py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Search className="text-gray-400" size={20} />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">{emptyMessage}</p>
                    {(searchTerm || hasActiveFilters) && (
                      <p className="text-xs text-gray-500">
                        لا توجد نتائج للبحث أو الفلاتر المحددة
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && sortedData.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-600">
                عرض <span className="font-medium text-gray-900">{startIndex + 1}</span> إلى{' '}
                <span className="font-medium text-gray-900">{Math.min(endIndex, sortedData.length)}</span> من{' '}
                <span className="font-medium text-gray-900">{sortedData.length}</span>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">عناصر في الصفحة:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-900"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={sortedData.length}>الكل</option>
                  </select>
                </div>
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-300 rounded disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                  title="الصفحة الأولى"
                >
                  <ChevronsRight size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-300 rounded disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                  title="السابق"
                >
                  <ChevronRight size={16} />
                </button>
                <span className="px-3 py-1.5 text-xs text-gray-700 font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-300 rounded disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                  title="التالي"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-300 rounded disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                  title="الصفحة الأخيرة"
                >
                  <ChevronsLeft size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
