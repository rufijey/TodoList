import React from 'react';
import { TodoCard } from '../../../entities/todo';
import type { Todo } from '../../../entities/todo';
import styles from './TodoListWidget.module.css';

interface KanbanBoardProps {
  todoTasks: Todo[];
  inProgressTasks: Todo[];
  completedTasks: Todo[];
  hasWriteAccess: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetStatus: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED') => void;
  onDeleteTodo: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  todoTasks,
  inProgressTasks,
  completedTasks,
  hasWriteAccess,
  onDragOver,
  onDrop,
  onDeleteTodo,
  onDragStart,
}) => {
  return (
    <div className={styles.kanbanBoard}>
      <div
        className={`${styles.kanbanColumn} glass`}
        onDragOver={hasWriteAccess ? onDragOver : undefined}
        onDrop={hasWriteAccess ? (e) => onDrop(e, 'TO_DO') : undefined}
      >
        <div className={`${styles.columnHeader} border-bottom`}>
          <h3>To Do</h3>
          <span className="badge-count">{todoTasks.length}</span>
        </div>
        <div className={styles.columnTasks}>
          {todoTasks.length === 0 ? (
            <p className="no-data py-6">{hasWriteAccess ? 'Drag tasks here' : 'No tasks'}</p>
          ) : (
            todoTasks.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                hasWriteAccess={hasWriteAccess}
                onDelete={onDeleteTodo}
                onDragStart={onDragStart}
                styles={styles}
              />
            ))
          )}
        </div>
      </div>

      <div
        className={`${styles.kanbanColumn} glass`}
        onDragOver={hasWriteAccess ? onDragOver : undefined}
        onDrop={hasWriteAccess ? (e) => onDrop(e, 'IN_PROGRESS') : undefined}
      >
        <div className={`${styles.columnHeader} border-bottom`}>
          <h3>In Progress</h3>
          <span className="badge-count">{inProgressTasks.length}</span>
        </div>
        <div className={styles.columnTasks}>
          {inProgressTasks.length === 0 ? (
            <p className="no-data py-6">{hasWriteAccess ? 'Drag tasks here' : 'No tasks'}</p>
          ) : (
            inProgressTasks.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                hasWriteAccess={hasWriteAccess}
                onDelete={onDeleteTodo}
                onDragStart={onDragStart}
                styles={styles}
              />
            ))
          )}
        </div>
      </div>

      <div
        className={`${styles.kanbanColumn} glass`}
        onDragOver={hasWriteAccess ? onDragOver : undefined}
        onDrop={hasWriteAccess ? (e) => onDrop(e, 'COMPLETED') : undefined}
      >
        <div className={`${styles.columnHeader} border-bottom`}>
          <h3>Completed</h3>
          <span className="badge-count">{completedTasks.length}</span>
        </div>
        <div className={styles.columnTasks}>
          {completedTasks.length === 0 ? (
            <p className="no-data py-6">{hasWriteAccess ? 'Drag tasks here' : 'No tasks'}</p>
          ) : (
            completedTasks.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                hasWriteAccess={hasWriteAccess}
                onDelete={onDeleteTodo}
                onDragStart={onDragStart}
                styles={styles}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
