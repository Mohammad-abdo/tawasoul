import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { assessments } from '../../api/admin';
import HelpSkillFormModal from './HelpSkillFormModal';
import { HELP_DOMAIN_LABELS } from './testManagement.utils';

const tableClassName = 'w-full table-fixed divide-y divide-gray-200';
const thClassName = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 align-middle';
const tdClassName = 'px-4 py-4 text-sm text-gray-800 align-middle';

const HelpTestSkillsPanel = ({ testId, skills }) => {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
      queryClient.invalidateQueries({ queryKey: ['dashboard-test-detail', testId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-tests-list'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Could not save skill.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => assessments.deleteHelpSkill(deleteTarget.id),
    onSuccess: () => {
      toast.success('Skill deleted.');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['dashboard-test-detail', testId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-tests-list'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Could not delete skill.');
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
      <div className="flex justify-end">
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
              <th className={`${thClassName} w-28 text-center`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {skills.map((row) => (
              <tr key={row.id}>
                <td className={tdClassName}>{HELP_DOMAIN_LABELS[row.domain] || row.domain}</td>
                <td className={tdClassName}>{row.skillNumber}</td>
                <td className={`${tdClassName} text-center`}>
                  <div className="whitespace-normal text-gray-800">{row.description}</div>
                </td>
                <td className={`${tdClassName} text-right`}>{row.ageRange || '—'}</td>
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
                      onClick={() => setDeleteTarget(row)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      aria-label="Delete skill"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete HELP skill" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">This removes the skill from the catalog. It cannot be deleted if it has been used in evaluations.</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setDeleteTarget(null)} className="btn-secondary sm:w-28">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 sm:w-32"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HelpTestSkillsPanel;
