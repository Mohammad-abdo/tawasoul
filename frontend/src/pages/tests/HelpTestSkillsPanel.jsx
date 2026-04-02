import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { assessments } from '../../api/admin';
import HelpSkillFormModal from './HelpSkillFormModal';
import { HELP_DOMAIN_LABELS } from './testManagement.utils';

const tableClassName = 'w-full table-fixed divide-y divide-gray-200';
const thClassName = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 align-middle';
const tdClassName = 'px-4 py-4 text-sm text-gray-800 align-middle';

const HelpTestSkillsPanel = ({ testId, skills = [] }) => {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const { data: fetchedSkills = skills, isLoading } = useQuery({
    queryKey: ['help-skills', testId, showArchived],
    queryFn: async () => {
      const response = await assessments.getHelpSkills({
        includeArchived: showArchived,
      });
      return response.data.data || [];
    },
    initialData: skills,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingSkill) {
        return assessments.updateHelpSkill(editingSkill.id, payload);
      }
      return assessments.createHelpSkill(payload);
    },
    onSuccess: () => {
      toast.success(editingSkill ? 'Skill updated.' : 'Skill created.');
      setFormOpen(false);
      setEditingSkill(null);
      queryClient.invalidateQueries({ queryKey: ['help-skills', testId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-test-detail', testId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-tests-list'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Could not save skill.');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ skillId, isActive }) => {
      if (isActive) {
        const response = await assessments.deactivateHelpSkill(skillId);
        return response.data.data;
      }

      const response = await assessments.activateHelpSkill(skillId);
      return response.data.data;
    },
    onMutate: async ({ skillId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ['help-skills', testId] });

      const previousQueries = queryClient.getQueriesData({ queryKey: ['help-skills', testId] });
      const nextArchivedAt = isActive ? new Date().toISOString() : null;

      queryClient.setQueriesData({ queryKey: ['help-skills', testId] }, (current) => {
        if (!Array.isArray(current)) return current;

        const updated = current.map((skill) =>
          skill.id === skillId ? { ...skill, archivedAt: nextArchivedAt } : skill
        );

        return showArchived ? updated : updated.filter((skill) => skill.archivedAt === null);
      });

      return { previousQueries };
    },
    onSuccess: (updatedSkill) => {
      toast.success(updatedSkill.archivedAt ? 'Skill deactivated.' : 'Skill activated.');

      queryClient.setQueriesData({ queryKey: ['help-skills', testId] }, (current) => {
        if (!Array.isArray(current)) return current;

        const next = current.map((skill) => (skill.id === updatedSkill.id ? updatedSkill : skill));
        return showArchived ? next : next.filter((skill) => skill.archivedAt === null);
      });

      queryClient.invalidateQueries({ queryKey: ['dashboard-test-detail', testId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-tests-list'] });
    },
    onError: (error, _variables, context) => {
      toast.error(error.response?.data?.error?.message || 'Could not update skill status.');

      context?.previousQueries?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });

  const openCreate = () => {
    setEditingSkill(null);
    setFormOpen(true);
  };

  const openEdit = (skill) => {
    setEditingSkill(skill);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="inline-flex w-fit items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(event) => setShowArchived(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Show Archived
        </label>

        <button type="button" onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
          <Plus size={18} />
          Add skill
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className={tableClassName}>
          <thead className="bg-gray-50">
            <tr>
              <th className={`${thClassName} w-44 text-right`}>Domain</th>
              <th className={`${thClassName} w-28 text-right`}>Skill #</th>
              <th className={`${thClassName} w-full text-center`}>Description</th>
              <th className={`${thClassName} w-36 text-right`}>Age range</th>
              <th className={`${thClassName} w-28 text-center`}>Status</th>
              <th className={`${thClassName} w-28 text-center`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {fetchedSkills.map((row) => {
              const isActive = !row.archivedAt;

              return (
                <tr key={row.id} className={isActive ? '' : 'bg-gray-50 text-gray-500'}>
                  <td className={tdClassName}>{HELP_DOMAIN_LABELS[row.domain] || row.domain}</td>
                  <td className={tdClassName}>{row.skillNumber}</td>
                  <td className={`${tdClassName} text-center`}>
                    <div className={`whitespace-normal ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>
                      {row.description}
                    </div>
                  </td>
                  <td className={`${tdClassName} text-right`}>{row.ageRange || '—'}</td>
                  <td className={`${tdClassName} text-center`}>
                    {isActive ? (
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className={`${tdClassName} text-center`}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        aria-label="Edit skill"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatusMutation.mutate({ skillId: row.id, isActive })}
                        disabled={toggleStatusMutation.isPending}
                        className={`rounded-lg p-2 disabled:opacity-60 ${
                          isActive
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        aria-label={isActive ? 'Deactivate skill' : 'Activate skill'}
                      >
                        {isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!fetchedSkills.length && !isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  No skills found for the current filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500">
          Loading skills...
        </div>
      ) : null}

      <HelpSkillFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingSkill(null);
        }}
        isSubmitting={saveMutation.isPending}
        initialSkill={editingSkill}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />
    </div>
  );
};

export default HelpTestSkillsPanel;
