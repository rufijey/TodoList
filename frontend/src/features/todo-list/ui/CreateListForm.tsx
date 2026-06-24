import React from 'react';
import { Plus, Loader2 } from 'lucide-react';

interface CreateListFormProps {
  newListName: string;
  setNewListName: (val: string) => void;
  isCreatingList: boolean;
  onCreateList: (e: React.FormEvent) => void;
  styles: {
    readonly [key: string]: string;
  };
}

export const CreateListForm: React.FC<CreateListFormProps> = ({
  newListName,
  setNewListName,
  isCreatingList,
  onCreateList,
  styles,
}) => {
  return (
    <form onSubmit={onCreateList} className={`${styles.createListForm} border-bottom`}>
      <input
        type="text"
        placeholder="New List..."
        value={newListName}
        onChange={(e) => setNewListName(e.target.value)}
        disabled={isCreatingList}
        required
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={isCreatingList || !newListName.trim()}
      >
        {isCreatingList ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Plus size={16} />
        )}
      </button>
    </form>
  );
};
