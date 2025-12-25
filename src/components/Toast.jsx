import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

// Create Toast Context
const ToastContext = createContext();

// Toast Provider Component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'error') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showSuccess = useCallback((message) => addToast(message, 'success'), [addToast]);
    const showError = useCallback((message) => addToast(message, 'error'), [addToast]);
    const showWarning = useCallback((message) => addToast(message, 'warning'), [addToast]);

    return (
        <ToastContext.Provider value={{ showSuccess, showError, showWarning }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

// Hook to use toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div style={styles.container}>
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

// Individual Toast Component
const Toast = ({ toast, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300);
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsExiting(true), 4700);
        return () => clearTimeout(timer);
    }, []);

    const getIcon = () => {
        switch (toast.type) {
            case 'success': return '✓';
            case 'warning': return '⚠';
            case 'error': default: return '✕';
        }
    };

    const getColors = () => {
        switch (toast.type) {
            case 'success': return { bg: '#10b981', icon: '#ecfdf5' };
            case 'warning': return { bg: '#f59e0b', icon: '#fffbeb' };
            case 'error': default: return { bg: '#ef4444', icon: '#fef2f2' };
        }
    };

    const colors = getColors();

    return (
        <div style={{
            ...styles.toast,
            backgroundColor: colors.bg,
            animation: isExiting ? 'slideOut 0.3s ease forwards' : 'slideIn 0.3s ease forwards'
        }}>
            <style>{keyframes}</style>
            <div style={{ ...styles.icon, backgroundColor: colors.icon, color: colors.bg }}>
                {getIcon()}
            </div>
            <span style={styles.message}>{toast.message}</span>
            <button onClick={handleClose} style={styles.closeBtn}>×</button>
        </div>
    );
};

// Animation keyframes
const keyframes = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;

// Styles
const styles = {
    container: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px'
    },
    toast: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        minWidth: '300px'
    },
    icon: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '12px',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    message: {
        flex: 1,
        lineHeight: '1.4'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer',
        opacity: '0.7',
        padding: '0 0 0 12px',
        lineHeight: '1'
    }
};

export default ToastProvider;
