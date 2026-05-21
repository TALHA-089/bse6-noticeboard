import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient.js';
import NoticeCard from './NoticeCard.jsx';
import NoticeForm from './NoticeForm.jsx';

const categories = ['All', 'Academic', 'Event', 'Urgent', 'General'];
const noticeSelect = '*, profiles(display_name, email)';

function NoticeBoard({ session, authPanel = null, authFallback = null }) {
  const [notices, setNotices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const upsertNotice = useCallback((notice) => {
    setNotices((currentNotices) => {
      const alreadyExists = currentNotices.some((currentNotice) => currentNotice.id === notice.id);
      const nextNotices = alreadyExists
        ? currentNotices.map((currentNotice) =>
            currentNotice.id === notice.id ? notice : currentNotice,
          )
        : [notice, ...currentNotices];

      return nextNotices.sort((firstNotice, secondNotice) => {
        return new Date(secondNotice.created_at) - new Date(firstNotice.created_at);
      });
    });
  }, []);

  const fetchNoticeById = useCallback(async (noticeId) => {
    const { data, error: fetchError } = await supabase
      .from('notices')
      .select(noticeSelect)
      .eq('id', noticeId)
      .single();

    if (fetchError) {
      setError(fetchError.message);
      return null;
    }

    return data;
  }, []);

  const fetchNotices = useCallback(async () => {
    setError('');
    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from('notices')
      .select(noticeSelect)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setNotices(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  useEffect(() => {
    const channel = supabase
      .channel('public:notices')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notices' },
        async (payload) => {
          const noticeWithProfile = await fetchNoticeById(payload.new.id);

          if (noticeWithProfile) {
            upsertNotice(noticeWithProfile);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNoticeById, upsertNotice]);

  const visibleNotices = useMemo(() => {
    if (selectedCategory === 'All') {
      return notices;
    }

    return notices.filter((notice) => notice.category === selectedCategory);
  }, [notices, selectedCategory]);

  const handleNoticeCreated = async (notice) => {
    const noticeWithProfile = await fetchNoticeById(notice.id);
    upsertNotice(noticeWithProfile ?? notice);
  };

  const handleNoticeDeleted = (noticeId) => {
    setNotices((currentNotices) => currentNotices.filter((notice) => notice.id !== noticeId));
  };

  return (
    <div className="board-layout">
      <aside className="composer-column">
        {session ? <NoticeForm session={session} onNoticeCreated={handleNoticeCreated} /> : null}
        {!session ? authPanel ?? authFallback : null}
      </aside>

      <section className="feed-column" aria-label="Notice feed">
        <div className="feed-toolbar">
          <div>
            <p className="eyebrow">Realtime feed</p>
            <h2>Latest notices</h2>
          </div>

          <div className="category-filter" aria-label="Filter by category">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={selectedCategory === category ? 'active' : ''}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="alert alert--error">{error}</p> : null}
        {loading ? <p className="empty-state">Loading notices...</p> : null}
        {!loading && visibleNotices.length === 0 ? (
          <p className="empty-state">No notices in this category yet.</p>
        ) : null}

        <div className="notice-list">
          {visibleNotices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              session={session}
              onNoticeDeleted={handleNoticeDeleted}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default NoticeBoard;
