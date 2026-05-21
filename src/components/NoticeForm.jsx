import { useState } from 'react';
import { supabase } from '../supabaseClient.js';

const categories = ['Academic', 'Event', 'Urgent', 'General'];

function NoticeForm({ session, onNoticeCreated }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('notices')
      .insert({
        user_id: session.user.id,
        title: title.trim(),
        body: body.trim(),
        category,
      })
      .select()
      .single();

    if (error) {
      setStatus(error.message);
    } else {
      setTitle('');
      setBody('');
      setCategory('General');
      setStatus('Notice posted.');
      onNoticeCreated(data);
    }

    setIsSubmitting(false);
  };

  return (
    <section className="notice-form-panel">
      <p className="eyebrow">New post</p>
      <h2>Create notice</h2>

      <form className="stack" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Midterm schedule posted"
            maxLength={120}
            required
          />
        </label>

        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)} required>
            {categories.map((categoryName) => (
              <option key={categoryName} value={categoryName}>
                {categoryName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Body
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Add the details students need to know."
            rows={7}
            required
          />
        </label>

        <button type="submit" className="button button--primary" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post notice'}
        </button>
      </form>

      {status ? <p className="form-message">{status}</p> : null}
    </section>
  );
}

export default NoticeForm;
