import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FolderKanban, ListTodo } from 'lucide-react';
import { searchApi } from '../api/search';

interface SearchResult {
    tasks: Array<{
        id: string;
        title: string;
        status: string;
        priority: string;
        projectId: string;
        project: { name: string };
    }>;
    projects: Array<{
        id: string;
        name: string;
        description?: string;
    }>;
}

export default function GlobalSearch() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

    // Keyboard shortcut: Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery('');
            setResults(null);
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!query || query.length < 2) {
            setResults(null);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const data = await searchApi.search(query);
                setResults(data);
            } catch {
                setResults(null);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    }, [query]);

    const handleSelect = (type: 'project' | 'task', id: string, projectId?: string) => {
        setIsOpen(false);
        if (type === 'project') {
            navigate(`/projects/${id}`);
        } else if (type === 'task' && projectId) {
            navigate(`/projects/${projectId}`);
        }
    };

    const totalResults = results
        ? results.tasks.length + results.projects.length
        : 0;

    if (!isOpen) {
        return (
            <button className="search-trigger" onClick={() => setIsOpen(true)}>
                <Search size={16} />
                <span>Search...</span>
                <kbd>⌘K</kbd>
            </button>
        );
    }

    return (
        <div className="command-palette-overlay" onClick={() => setIsOpen(false)}>
            <div className="command-palette" onClick={(e) => e.stopPropagation()}>
                <div className="command-palette-input">
                    <Search size={18} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search tasks and projects..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button className="btn-icon-sm" onClick={() => setQuery('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="command-palette-results">
                    {isSearching && (
                        <div className="search-loading">
                            <div className="spinner" style={{ width: 20, height: 20 }} />
                            Searching...
                        </div>
                    )}

                    {!isSearching && results && totalResults === 0 && (
                        <div className="search-empty">No results for "{query}"</div>
                    )}

                    {results && results.projects.length > 0 && (
                        <div className="search-group">
                            <div className="search-group-label">Projects</div>
                            {results.projects.map((p) => (
                                <button
                                    key={p.id}
                                    className="search-result-item"
                                    onClick={() => handleSelect('project', p.id)}
                                >
                                    <FolderKanban size={16} />
                                    <div className="search-result-text">
                                        <span className="search-result-title">{p.name}</span>
                                        {p.description && (
                                            <span className="search-result-desc">{p.description}</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {results && results.tasks.length > 0 && (
                        <div className="search-group">
                            <div className="search-group-label">Tasks</div>
                            {results.tasks.map((t) => (
                                <button
                                    key={t.id}
                                    className="search-result-item"
                                    onClick={() => handleSelect('task', t.id, t.projectId)}
                                >
                                    <ListTodo size={16} />
                                    <div className="search-result-text">
                                        <span className="search-result-title">{t.title}</span>
                                        <span className="search-result-desc">
                                            {t.project.name} · {t.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {!isSearching && !results && (
                        <div className="search-hint">
                            Type at least 2 characters to search
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
