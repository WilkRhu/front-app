// pages/index.js
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from 'Layouts';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <Layout title="Home">
      <div>Loading...</div>
    </Layout>
  );
};

export default Home;
