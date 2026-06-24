import React, { useState, useEffect } from 'react';
import * as api from '../../../entities/todo-list/api';
import { X, Trash2, Shield, User, Send, Loader2, Mail, Users } from 'lucide-react';
import styles from './ShareModal.module.css';

interface ShareRecord {
  id: string;
  listId: string;
  sharedWithEmail: string;
  permission: 'READ' | 'WRITE';
  createdAt: string;
}

interface ShareModalProps {
  listId: string;
  listName: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ listId, listName, onClose }) => {
  const [email, setEmail] = useState<string>('');
  const [permission, setPermission] = useState<'READ' | 'WRITE'>('READ');
  const [shares, setShares] = useState<ShareRecord[]>([]);
  const [isLoadingShares, setIsLoadingShares] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchShares();
  }, [listId]);

  const fetchShares = async () => {
    setIsLoadingShares(true);
    setModalError(null);
    try {
      const res = await api.getTodoListShares(listId);
      setShares(res.data);
    } catch (err: any) {
      console.error('Error fetching shares', err);
      setModalError('Failed to load share settings');
    } finally {
      setIsLoadingShares(false);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setModalError(null);
    setSuccessMsg(null);

    try {
      await api.shareTodoList(listId, email.trim().toLowerCase(), permission);

      setSuccessMsg(`Access successfully granted to ${email}`);
      setEmail('');
      setPermission('READ');
      await fetchShares();

      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to share To-Do list';
      setModalError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (targetEmail: string) => {
    setModalError(null);
    setSuccessMsg(null);
    try {
      await api.revokeTodoListShare(listId, targetEmail);
      setShares(shares.filter(s => s.sharedWithEmail !== targetEmail));
      setSuccessMsg(`Access revoked for ${targetEmail}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to revoke access';
      setModalError(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.modalCard} glass animate-scale-up`}>
        <div className={styles.modalHeader}>
          <div>
            <h3>Share To-Do List</h3>
            <p className={styles.modalSubtitle}>{listName}</p>
          </div>
          <button className="btn-icon" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {modalError && <div className="alert alert-danger mb-4">{modalError}</div>}
          {successMsg && <div className="alert alert-success mb-4">{successMsg}</div>}

          <form onSubmit={handleShare} className={styles.shareForm}>
            <div className="form-group">
              <label htmlFor="shareEmail">Recipient Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="shareEmail"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Permission Level</label>
              <div className={styles.permissionSelector}>
                <button
                  type="button"
                  className={`${styles.permissionBtn} ${permission === 'READ' ? styles.active : ''}`}
                  onClick={() => setPermission('READ')}
                >
                  <Shield size={16} />
                  <div className={styles.btnTextWrapper}>
                    <span className={styles.btnTitle}>Read-Only</span>
                    <span className={styles.btnDesc}>Cannot modify tasks</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`${styles.permissionBtn} ${permission === 'WRITE' ? styles.active : ''}`}
                  onClick={() => setPermission('WRITE')}
                >
                  <Shield size={16} />
                  <div className={styles.btnTextWrapper}>
                    <span className={styles.btnTitle}>Read-Write</span>
                    <span className={styles.btnDesc}>Can add/edit/delete tasks</span>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-animate"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <Send size={16} />
                  <span>Share List</span>
                </>
              )}
            </button>
          </form>

          <div className={styles.sharesSection}>
            <h4 className={styles.sectionHeader}>
              <Users size={16} />
              <span>Users with Access</span>
            </h4>

            {isLoadingShares ? (
              <div className={styles.loadingContainer}>
                <Loader2 className="animate-spin" size={24} />
                <p>Loading share list...</p>
              </div>
            ) : shares.length === 0 ? (
              <div className={styles.emptySharesState}>
                <Users size={32} className={styles.emptyIcon} />
                <p>This list has not been shared with anyone yet.</p>
              </div>
            ) : (
              <div className={styles.sharesList}>
                {shares.map((share) => (
                  <div key={share.id} className={`${styles.shareItem} glass-item`}>
                    <div className={styles.shareItemInfo}>
                      <User size={16} className={styles.userIcon} />
                      <div className={styles.userDetails}>
                        <span className={styles.shareEmail}>{share.sharedWithEmail}</span>
                        <span className={styles.shareRole}>
                          {share.permission === 'WRITE' ? 'Read-Write access' : 'Read-only access'}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleRevoke(share.sharedWithEmail)}
                      title="Revoke Access"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
