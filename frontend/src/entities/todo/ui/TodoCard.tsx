import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Todo } from '../model/types';

interface TodoCardProps {
  todo: Todo;
  hasWriteAccess: boolean;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  styles: {
    readonly [key: string]: string;
  };
}

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  hasWriteAccess,
  onDelete,
  onDragStart,
  styles,
}) => {
  return (
    <div
      className={`${styles.todoItem} ${styles.kanbanTaskCard} glass-item ${
        todo.status === 'COMPLETED' ? styles.completed : ''
      } ${!hasWriteAccess ? styles.readOnly : ''}`}
      draggable={hasWriteAccess}
      onDragStart={(e) => onDragStart(e, todo.id)}
    >
      <div className={styles.todoItemLeft}>
        <span className={styles.todoTitle}>{todo.title}</span>
      </div>

      {hasWriteAccess && (
        <button
          className="btn-icon btn-icon-danger btn-delete-todo"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(todo.id);
          }}
          title="Delete task"
          type="button"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};
