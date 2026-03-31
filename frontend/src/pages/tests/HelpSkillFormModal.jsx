import { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import { HELP_DOMAINS, HELP_DOMAIN_LABELS } from './testManagement.utils';

const emptyForm = () => ({
  domain: 'COGNITIVE',
  skillNumber: '',
  description: '',
  ageRange: '',
});

const inputClassName = 'input w-full';
const labelClassName = 'label';

const HelpSkillFormModal = ({ isOpen, onClose, isSubmitting, initialSkill, onSubmit }) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    if (initialSkill) {
      setForm({
        domain: initialSkill.domain || 'COGNITIVE',
        skillNumber: initialSkill.skillNumber ?? '',
        description: initialSkill.description ?? '',
        ageRange: initialSkill.ageRange ?? '',
      });
    } else {
      setForm(emptyForm());
    }
  }, [isOpen, initialSkill]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSkill ? 'Edit HELP skill' : 'Add HELP skill'}
      size="lg"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(form);
        }}
        className="space-y-4"
      >
        <div>
          <label className={labelClassName} htmlFor="help-domain">
            Domain
          </label>
          <select
            id="help-domain"
            className={inputClassName}
            value={form.domain}
            onChange={(event) => setField('domain', event.target.value)}
            required
          >
            {HELP_DOMAINS.map((domain) => (
              <option key={domain} value={domain}>
                {HELP_DOMAIN_LABELS[domain] || domain}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClassName} htmlFor="help-skill-number">
            Skill number
          </label>
          <input
            id="help-skill-number"
            type="text"
            className={inputClassName}
            value={form.skillNumber}
            onChange={(event) => setField('skillNumber', event.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor="help-description">
            Description
          </label>
          <textarea
            id="help-description"
            className={`${inputClassName} min-h-[100px]`}
            value={form.description}
            onChange={(event) => setField('description', event.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor="help-age-range">
            Age range (e.g. 3.0-3.6)
          </label>
          <input
            id="help-age-range"
            type="text"
            className={inputClassName}
            value={form.ageRange}
            onChange={(event) => setField('ageRange', event.target.value)}
            placeholder="3.0-3.6"
            required
          />
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary sm:w-28">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary sm:w-40">
            {isSubmitting ? 'Saving...' : initialSkill ? 'Save changes' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default HelpSkillFormModal;
