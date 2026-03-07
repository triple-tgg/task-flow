import { useState } from 'react';
import { Link2, Copy, Check, X, Trash2, Globe } from 'lucide-react';
import { projectsApi } from '../api/projects';

interface ShareModalProps {
    projectId: string;
    projectName: string;
    currentShareToken?: string | null;
    isPublic?: boolean;
    onClose: () => void;
    onUpdate: (shareToken: string | null, isPublic: boolean) => void;
}

export default function ShareModal({
    projectId,
    projectName,
    currentShareToken,
    isPublic,
    onClose,
    onUpdate,
}: ShareModalProps) {
    const [shareToken, setShareToken] = useState<string | null>(currentShareToken || null);
    const [isShared, setIsShared] = useState(isPublic || false);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = shareToken
        ? `${window.location.origin}/shared/${shareToken}`
        : '';

    const handleEnable = async () => {
        setIsLoading(true);
        try {
            const result = await projectsApi.enableShare(projectId);
            setShareToken(result.shareToken);
            setIsShared(true);
            onUpdate(result.shareToken, true);
        } catch (err) {
            console.error('Failed to enable share', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevoke = async () => {
        if (!confirm('Revoke this share link? Anyone with the link will lose access.')) return;
        setIsLoading(true);
        try {
            await projectsApi.revokeShare(projectId);
            setShareToken(null);
            setIsShared(false);
            onUpdate(null, false);
        } catch (err) {
            console.error('Failed to revoke share', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                <div className="share-modal-header">
                    <h3><Globe size={18} /> Share Project</h3>
                    <button className="btn-icon-sm" onClick={onClose}><X size={16} /></button>
                </div>

                <div className="share-modal-body">
                    <p className="share-modal-desc">
                        Share <strong>{projectName}</strong> with a public link.
                        Anyone with the link can <strong>view</strong> the Kanban board (read-only).
                    </p>

                    {isShared && shareToken ? (
                        <div className="share-link-section">
                            <div className="share-link-row">
                                <div className="share-link-input">
                                    <Link2 size={14} />
                                    <span>{shareUrl}</span>
                                </div>
                                <button
                                    className="btn-share-copy"
                                    onClick={handleCopy}
                                >
                                    {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                                </button>
                            </div>

                            <div className="share-status">
                                <span className="share-status-dot active" />
                                Public link is active
                            </div>

                            <button
                                className="btn-share-revoke"
                                onClick={handleRevoke}
                                disabled={isLoading}
                            >
                                <Trash2 size={14} />
                                Revoke Link
                            </button>
                        </div>
                    ) : (
                        <div className="share-enable-section">
                            <div className="share-status">
                                <span className="share-status-dot" />
                                Public link is disabled
                            </div>

                            <button
                                className="btn-share-enable"
                                onClick={handleEnable}
                                disabled={isLoading}
                            >
                                <Link2 size={16} />
                                {isLoading ? 'Generating...' : 'Enable Public Link'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
