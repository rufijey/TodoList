import React from 'react';
import { Edit2, Check, X, ShieldAlert, Share2 } from 'lucide-react';
import type { TodoList } from '../../../entities/todo-list/model/types';
import styles from './TodoListWidget.module.css';

interface TodoListHeaderProps {
  activeList: TodoList;
  isOwner: boolean;
  hasWriteAccess: boolean;
  isEditingTitle: boolean;
  editedTitle: string;
  onEditTitleChange: (val: string) => void;
  onUpdateTitle: () => void;
  onCancelEditTitle: () => void;
  onEditTitleStart: () => void;
  onOpenShareModal: () => void;
}

export const TodoListHeader: React.FC<TodoListHeaderProps> = ({
  activeList,
  isOwner,
  hasWriteAccess,
  isEditingTitle,
  editedTitle,
  onEditTitleChange,
  onUpdateTitle,
  onCancelEditTitle,
  onEditTitleStart,
  onOpenShareModal,
}) => {
  return (
    <div className={`${styles.todolistHeader} glass mb-6`}>
      <div className={styles.titleSection}>
        {isEditingTitle ? (
          <div className={styles.editTitleForm}>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              onBlur={onUpdateTitle}
              onKeyDown={(e) => e.key === 'Enter' && onUpdateTitle()}
              autoFocus
            />
            <button onClick={onUpdateTitle} className="btn-icon text-success">
              <Check size={18} />
            </button>
            <button onClick={onCancelEditTitle} className="btn-icon text-danger">
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className={styles.displayTitle}>
            <h2>{activeList.name}</h2>
            {isOwner && (
              <button
                onClick={onEditTitleStart}
                className="btn-icon btn-edit"
                title="Rename List"
              >
                <Edit2 size={16} />
              </button>
            )}
          </div>
        )}

        {activeList.role === 'SHARED' && (
          <p className={styles.sharedBadgeLabel}>
            Shared list by: <span className={styles.highlight}>{activeList.sharedBy}</span>
          </p>
        )}
      </div>

      <div className={styles.actionSection}>
        {!hasWriteAccess && (
          <div className={`${styles.readOnlyNotice} animate-pulse`}>
            <ShieldAlert size={16} />
            <span>Read-Only</span>
          </div>
        )}

        {isOwner && (
          <button
            onClick={onOpenShareModal}
            className="btn btn-secondary btn-share btn-animate"
            type="button"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        )}
      </div>
    </div>
  );
};
