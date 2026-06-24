import React, { useState } from 'react';
import * as todoApi from '../../../entities/todo/api';
import * as todoListApi from '../../../entities/todo-list/api';
import { ShareModal } from '../../../features/todo-list/ui/ShareModal';
import type { TodoList } from '../../../entities/todo-list/model/types';
import { Plus } from 'lucide-react';
import { TodoListHeader } from './TodoListHeader';
import { KanbanBoard } from './KanbanBoard';
import styles from './TodoListWidget.module.css';

interface TodoListWidgetProps {
  activeList: TodoList;
  onRefresh: () => Promise<void>;
}

export const TodoListWidget: React.FC<TodoListWidgetProps> = ({
  activeList,
  onRefresh,
}) => {
  const [newTodoTitle, setNewTodoTitle] = useState<string>('');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>(activeList.name);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isOwner = activeList.role === 'OWNER';
  const hasWriteAccess = activeList.permission === 'WRITE';

  const submitTodo = async () => {
    if (!newTodoTitle.trim() || !hasWriteAccess || isLoading) return;

    setIsLoading(true);
    try {
      await todoApi.createTodo(activeList.id, newTodoTitle.trim());
      setNewTodoTitle('');
      await onRefresh();
    } catch (err) {
      console.error('Error adding todo', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitTodo();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitTodo();
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!hasWriteAccess) return;

    try {
      await todoApi.deleteTodo(id);
      await onRefresh();
    } catch (err) {
      console.error('Error deleting todo', err);
    }
  };

  const handleUpdateTitle = async () => {
    if (!isOwner || !editedTitle.trim() || editedTitle === activeList.name) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await todoListApi.renameTodoList(activeList.id, editedTitle.trim());
      setIsEditingTitle(false);
      await onRefresh();
    } catch (err) {
      console.error('Error updating list title', err);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!hasWriteAccess) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED') => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData('text/plain');
    if (!todoId || !hasWriteAccess) return;

    try {
      await todoApi.updateTodoStatus(todoId, targetStatus);
      await onRefresh();
    } catch (err) {
      console.error('Error dropping task', err);
    }
  };

  const totalTodos = activeList.todos.length;
  const completedTodos = activeList.todos.filter(t => t.status === 'COMPLETED').length;
  const percentComplete = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const todoTasks = activeList.todos.filter((t) => t.status === 'TO_DO');
  const inProgressTasks = activeList.todos.filter((t) => t.status === 'IN_PROGRESS');
  const completedTasks = activeList.todos.filter((t) => t.status === 'COMPLETED');

  return (
    <div className={`${styles.todolistView} animate-fade-in`}>
      <TodoListHeader
        activeList={activeList}
        isOwner={isOwner}
        hasWriteAccess={hasWriteAccess}
        isEditingTitle={isEditingTitle}
        editedTitle={editedTitle}
        onEditTitleChange={setEditedTitle}
        onUpdateTitle={handleUpdateTitle}
        onCancelEditTitle={() => {
          setIsEditingTitle(false);
          setEditedTitle(activeList.name);
        }}
        onEditTitleStart={() => setIsEditingTitle(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {totalTodos > 0 && (
        <div className={`${styles.progressCard} glass mb-6`}>
          <div className={styles.progressInfo}>
            <span>Completion Progress</span>
            <span className={styles.progressNumbers}>
              {completedTodos} of {totalTodos} ({percentComplete}%)
            </span>
          </div>
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBarFill} style={{ width: `${percentComplete}%` }}></div>
          </div>
        </div>
      )}

      {hasWriteAccess && (
        <form onSubmit={handleAddTodo} className={`${styles.addTodoForm} glass mb-6`}>
          <textarea
            placeholder="Add a new task..."
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            className="btn btn-primary btn-animate"
            disabled={isLoading || !newTodoTitle.trim()}
          >
            <Plus size={20} />
          </button>
        </form>
      )}

      <KanbanBoard
        todoTasks={todoTasks}
        inProgressTasks={inProgressTasks}
        completedTasks={completedTasks}
        hasWriteAccess={hasWriteAccess}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDeleteTodo={handleDeleteTodo}
        onDragStart={handleDragStart}
      />

      {isShareModalOpen && (
        <ShareModal
          listId={activeList.id}
          listName={activeList.name}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
};
