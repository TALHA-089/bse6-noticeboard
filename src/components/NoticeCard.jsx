import { useState } from 'react';
import { supabase } from '../supabaseClient.js';

const categoryClassMap = {
  Academic: 'tag--academic',
  Event: 'tag--event',
  Urgent: 'tag--urgent',
  General: 'tag--general',
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

function NoticeCard({ notice, session, onNoticeDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const canDelete = session?.user?.id === notice.user_id;
  const profile = Array.isArray(notice.profiles) ? notice.profiles[0] : notice.profiles;
  const authorName = profile?.display_name || profile?.email || 'Unknown author';

  const handleDelete = async () => {
    setError('');
    setIsDeleting(true);

    const { error: deleteError } = await supabase
      .from('notices')
      .delete()
      .eq('id', notice.id)
      .eq('user_id', session.user.id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      onNoticeDeleted(notice.id);
    }

    setIsDeleting(false);
  };

  return (
    <article className="notice-card">
      <div className="notice-card__meta">
        <span className={`tag ${categoryClassMap[notice.category] ?? 'tag--general'}`}>
          {notice.category}
        </span>
        <time dateTime={notice.created_at}>{dateFormatter.format(new Date(notice.created_at))}</time>
      </div>

      <h3>{notice.title}</h3>
      <p>{notice.body}</p>

      <div className="notice-card__footer">
        <span className="notice-author">Posted by {authorName}</span>
        {canDelete ? (
          <button
            type="button"
            className="button button--danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        ) : null}
      </div>

      {error ? <p className="alert alert--error">{error}</p> : null}
    </article>
  );
}

export default NoticeCard;
