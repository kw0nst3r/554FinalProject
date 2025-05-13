import {Box, TextField, Button} from '@mui/material';
import profileFormStyles from '../styles/profileStyles';

const fields = [
    {label: 'First Name', name: 'firstName', type: 'text'},
    {label: 'Last Name', name: 'lastName', type: 'text'},
    {label: 'Weight (lbs)', name: 'weight', type: 'number'},
];

export default function ProfileForm({form, onChange, onSubmit, onFileSelect}) {
    return (
        <Box component="form" onSubmit={onSubmit} sx={profileFormStyles.formContainer}>
            {fields.map(({ label, name, type }) => (
                <TextField key={name} label={label} name={name} type={type} value={form[name]} onChange={onChange} required fullWidth sx={profileFormStyles.textField}/>
            ))}
            <Button variant="outlined" component="label" sx={profileFormStyles.uploadButton}>
                Upload Profile Photo
                <input type="file" hidden accept="image/*" onChange={onFileSelect} />
            </Button>
            {form.photoUrl && (
                <Box component="img" src={form.photoUrl} alt="Preview" sx={{width: 128, height: 128, borderRadius: '50%', objectFit: 'cover', mx: 'auto', mt: 2}} />
            )}
            <Button type="submit" sx={profileFormStyles.submitButton}>
                Update Profile
            </Button>
        </Box>
    );
}
