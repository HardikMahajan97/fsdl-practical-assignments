import { useState, useEffect } from 'react';

const TYPES = ['Video', 'Article', 'Documentation', 'Notes'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const emptyForm = {
  title: '',
  subject: '',
  type: '',
  link: '',
  difficulty: '',
  description: '',
};

export default function ResourceForm({ initialData, onSubmit, submitLabel = 'Save' }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        subject: initialData.subject || '',
        type: initialData.type || '',
        link: initialData.link || '',
        difficulty: initialData.difficulty || '',
        description: initialData.description || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.type) errs.type = 'Type is required';
    if (!form.difficulty) errs.difficulty = 'Difficulty is required';
    if (form.link && form.link.trim()) {
      try {
        const url = new URL(form.link.trim());
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          errs.link = 'Link must start with http:// or https://';
        }
      } catch {
        errs.link = 'Link must be a valid URL';
      }
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  };

  return (
    <form className="resource-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Introduction to React Hooks"
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="subject">Subject *</label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={handleChange}
          placeholder="e.g. Web Development"
        />
        {errors.subject && <span className="field-error">{errors.subject}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="type">Type *</label>
          <select id="type" name="type" value={form.type} onChange={handleChange}>
            <option value="">-- Select Type --</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.type && <span className="field-error">{errors.type}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="difficulty">Difficulty *</label>
          <select id="difficulty" name="difficulty" value={form.difficulty} onChange={handleChange}>
            <option value="">-- Select Difficulty --</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.difficulty && <span className="field-error">{errors.difficulty}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="link">Link (optional)</label>
        <input
          id="link"
          name="link"
          type="url"
          value={form.link}
          onChange={handleChange}
          placeholder="https://example.com"
        />
        {errors.link && <span className="field-error">{errors.link}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="Short notes about this resource..."
        />
      </div>

      <button type="submit" className="btn btn-primary">
        {submitLabel}
      </button>
    </form>
  );
}
