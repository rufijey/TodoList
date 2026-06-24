import React from 'react';
import { useAuthStore } from '../../../entities/user/model/store';
import { SidebarListItem } from '../../../entities/todo-list';
import { CreateListForm } from '../../../features/todo-list';
import type { TodoList } from '../../../entities/todo-list';
import {
  LogOut,
  Folder,
  FolderHeart,
  Loader2
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  ownedLists: TodoList[];
  sharedLists: TodoList[];
  activeListSlug: string | undefined;
  isLoading: boolean;
  isCreatingList: boolean;
  newListName: string;
  setNewListName: (val: string) => void;
  onCreateList: (e: React.FormEvent) => void;
  onDeleteList: (e: React.MouseEvent, id: string) => void;
  onSelectList: (slug: string) => void;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  ownedLists,
  sharedLists,
  activeListSlug,
  isLoading,
  isCreatingList,
  newListName,
  setNewListName,
  onCreateList,
  onDeleteList,
  onSelectList,
  isOpen,
}) => {
  const { user, logout } = useAuthStore();

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} glass`}>
      <div className={`${styles.header} border-bottom`}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {user?.email ? user.email[0].toUpperCase() : ''}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userEmail} title={user?.email}>{user?.email}</span>
            <span className={styles.userRole}>User</span>
          </div>
        </div>
        <button className={`${styles.btnLogout} btn-icon`} onClick={logout} title="Log Out">
          <LogOut size={18} />
        </button>
      </div>

      <CreateListForm
        newListName={newListName}
        setNewListName={setNewListName}
        isCreatingList={isCreatingList}
        onCreateList={onCreateList}
        styles={styles}
      />

      <div className={styles.listsScrollable}>
        {isLoading ? (
          <div className={styles.loading}>
            <Loader2 className="animate-spin" size={24} />
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <div className={styles.listSection}>
              <h4 className={styles.sectionTitle}>
                <Folder size={14} />
                <span>My Lists ({ownedLists.length})</span>
              </h4>
              <div className={styles.listItems}>
                {ownedLists.length === 0 ? (
                  <p className={styles.noData}>Create your first list</p>
                ) : (
                  ownedLists.map((list) => (
                    <SidebarListItem
                      key={list.id}
                      list={list}
                      isActive={activeListSlug === list.slug}
                      isShared={false}
                      onSelectList={onSelectList}
                      onDeleteList={onDeleteList}
                      styles={styles}
                    />
                  ))
                )}
              </div>
            </div>

            <div className={`${styles.listSection} mt-6`}>
              <h4 className={styles.sectionTitle}>
                <FolderHeart size={14} />
                <span>Shared Lists ({sharedLists.length})</span>
              </h4>
              <div className={styles.listItems}>
                {sharedLists.length === 0 ? (
                  <p className={styles.noData}>No shared lists available</p>
                ) : (
                  sharedLists.map((list) => (
                    <SidebarListItem
                      key={list.id}
                      list={list}
                      isActive={activeListSlug === list.slug}
                      isShared={true}
                      onSelectList={onSelectList}
                      styles={styles}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
