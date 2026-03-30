import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DataTable from '../../components/common/DataTable';
import { assessments } from '../../api/admin';
import { MODALITY_LABELS, TEST_TYPE_LABELS } from './testManagement.utils';

const TEST_TYPE_OPTIONS = Object.entries(TEST_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const TestsList = () => {
  const navigate = useNavigate();
  const [testTypeFilter, setTestTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-tests-list', testTypeFilter],
    queryFn: async () => {
      const response = await assessments.getTests(testTypeFilter ? { testType: testTypeFilter } : undefined);
      return response.data.data || [];
    },
  });

  const columns = [
    {
      header: 'Title (Arabic)',
      accessor: 'titleAr',
      render: (row) => row.titleAr || '-',
    },
    {
      header: 'Title (English)',
      accessor: 'title',
      render: (row) => row.title || '-',
    },
    {
      header: 'Test Type',
      accessor: 'testType',
      render: (row) => TEST_TYPE_LABELS[row.testType] || row.testType,
    },
    {
      header: 'Modality',
      accessor: 'type',
      render: (row) => MODALITY_LABELS[row.type] || row.type,
    },
    {
      header: 'Questions',
      accessor: 'questionCount',
      render: (row) => row.questionCount ?? 0,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      render: (row) => (
        <button
          type="button"
          onClick={() => navigate(`/dashboard/tests/${row.id}`)}
          className="rounded-lg bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tests</h2>
          <p className="mt-1 text-sm text-gray-500">
            Browse all tests and open any test to manage its questions.
          </p>
        </div>

        <div className="w-full md:max-w-xs">
          <label className="label">Filter by test type</label>
          <select
            value={testTypeFilter}
            onChange={(event) => setTestTypeFilter(event.target.value)}
            className="input"
          >
            <option value="">All test types</option>
            {TEST_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card">
        <DataTable
          data={data || []}
          columns={columns}
          isLoading={isLoading}
          searchable={true}
          filterable={false}
          pagination={true}
          pageSize={10}
          title="All Tests"
          emptyMessage="No tests found."
        />
      </div>
    </div>
  );
};

export default TestsList;
