import styles from '../styles/Profile.module.css';

export default function ProfileForm({ form, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
        <label>
            First Name:
            <input type="text" name="firstName" value={form.firstName} onChange={onChange} required />
        </label>
        <label>
            Last Name:
            <input type="text" name="lastName" value={form.lastName} onChange={onChange} required />
        </label>
        <label>
            Weight (lbs):
            <input type="number" name="weight" value={form.weight} onChange={onChange} required />
        </label>
        <div className={styles.actionRow}>
            <button type="submit">Update Profile</button>
        </div>
    </form>
  );
}
