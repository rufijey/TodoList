import React from 'react';
import { ListTodo, Trash2 } from 'lucide-react';
import type { TodoList } from '../model/types';

interface SidebarListItemProps {
  list: TodoList;
  isActive: boolean;
  isShared: boolean;
  onSelectList: (slug: string) => void;
  onDeleteList?: (e: React.MouseEvent, id: string) => void;
  styles: {
    readonly [key: string]: string;
  };
}

export const SidebarListItem: React.FC<SidebarListItemProps> = ({
  list,
  isActive,
  isShared,
  onSelectList,
  onDeleteList,
  styles,
}) => {
  return (
    <div
      className={`${styles.listItem} ${isShared ? styles.shared : ''} ${
        isActive ? styles.active : ''
      }`}
      onClick={() => onSelectList(list.slug)}
    >
      <div className={styles.itemTitleSection}>
        <ListTodo size={16} />
        {isShared ? (
          <div className={styles.listMetaInfo}>
            <span className={styles.listName}>{list.name}</span>
            <span className={styles.sharedAuthor}>{list.sharedBy}</span>
          </div>
        ) : (
          <span className={styles.listName}>{list.name}</span>
        )}
      </div>
      <div className={styles.itemActions}>
        {isShared && (
          <span
            className={`${styles.badgePermission} ${
              list.permission === 'WRITE' ? styles.write : styles.read
            }`}
          >
            {list.permission === 'WRITE' ? 'W' : 'R'}
          </span>
        )}
        <span className={styles.badgeCount}>{list.todos.length}</span>
        {!isShared && onDeleteList && (
          <button
            className={styles.btnDeleteList}
            onClick={(e) => onDeleteList(e, list.id)}
            title="Delete List"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
