import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../../../entities/todo-list/api';
import { Sidebar } from '../../../widgets/sidebar/ui/Sidebar';
import { TodoListWidget } from '../../../widgets/todolist/ui/TodoListWidget';
import type { TodoList } from '../../../entities/todo-list/model/types';
import { ChevronLeft, Menu, Loader2, CheckCircle } from 'lucide-react';
import { ROUTES } from '../../../shared/config/routes';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
  const { slug: activeListSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [ownedLists, setOwnedLists] = useState<TodoList[]>([]);
  const [sharedLists, setSharedLists] = useState<TodoList[]>([]);
  const [newListName, setNewListName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreatingList, setIsCreatingList] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const res = await api.getTodoLists();
      setOwnedLists(res.data.owned);
      setSharedLists(res.data.shared);

      if (activeListSlug) {
        const allLists = [...res.data.owned, ...res.data.shared];
        const stillExists = allLists.find(l => l.slug === activeListSlug);
        if (!stillExists) {
          navigate(ROUTES.DASHBOARD);
        }
      }
    } catch (err) {
      console.error('Error fetching lists', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setIsCreatingList(true);
    try {
      const res = await api.createTodoList(newListName.trim());
      setNewListName('');
      await fetchLists();
      navigate(ROUTES.LIST_DETAIL.replace(':slug', res.data.slug));
      setIsMobileSidebarOpen(false);
    } catch (err) {
      console.error('Error creating list', err);
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleDeleteList = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this list?')) return;

    try {
      const listToDelete = allLists.find(l => l.id === id);
      await api.deleteTodoList(id);
      if (listToDelete && activeListSlug === listToDelete.slug) {
        navigate(ROUTES.DASHBOARD);
      }
      await fetchLists();
    } catch (err) {
      console.error('Error deleting list', err);
    }
  };

  const allLists = [...ownedLists, ...sharedLists];
  const activeList = allLists.find((list) => list.slug === activeListSlug);

  const handleSelectList = (slug: string) => {
    navigate(ROUTES.LIST_DETAIL.replace(':slug', slug));
    setIsMobileSidebarOpen(false);
  };

  const totalListsCount = ownedLists.length + sharedLists.length;
  const totalTasksCount = allLists.reduce((acc, curr) => acc + curr.todos.length, 0);
  const completedTasksCount = allLists.reduce(
    (acc, curr) => acc + curr.todos.filter((t) => t.status === 'COMPLETED').length,
    0,
  );

  return (
    <div className={`${styles.dashboardLayout} ${isMobileSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <button
        className={`${styles.mobileToggleBtn} btn-icon glass`}
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        title="Menu"
      >
        {isMobileSidebarOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
      </button>

      {isMobileSidebarOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        ownedLists={ownedLists}
        sharedLists={sharedLists}
        activeListSlug={activeListSlug}
        isLoading={isLoading}
        isCreatingList={isCreatingList}
        newListName={newListName}
        setNewListName={setNewListName}
        onCreateList={handleCreateList}
        onDeleteList={handleDeleteList}
        onSelectList={handleSelectList}
        isOpen={isMobileSidebarOpen}
      />

      <main className={styles.dashboardContent}>
        {isLoading ? (
          <div className={`${styles.dashboardWelcomeView} glass flex flex-col items-center justify-center py-12 animate-pulse`}>
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <h2>Loading...</h2>
          </div>
        ) : activeList ? (
          <>
            <button
              className={`${styles.mobileBackBtn} btn btn-secondary mb-4 animate-fade-in`}
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <ChevronLeft size={16} />
              <span>Back to Lists</span>
            </button>
            <TodoListWidget key={activeList.id} activeList={activeList} onRefresh={fetchLists} />
          </>
        ) : (
          <div className={`${styles.dashboardWelcomeView} glass animate-scale-up`}>
            <CheckCircle className={`${styles.welcomeLogo} text-primary`} size={64} />
            <h2>Welcome to To-Do List!</h2>
            <p>Select an existing task list or create a new one to get started.</p>

            <div className={styles.welcomeStats}>
              <div className={`${styles.statCard} glass-item`}>
                <span className={styles.statVal}>{totalListsCount}</span>
                <span className={styles.statLabel}>Total Lists</span>
              </div>
              <div className={`${styles.statCard} glass-item`}>
                <span className={styles.statVal}>{totalTasksCount}</span>
                <span className={styles.statLabel}>Total Tasks</span>
              </div>
              <div className={`${styles.statCard} glass-item`}>
                <span className={styles.statVal}>{completedTasksCount}</span>
                <span className={styles.statLabel}>Tasks Completed</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
