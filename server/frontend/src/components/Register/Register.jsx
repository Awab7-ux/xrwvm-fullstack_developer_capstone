import { useState } from 'react';

export default function Register() {
  const [form, setForm] = useState({ username: '', firstName: '', lastName: '', email: '', password: '' });
  const [status, setStatus] = useState('');

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setStatus('');
    try {
      const response = await fetch('/djangoapp/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Registration failed');
      setStatus('Registration complete.');
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <label>Username<input name="username" autoComplete="username" required value={form.username} onChange={update} /></label>
      <label>First Name<input name="firstName" autoComplete="given-name" required value={form.firstName} onChange={update} /></label>
      <label>Last Name<input name="lastName" autoComplete="family-name" required value={form.lastName} onChange={update} /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required value={form.email} onChange={update} /></label>
      <label>Password<input name="password" type="password" autoComplete="new-password" required value={form.password} onChange={update} /></label>
      <button type="submit">Register</button>
      {status && <p role="status">{status}</p>}
    </form>
  );
}