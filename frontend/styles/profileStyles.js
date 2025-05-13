export const profileStyles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        py: 4,
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Segoe UI, sans-serif',
    },
    editButton: {
        mb: 2,
        px: 2,
        py: 1,
        backgroundColor: '#444',
        color: '#fff',
        borderRadius: 1,
        fontWeight: 500,
        '&:hover': {
            backgroundColor: '#666',
        },
    },
    statusText: (type) => ({
        mt: 2,
        fontWeight: 500,
        color: type === 'success' ? '#4caf50' : '#ff4d4f',
    }),
    profileCard: {
        mt: 4,
        backgroundColor: '#2a2a2a',
        px: 4,
        py: 3,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)',
        maxWidth: 500,
        width: '100%',
        textAlign: 'center',
    },
    avatar: {
        width: 128,
        height: 128,
        mt: 2,
        mb: 1,
        mx: 'auto',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    loadingText: {
        color: '#aaa',
        textAlign: 'center',
        mt: 4,
        fontSize: '1.2rem',
    },
    errorText: {
        color: '#ff4d4f',
        textAlign: 'center',
        mt: 4,
        fontSize: '1.1rem',
    },
};

const profileFormStyles = {
    formInputs: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
        marginBottom: '1.5rem',
    },
    textField: {
        '& .MuiInputLabel-root': {
            color: '#C57B57',
        },
        backgroundColor: '#CDD5D1',
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#c7c7c7',
            borderWidth: '3px',
        },
    },
    uploadButton: {
        borderColor: '#888',
        color: '#444',
        fontWeight: 500,
        '&:hover': {
            backgroundColor: '#f0f0f0',
        },
    },
    buttonRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
    },
    submitButton: {
        px: 3,
        py: 1,
        borderRadius: 2,
        backgroundColor: '#C57B57',
        color: 'white',
        fontWeight: 600,
        '&:hover': {
            backgroundColor: '#A96240',
        },
    },
    secondaryButton: {
        px: 3,
        py: 1,
        borderRadius: 2,
        backgroundColor: '#a2a2a2',
        color: 'white',
        fontWeight: 500,
        '&:hover': {
            backgroundColor: '#8a8a8a',
        },
    },
};

export default profileFormStyles;
