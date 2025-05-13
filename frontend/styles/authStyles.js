export const authStyles = {
    authContainer: {
        display: 'flex',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#444554',
    },
    authLeft: {
        flex: 1,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#D7D9D7',
    },
    title: {
        marginTop: '5rem',
        marginBottom: 'auto',
    },
    authRight: {
        flex: 1,
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        margin: '2rem 0',
        width: '250px',
        height: 'auto',
    },
    authCard: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#D7D9D7',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflowY: 'auto',
    },
};
const sharedStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
    },
    formBody: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
    formInputs: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
        marginBottom: '1.5rem',
    },
    textField: {
        backgroundColor: '#CDD5D1',
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#c7c7c7',
            borderWidth: '3px',
        },
    },
    errorText: {
        color: '#C16E70',
        fontSize: '0.8rem',
        textAlign: 'center',
        marginBottom: '16px',
    },
    buttonRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
    },
    primaryButton: {
        px: 3,
        py: 1,
        borderRadius: 2,
        backgroundColor: '#C57B57',
        color: 'white',
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
        '&:hover': {
            backgroundColor: '#8a8a8a',
        },
    },
    googleButton: {
        marginTop: '1.5rem',
        minWidth: 220,
        padding: '0.5rem 1rem',
        backgroundColor: '#E5E7E6',
        color: '#555',
        fontSize: '13px',
        fontWeight: 500,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        '&:hover': {
            backgroundColor: '#D1D3D2',
            filter: 'brightness(0.95)',
        },
    },
};

export default sharedStyles;
