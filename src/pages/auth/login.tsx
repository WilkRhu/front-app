import { Button } from '@paljs/ui/Button';
import { InputGroup } from '@paljs/ui/Input';
import { Checkbox } from '@paljs/ui/Checkbox';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Auth, { Group } from 'components/Auth';
import Socials from 'components/Auth/Socials';
import Layout from 'Layouts';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const onCheckbox = () => {};

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        router.push('/dashboard');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('An error occurred while logging in.');
    }
  };

  return (
    <Layout title="Login">
      <Auth title="Login" subTitle="Hello! Login with your email">
        <form onSubmit={handleLogin}>
          <InputGroup fullWidth>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup fullWidth>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
          <Group>
            <Checkbox checked onChange={onCheckbox}>
              Remember me
            </Checkbox>
            <Link href="/auth/request-password">
              <a>Forgot Password?</a>
            </Link>
          </Group>
          <Button status="Success" type="submit" shape="SemiRound" fullWidth>
            Login
          </Button>
        </form>
        <Socials />
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register">
            <a>Register</a>
          </Link>
        </p>
      </Auth>
    </Layout>
  );
}
